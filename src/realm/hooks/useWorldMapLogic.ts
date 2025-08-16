import { useState, useEffect, useCallback } from 'react';
import { worldMapApi, Tile, WorldMapData } from '../services/worldMapApi';
import { useAuth } from '../../contexts/AuthContext';

interface UseWorldMapLogicReturn {
    mapData: Tile[];
    mapSize: number;
    version: number;
    loading: boolean;
    error: string | null;
    selectedTile: Tile | null;

    // Actions
    loadMap: (viewport?: { minQ: number; maxQ: number; minR: number; maxR: number }) => Promise<void>;
    loadTilesAround: (q: number, r: number, radius: number) => Promise<void>;
    updateTile: (q: number, r: number, terrain: string) => Promise<boolean>;
    saveMap: () => Promise<boolean>;
    generateNewMap: (size: number) => Promise<boolean>;
    selectTile: (tile: Tile | null) => void;

    // Utilities
    findPlayerTile: () => Tile | undefined;
    calculateDistance: (from: Tile, to: Tile) => number;
}

export default function useWorldMapLogic(): UseWorldMapLogicReturn {
    const { user } = useAuth();
    const [mapData, setMapData] = useState<Tile[]>([]);
    const [mapSize, setMapSize] = useState(30);
    const [version, setVersion] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTile, setSelectedTile] = useState<Tile | null>(null);

    // Load the world map
    const loadMap = useCallback(async (viewport?: { minQ: number; maxQ: number; minR: number; maxR: number }) => {
        setLoading(true);
        setError(null);

        try {
            const data = await worldMapApi.getWorldMap(viewport);
            setMapData(data.tiles);
            setMapSize(data.mapSize);
            setVersion(data.version);
        } catch (err: any) {
            setError(err.message || 'Failed to load world map');
            console.error('Error loading world map:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load tiles around a position
    const loadTilesAround = useCallback(async (q: number, r: number, radius: number) => {
        setLoading(true);
        setError(null);

        try {
            const data = await worldMapApi.getTilesAround(q, r, radius);
            // Merge new tiles with existing ones
            const newTiles = [...mapData];
            data.tiles.forEach(tile => {
                const index = newTiles.findIndex(t => t.q === tile.q && t.r === tile.r);
                if (index >= 0) {
                    newTiles[index] = tile;
                } else {
                    newTiles.push(tile);
                }
            });
            setMapData(newTiles);
        } catch (err: any) {
            setError(err.message || 'Failed to load tiles');
            console.error('Error loading tiles:', err);
        } finally {
            setLoading(false);
        }
    }, [mapData]);

    // Update a single tile (admin only)
    const updateTile = useCallback(async (q: number, r: number, terrain: string): Promise<boolean> => {
        try {
            await worldMapApi.updateTile(q, r, terrain);

            // Update local state
            setMapData(prev => prev.map(tile =>
                tile.q === q && tile.r === r
                    ? { ...tile, terrain }
                    : tile
            ));

            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to update tile');
            console.error('Error updating tile:', err);
            return false;
        }
    }, []);

    // Save the entire map (admin only)
    const saveMap = useCallback(async (): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await worldMapApi.saveMap(mapData, mapSize);
            setVersion(response.version);
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to save map');
            console.error('Error saving map:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [mapData, mapSize]);

    // Generate a new map (admin only)
    const generateNewMap = useCallback(async (size: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const data = await worldMapApi.generateMap(size);
            setMapData(data.tiles);
            setMapSize(data.mapSize);
            setVersion(data.version);
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to generate map');
            console.error('Error generating map:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Select a tile
    const selectTile = useCallback((tile: Tile | null) => {
        setSelectedTile(tile);
    }, []);

    // Find player's tile - using 'id' not '_id'
    const findPlayerTile = useCallback((): Tile | undefined => {
        if (!user) return undefined;
        // Use user.id since that's what your auth returns
        const userId = (user as any).id || (user as any).userId;
        return mapData.find(tile => tile.owner?.id === userId);
    }, [mapData, user]);

    // Calculate distance between tiles
    const calculateDistance = useCallback((from: Tile, to: Tile): number => {
        return (Math.abs(from.q - to.q) + Math.abs(from.q + from.r - to.q - to.r) + Math.abs(from.r - to.r)) / 2;
    }, []);

    // Initial load
    useEffect(() => {
        loadMap();
    }, []);

    return {
        mapData,
        mapSize,
        version,
        loading,
        error,
        selectedTile,

        loadMap,
        loadTilesAround,
        updateTile,
        saveMap,
        generateNewMap,
        selectTile,

        findPlayerTile,
        calculateDistance
    };
}
