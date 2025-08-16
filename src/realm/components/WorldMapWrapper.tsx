import React, { useEffect, useState } from 'react';
import WorldMap from './WorldMap';
import useWorldMapLogic from '../hooks/useWorldMapLogic';
import { useAuth } from '../../contexts/AuthContext';

interface WorldMapWrapperProps {
    onBack: () => void;
}

const WorldMapWrapper: React.FC<WorldMapWrapperProps> = ({ onBack }) => {
    const { user } = useAuth();
    const worldMapLogic = useWorldMapLogic();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const adminUsernames = ['admin', 'yourUsername']; // Replace with real admin usernames
        setIsAdmin(adminUsernames.includes((user as any)?.username || ''));
    }, [user]);

    // Ensure the map loads when this view mounts
    useEffect(() => {
        worldMapLogic.loadMap().catch((e) => {
            console.error('Failed to load map:', e);
        });
    }, []);

    if (worldMapLogic.loading && worldMapLogic.mapData.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">🗺️</div>
                    <div className="text-white text-xl">Loading world map...</div>
                </div>
            </div>
        );
    }

    if (worldMapLogic.error && worldMapLogic.mapData.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <div className="text-white text-xl mb-4">Failed to load world map</div>
                    <button
                        onClick={() => worldMapLogic.loadMap()}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <WorldMap
            mapData={worldMapLogic.mapData}
            mapSize={worldMapLogic.mapSize}
            isAdmin={isAdmin}
            userId={(user as any)?.id || (user as any)?.userId}
            onBack={onBack}
            onTileUpdate={worldMapLogic.updateTile}
            onMapSave={worldMapLogic.saveMap}
            onMapGenerate={worldMapLogic.generateNewMap}
            selectedTile={worldMapLogic.selectedTile}
            onTileSelect={worldMapLogic.selectTile}
            findPlayerTile={worldMapLogic.findPlayerTile}
        />
    );
};

export default WorldMapWrapper;
