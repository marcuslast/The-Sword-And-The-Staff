import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    townAPI,
    RateLimitError,
    TownResponse,
    Town,
    BuildingConfig,
} from '../services/townApi';

// Polling and backoff configuration
const BASE_POLL_MS = 30_000;        // 30s between successful polls
const MIN_BETWEEN_MS = 5_000;       // Dedup: ignore calls within 5s unless forced
const MAX_BACKOFF_MS = 5 * 60_000;  // cap at 5 minutes
const JITTER_MS = 500;              // de-sync clients a bit
const FIRST_FAIL_RETRY_MS = 3_000;  // retry quickly on the very first failure

type PendingResources = Record<string, number>;

export default function useTownLogic() {
    // Data
    const [town, setTown] = useState<Town | null>(null);
    const [buildingConfigs, setBuildingConfigs] = useState<BuildingConfig[]>([]);

    // UX state
    const [loading, setLoading] = useState<boolean>(true); // start in loading
    const [error, setError] = useState<string | null>(null);

    // Action flags
    const [collectingResources, setCollectingResources] = useState<boolean>(false);
    const [building, setBuilding] = useState<boolean>(false);
    const [upgrading, setUpgrading] = useState<boolean>(false);
    const [speedingUp, setSpeedingUp] = useState<boolean>(false);

    // Polling control
    const inFlightRef = useRef<Promise<void> | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const lastFetchAtRef = useRef<number>(0);
    const backoffRef = useRef<number>(0);
    const pollTimeoutRef = useRef<number | null>(null);
    const pollingEnabledRef = useRef<boolean>(true);
    const hasLoadedOnceRef = useRef<boolean>(false);

    // Derived data
    const pendingResources: PendingResources = useMemo(() => {
        return town?.pendingProduction || {};
    }, [town]);
    const hasPendingResources = useMemo(() => {
        return Object.values(pendingResources).some(v => (v || 0) > 0);
    }, [pendingResources]);

    // Internal helpers
    const clearPollTimeout = () => {
        if (pollTimeoutRef.current) {
            window.clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
        }
    };

    const scheduleNextPoll = (ms: number) => {
        clearPollTimeout();
        const delay = Math.max(0, ms) + Math.floor(Math.random() * JITTER_MS);
        pollTimeoutRef.current = window.setTimeout(() => {
            if (pollingEnabledRef.current) {
                loadTown().catch(() => {/* handled in loadTown */});
            }
        }, delay);
    };

    const computeNextInterval = () => {
        // If we are currently backing off due to errors/rate limit, use that
        if (backoffRef.current > 0) return backoffRef.current;
        // Slow down when tab is hidden
        const hidden = typeof document !== 'undefined' && document.hidden;
        return hidden ? BASE_POLL_MS * 2 : BASE_POLL_MS;
    };

    const handleVisibility = () => {
        // Recompute and schedule based on current visibility state
        scheduleNextPoll(computeNextInterval());
    };

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Core loader with dedupe + abort + backoff
    const loadTown = useCallback(async (force = false) => {
        // Deduplicate concurrent calls
        if (inFlightRef.current) return inFlightRef.current;

        const now = Date.now();
        if (!force && now - lastFetchAtRef.current < MIN_BETWEEN_MS) {
            // Too soon since last fetch; just schedule a poll and bail
            scheduleNextPoll(computeNextInterval());
            return;
        }

        // Abort any previous request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const promise = (async () => {
            // Keep loading true until we have at least one success
            if (hasLoadedOnceRef.current) setLoading(true);
            setError(null);

            try {
                const resp: TownResponse = await townAPI.getTown(controller.signal);
                setTown(resp.town);
                setBuildingConfigs(resp.buildingConfigs);
                lastFetchAtRef.current = Date.now();
                hasLoadedOnceRef.current = true;
                // Reset backoff on success
                backoffRef.current = 0;
            } catch (e: any) {
                if (e?.name === 'AbortError') {
                    // do nothing; a newer request superseded this one
                    return;
                }
                if (e instanceof RateLimitError) {
                    // Respect server hint; on first failure, retry soon instead of long backoff
                    const retryMs = e.retryAfterMs ?? (hasLoadedOnceRef.current ? Math.min(MAX_BACKOFF_MS, (backoffRef.current || BASE_POLL_MS) * 2) : FIRST_FAIL_RETRY_MS);
                    backoffRef.current = retryMs;
                    setError(e.message);
                } else {
                    setError(e?.message || 'Failed to load town');
                    // On first failure, retry quickly; otherwise mild exponential backoff
                    backoffRef.current = hasLoadedOnceRef.current
                        ? Math.min(MAX_BACKOFF_MS, (backoffRef.current || BASE_POLL_MS) * 1.5)
                        : FIRST_FAIL_RETRY_MS;
                }
            } finally {
                inFlightRef.current = null;
                // If we've never loaded successfully, keep showing spinner instead of failure
                setLoading(!hasLoadedOnceRef.current ? true : false);
                // Schedule the next poll
                scheduleNextPoll(computeNextInterval());
            }
        })();

        inFlightRef.current = promise;
        return promise;
    }, []);

    // Start polling on mount; stop on unmount
    useEffect(() => {
        pollingEnabledRef.current = true;
        loadTown(true);
        scheduleNextPoll(computeNextInterval());
        return () => {
            pollingEnabledRef.current = false;
            abortRef.current?.abort();
            clearPollTimeout();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Optional external controls for polling
    const pausePolling = useCallback(() => {
        pollingEnabledRef.current = false;
        clearPollTimeout();
    }, []);
    const resumePolling = useCallback(() => {
        if (!pollingEnabledRef.current) {
            pollingEnabledRef.current = true;
            scheduleNextPoll(0);
        }
    }, []);

    // Utility: get config by type
    const getBuildingConfig = useCallback(
        (type: string) => buildingConfigs.find(cfg => cfg.type === type),
        [buildingConfigs]
    );

    // Utility: compute speedup cost (simple example; adjust as needed)
    const calculateSpeedupCost = useCallback((endTimeISO: string) => {
        const end = new Date(endTimeISO).getTime();
        const now = Date.now();
        const secondsLeft = Math.max(0, Math.ceil((end - now) / 1000));
        // Example pricing: 1 gem per 60s (always at least 1 if any time remains)
        return secondsLeft === 0 ? 0 : Math.max(1, Math.ceil(secondsLeft / 60));
    }, []);

    // Actions
    const collectResources = useCallback(async () => {
        setCollectingResources(true);
        setError(null);
        pausePolling();
        try {
            await townAPI.collectResources();
            await loadTown(true);
            return true;
        } catch (e: any) {
            if (e?.name !== 'AbortError') setError(e?.message || 'Failed to collect resources');
            return false;
        } finally {
            setCollectingResources(false);
            resumePolling();
        }
    }, [loadTown, pausePolling, resumePolling]);

    const buildBuilding = useCallback(async (x: number, y: number, type: string) => {
        setBuilding(true);
        setError(null);
        pausePolling();
        try {
            await townAPI.buildBuilding({ x, y, type });
            await loadTown(true);
            return true;
        } catch (e: any) {
            if (e?.name !== 'AbortError') setError(e?.message || 'Failed to start construction');
            return false;
        } finally {
            setBuilding(false);
            resumePolling();
        }
    }, [loadTown, pausePolling, resumePolling]);

    const upgradeBuilding = useCallback(async (x: number, y: number) => {
        setUpgrading(true);
        setError(null);
        pausePolling();
        try {
            await townAPI.upgradeBuilding({ x, y });
            await loadTown(true);
            return true;
        } catch (e: any) {
            if (e?.name !== 'AbortError') setError(e?.message || 'Failed to start upgrade');
            return false;
        } finally {
            setUpgrading(false);
            resumePolling();
        }
    }, [loadTown, pausePolling, resumePolling]);

    // Accept optional gemCost param for compatibility; backend request does not need it
    const speedUpBuilding = useCallback(async (x: number, y: number, _gemCost?: number) => {
        setSpeedingUp(true);
        setError(null);
        pausePolling();
        try {
            await townAPI.speedUpBuilding({ x, y });
            await loadTown(true);
            return true;
        } catch (e: any) {
            if (e?.name !== 'AbortError') setError(e?.message || 'Failed to speed up');
            return false;
        } finally {
            setSpeedingUp(false);
            resumePolling();
        }
    }, [loadTown, pausePolling, resumePolling]);

    return {
        // data
        town,
        buildingConfigs,

        // derived
        pendingResources,
        hasPendingResources,

        // status
        loading,
        error,
        collectingResources,
        building,
        upgrading,
        speedingUp,

        // operations
        loadTown,
        collectResources,
        buildBuilding,
        upgradeBuilding,
        speedUpBuilding,
        getBuildingConfig,
        calculateSpeedupCost,

        // polling controls (optional use)
        pausePolling,
        resumePolling,
    };
}
