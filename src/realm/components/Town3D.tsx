import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html } from '@react-three/drei';
import { useAuth } from '../../contexts/AuthContext';
import { AuthButton } from '../../components/Auth/AuthButton';
import useTownLogic from '../hooks/useTownLogic';
import useRealmLogic from '../hooks/useRealmLogic';
import { ModularBuilding } from './ModularBuilding';
import { getBuildingRecipe } from '../config/buildingRecipes';
import * as THREE from 'three';

interface TownProps {
    onBack: () => void;
}

// Preload common components for better performance
useGLTF.preload('/models/components/foundation.glb');
useGLTF.preload('/models/components/wall.glb');
useGLTF.preload('/models/components/roof_simple.glb');
useGLTF.preload('/models/components/door.glb');
useGLTF.preload('/models/components/window.glb');

// Smart Building Component - uses modular or single GLB based on availability
function SmartBuilding({
                           type,
                           level,
                           position,
                           onClick,
                           isSelected,
                           buildingConfig,
                           showConstruction = false
                       }: {
    type: string;
    level: number;
    position: [number, number, number];
    onClick: () => void;
    isSelected: boolean;
    buildingConfig?: any;
    showConstruction?: boolean;
}) {
    // Try to get modular recipe first
    const recipe = getBuildingRecipe(type);

    if (recipe) {
        // Use modular building system
        return (
            <ModularBuilding
                recipe={recipe}
                level={level}
                position={position}
                isSelected={isSelected}
                onClick={onClick}
                showConstruction={showConstruction}
            />
        );
    }

    // Fallback to single GLB model if available
    if (buildingConfig?.imageUrl && buildingConfig.imageUrl.endsWith('.glb')) {
        return (
            <SingleGLBBuilding
                modelPath={buildingConfig.imageUrl}
                level={level}
                position={position}
                onClick={onClick}
                isSelected={isSelected}
                buildingConfig={buildingConfig}
            />
        );
    }

    // Final fallback to simple cube
    return (
        <SimpleCubeBuilding
            type={type}
            level={level}
            position={position}
            onClick={onClick}
            isSelected={isSelected}
        />
    );
}

// Single GLB Building (for non-modular buildings)
function SingleGLBBuilding({
                               modelPath,
                               level,
                               position,
                               onClick,
                               isSelected,
                               buildingConfig
                           }: {
    modelPath: string;
    level: number;
    position: [number, number, number];
    onClick: () => void;
    isSelected: boolean;
    buildingConfig?: any;
}) {
    const meshRef = useRef<THREE.Group>();
    const { scene } = useGLTF(modelPath);

    const clonedScene = useMemo(() => {
        const clone = scene.clone();

        if (isSelected) {
            clone.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = child.material.clone();
                    child.material.emissive = new THREE.Color(0x444444);
                }
            });
        }

        return clone;
    }, [scene, isSelected]);

    useFrame((state) => {
        if (meshRef.current && isSelected) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        } else if (meshRef.current) {
            meshRef.current.position.y = position[1];
        }
    });

    return (
        <group ref={meshRef} position={position}>
            <primitive
                object={clonedScene}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            />

            {level > 1 && (
                <mesh position={[0, 2, 0]}>
                    <ringGeometry args={[0.3, 0.5, 8]} />
                    <meshStandardMaterial color="#fbbf24" />
                </mesh>
            )}
        </group>
    );
}

// Simple cube fallback
function SimpleCubeBuilding({
                                type,
                                level,
                                position,
                                onClick,
                                isSelected
                            }: {
    type: string;
    level: number;
    position: [number, number, number];
    onClick: () => void;
    isSelected: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>();

    useFrame((state) => {
        if (meshRef.current && isSelected) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        } else if (meshRef.current) {
            meshRef.current.position.y = position[1];
        }
    });

    // Different colors for different building types
    const getColor = (type: string) => {
        switch (type) {
            case 'townhall': return isSelected ? "#3b82f6" : "#1e40af";
            case 'house': return isSelected ? "#10b981" : "#047857";
            case 'farm': return isSelected ? "#f59e0b" : "#d97706";
            case 'mine': return isSelected ? "#6b7280" : "#374151";
            default: return isSelected ? "#8b5cf6" : "#7c3aed";
        }
    };

    return (
        <group>
            <mesh
                ref={meshRef}
                position={position}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                <boxGeometry args={[1.5, 1.5 * level, 1.5]} />
                <meshStandardMaterial color={getColor(type)} />
            </mesh>

            {level > 1 && (
                <mesh position={[position[0], position[1] + 1.5 * level + 0.3, position[2]]}>
                    <ringGeometry args={[0.3, 0.5, 8]} />
                    <meshStandardMaterial color="#fbbf24" />
                </mesh>
            )}
        </group>
    );
}

// Empty Plot Component (unchanged)
function EmptyPlot({
                       position,
                       onClick,
                       isSelected,
                       buildMode
                   }: {
    position: [number, number, number];
    onClick: () => void;
    isSelected: boolean;
    buildMode: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>();

    useFrame((state) => {
        if (meshRef.current && (buildMode || isSelected)) {
            const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8;
            meshRef.current.material.opacity = pulse;
        } else if (meshRef.current) {
            meshRef.current.material.opacity = 0.3;
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[position[0], position[1] - 0.05, position[2]]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <planeGeometry args={[1.8, 1.8]} />
            <meshStandardMaterial
                color={isSelected ? "#4ade80" : buildMode ? "#3b82f6" : "#10b981"}
                opacity={0.3}
                transparent
            />
        </mesh>
    );
}

// Terrain Component (unchanged)
function TownTerrain({ size }: { size: { width: number; height: number } }) {
    return (
        <group>
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.2, 0]}
                receiveShadow
            >
                <planeGeometry args={[size.width * 2.5, size.height * 2.5]} />
                <meshStandardMaterial color="#2d5016" />
            </mesh>

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.15, 0]}
            >
                <planeGeometry args={[size.width * 2, size.height * 2]} />
                <meshStandardMaterial
                    color="#22c55e"
                    opacity={0.8}
                    transparent
                />
            </mesh>
        </group>
    );
}

// Construction progress indicator
function ConstructionIndicator({
                                   position,
                                   progress = 0
                               }: {
    position: [number, number, number];
    progress?: number;
}) {
    const meshRef = useRef<THREE.Group>();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime;
        }
    });

    return (
        <group ref={meshRef} position={[position[0], position[1] + 2, position[2]]}>
            <mesh>
                <cylinderGeometry args={[0.1, 0.1, 2]} />
                <meshStandardMaterial color="#ff6b35" />
            </mesh>
            <Html>
                <div className="bg-white px-2 py-1 rounded text-xs font-bold">
                    Building... {Math.round(progress * 100)}%
                </div>
            </Html>
        </group>
    );
}

// Main 3D Scene Component
function Town3DScene() {
    const townLogic = useTownLogic();

    if (!townLogic.town) return null;

    const gridSize = 2;

    return (
        <>
            {/* Enhanced Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[20, 20, 20]}
                intensity={1.5}
                castShadow
                shadow-mapSize-width={4096}
                shadow-mapSize-height={4096}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />
            <pointLight position={[-15, 10, -15]} intensity={0.3} color="#ff7700" />
            <pointLight position={[15, 10, 15]} intensity={0.3} color="#0077ff" />

            {/* Environment */}
            <Environment preset="city" />

            {/* Fog for atmosphere */}
            <fog attach="fog" args={['#87CEEB', 30, 100]} />

            {/* Terrain */}
            <TownTerrain size={townLogic.town.mapSize} />

            {/* Buildings and Empty Plots */}
            {townLogic.town.layout.map((row, y) =>
                row.map((cell, x) => {
                    const position: [number, number, number] = [
                        (x - 4.5) * gridSize,
                        0,
                        (y - 3.5) * gridSize
                    ];

                    const isSelected =
                        townLogic.selectedBuilding?.x === x &&
                        townLogic.selectedBuilding?.y === y;

                    const buildingConfig = townLogic.getBuildingConfig(cell.type);

                    if (cell.type === 'empty') {
                        return (
                            <EmptyPlot
                                key={cell.id}
                                position={position}
                                onClick={() => townLogic.handleCellClick(x, y)}
                                isSelected={isSelected}
                                buildMode={!!townLogic.buildMode}
                            />
                        );
                    }

                    // Check if building is under construction
                    const building = townLogic.town.buildings.find(b => b.x === x && b.y === y);
                    const showConstruction = building?.isUpgrading || false;

                    return (
                        <React.Fragment key={cell.id}>
                            <Suspense
                                fallback={
                                    <SimpleCubeBuilding
                                        type={cell.type}
                                        level={cell.level}
                                        position={position}
                                        onClick={() => townLogic.handleCellClick(x, y)}
                                        isSelected={isSelected}
                                    />
                                }
                            >
                                <SmartBuilding
                                    type={cell.type}
                                    level={cell.level}
                                    position={position}
                                    onClick={() => townLogic.handleCellClick(x, y)}
                                    isSelected={isSelected}
                                    buildingConfig={buildingConfig}
                                    showConstruction={showConstruction}
                                />
                            </Suspense>

                            {/* Show construction progress */}
                            {showConstruction && (
                                <ConstructionIndicator
                                    position={position}
                                    progress={0.7} // You can calculate actual progress
                                />
                            )}
                        </React.Fragment>
                    );
                })
            )}

            {/* Enhanced Camera Controls */}
            <OrbitControls
                enableZoom={true}
                enablePan={true}
                maxDistance={30}
                minDistance={8}
                maxPolarAngle={Math.PI / 2.1}
                minPolarAngle={Math.PI / 8}
                target={[0, 0, 0]}
                enableDamping={true}
                dampingFactor={0.05}
            />
        </>
    );
}

// Resource Display Component (unchanged)
function ResourcePanel({ inventory }: { inventory: any }) {
    if (!inventory?.resources) return null;

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white">
            <h3 className="font-bold mb-2">Resources</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">💰</span>
                    <span>{inventory.gold?.toLocaleString() || 0}</span>
                </div>
                {Object.entries(inventory.resources).map(([resource, amount]) => (
                    <div key={resource} className="flex items-center space-x-1">
                        <span>{
                            resource === 'wood' ? '🪵' :
                                resource === 'stone' ? '🗿' :
                                    resource === 'iron' ? '⚒️' :
                                        resource === 'food' ? '🌾' :
                                            resource === 'gems' ? '💎' : '📦'
                        }</span>
                        <span>{amount}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Main Component (UI layout unchanged)
const Town3D: React.FC<TownProps> = ({ onBack }) => {
    const { user } = useAuth();
    const townLogic = useTownLogic();
    const realmLogic = useRealmLogic();

    if (townLogic.loading && !townLogic.town) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-white text-xl mb-4">Loading your town...</div>
                    <div className="text-green-200 text-sm">Assembling modular buildings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen relative bg-gradient-to-b from-sky-300 to-sky-700">
            {/* 3D Scene */}
            <Canvas
                camera={{ position: [15, 12, 15], fov: 60 }}
                shadows
                className="w-full h-full"
            >
                <Town3DScene />
            </Canvas>

            {/* UI Overlays - Same as before but with modular building info */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top Bar */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto z-10">
                    <button
                        onClick={onBack}
                        className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
                    >
                        <span>←</span>
                        <span>Back to Realm</span>
                    </button>

                    <AuthButton />
                </div>

                {/* Left Panel */}
                <div className="absolute top-20 left-4 space-y-4 pointer-events-auto z-10">
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white">
                        <h2 className="text-xl font-bold mb-1">
                            {townLogic.town?.name || 'Loading...'}
                        </h2>
                        <p className="text-sm text-white/80">
                            Level {townLogic.town?.level || 1} Settlement
                        </p>
                        <p className="text-xs text-white/60 mt-1">
                            🔧 Modular Building System Active
                        </p>
                    </div>

                    <ResourcePanel inventory={realmLogic.inventory} />

                    {/* Building Progress Info */}
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-white text-sm">
                        <p className="font-semibold mb-1">🏗️ Building System:</p>
                        <p>• Modular components</p>
                        <p>• Progressive construction</p>
                        <p>• Level-based upgrades</p>
                    </div>
                </div>

                {/* Rest of UI unchanged... */}
            </div>
        </div>
    );
};

export default Town3D;
