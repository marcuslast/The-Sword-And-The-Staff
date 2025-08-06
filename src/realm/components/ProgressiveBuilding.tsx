import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BuildingComponent, BuildingRecipe } from './ModularBuilding';
import { constructionSystem, ConstructionProject } from '../systems/TimedConstructionSystem';

interface ProgressiveBuildingProps {
    buildingId: string;
    recipe: BuildingRecipe;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    isSelected?: boolean;
    onClick?: () => void;
    constructionProjectId?: string;
    showConstructionEffects?: boolean;
}

interface AnimatedComponentProps {
    component: BuildingComponent;
    isVisible: boolean;
    isBeingBuilt: boolean;
    buildProgress: number;
    parentRef?: React.RefObject<THREE.Group>;
}

// Individual component with construction animation
function AnimatedComponent({
                               component,
                               isVisible,
                               isBeingBuilt,
                               buildProgress,
                               parentRef
                           }: AnimatedComponentProps) {
    const { scene } = useGLTF(component.modelPath);
    const componentRef = useRef<THREE.Group>(null);
    const [initialY] = useState(component.position[1]);
    const originalMaterials = useRef<THREE.Material[]>([]);

    // Clone the model and store original materials
    const clonedScene = useMemo(() => {
        const clone = scene.clone();

        // Store original materials
        originalMaterials.current = [];
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                if (Array.isArray(child.material)) {
                    originalMaterials.current.push(...child.material);
                } else {
                    originalMaterials.current.push(child.material);
                }
            }
        });

        return clone;
    }, [scene]);

    // Apply construction effects when needed
    useMemo(() => {
        if (!isBeingBuilt) {
            // Restore original materials when not being built
            let materialIndex = 0;
            clonedScene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(() => {
                            return originalMaterials.current[materialIndex++];
                        });
                    } else {
                        child.material = originalMaterials.current[materialIndex++];
                    }
                }
            });
        } else {
            // Apply construction effects
            clonedScene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    // Clone the material safely
                    const material = child.material.clone();

                    // Set material properties safely
                    if ('transparent' in material) {
                        material.transparent = true;
                        material.opacity = 0.3 + (buildProgress * 0.7);
                    }
                    if ('emissive' in material) {
                        material.emissive = new THREE.Color(0x222222);
                    }

                    child.material = material;
                }
            });
        }
    }, [isBeingBuilt, buildProgress, clonedScene]);

    // Animation for component construction
    useFrame((state, delta) => {
        if (!componentRef.current) return;

        if (isBeingBuilt) {
            // Rising animation during construction
            const targetY = initialY - 2 + (buildProgress * 2);
            componentRef.current.position.y = THREE.MathUtils.lerp(
                componentRef.current.position.y,
                targetY,
                delta * 3
            );

            // Gentle rotation during construction
            componentRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
        } else if (isVisible) {
            // Settle into final position
            componentRef.current.position.y = THREE.MathUtils.lerp(
                componentRef.current.position.y,
                initialY,
                delta * 5
            );
            componentRef.current.rotation.y = THREE.MathUtils.lerp(
                componentRef.current.rotation.y,
                0,
                delta * 5
            );
        }

        // Fade in/out based on visibility
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                const targetOpacity = isVisible ? 1 : 0;
                if (child.material.opacity !== undefined) {
                    child.material.opacity = THREE.MathUtils.lerp(
                        child.material.opacity,
                        targetOpacity,
                        delta * 4
                    );
                }
            }
        });
    });

    if (!isVisible && !isBeingBuilt) return null;

    return (
        <group
            ref={componentRef}
            position={component.position}
            rotation={component.rotation || [0, 0, 0]}
            scale={component.scale || [1, 1, 1]}
        >
            <primitive object={clonedScene} />

            {/* Construction particles/effects */}
            {isBeingBuilt && (
                <group>
                    {/* Dust particles */}
                    <points>
                        <bufferGeometry>
                            <bufferAttribute
                                array={new Float32Array(Array.from({ length: 30 }, () => [
                                    (Math.random() - 0.5) * 2,
                                    Math.random() * 2,
                                    (Math.random() - 0.5) * 2
                                ]).flat())}
                                count={10}
                                itemSize={3}
                                attach="attributes-position"
                            />
                        </bufferGeometry>
                        <pointsMaterial size={0.1} color="#8b7355" opacity={0.6} transparent />
                    </points>
                </group>
            )}
        </group>
    );
}

// Construction indicator with progress
function ConstructionIndicator({
                                   position,
                                   progress,
                                   currentPhase,
                                   estimatedCompletion
                               }: {
    position: [number, number, number];
    progress: number;
    currentPhase: string;
    estimatedCompletion: number;
}) {
    const indicatorRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (indicatorRef.current) {
            indicatorRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
    });

    const timeRemaining = Math.max(0, estimatedCompletion - Date.now());
    const minutesRemaining = Math.ceil(timeRemaining / 60000);

    return (
        <group ref={indicatorRef} position={[position[0], position[1] + 3, position[2]]}>
            {/* Progress ring */}
            <mesh>
                <ringGeometry args={[0.8, 1.0, 32, 1, 0, Math.PI * 2 * progress]} />
                <meshBasicMaterial color="#4ade80" side={THREE.DoubleSide} />
            </mesh>

            {/* Background ring */}
            <mesh>
                <ringGeometry args={[0.8, 1.0, 32]} />
                <meshBasicMaterial color="#374151" opacity={0.3} transparent side={THREE.DoubleSide} />
            </mesh>

            {/* Construction icon */}
            <mesh position={[0, 0, 0.1]}>
                <cylinderGeometry args={[0.2, 0.2, 0.6]} />
                <meshStandardMaterial color="#ff6b35" />
            </mesh>

            {/* Info panel */}
            <Html position={[0, -2, 0]} center>
                <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-center">
                    <div className="font-bold text-sm">{currentPhase}</div>
                    <div className="text-xs text-green-300">{Math.round(progress * 100)}% Complete</div>
                    {minutesRemaining > 0 && (
                        <div className="text-xs text-yellow-300">{minutesRemaining}m remaining</div>
                    )}
                </div>
            </Html>
        </group>
    );
}

// Main Progressive Building Component
export function ProgressiveBuilding({
                                        buildingId,
                                        recipe,
                                        position,
                                        rotation = [0, 0, 0],
                                        scale = [1, 1, 1],
                                        isSelected = false,
                                        onClick,
                                        constructionProjectId,
                                        showConstructionEffects = true
                                    }: ProgressiveBuildingProps) {
    const buildingRef = useRef<THREE.Group>(null);
    const [constructionProject, setConstructionProject] = useState<ConstructionProject | null>(null);
    const [progressInfo, setProgressInfo] = useState<any>(null);

    // Get all components from the recipe
    const allComponents = useMemo(() => {
        const components: BuildingComponent[] = [];
        Object.values(recipe.components).forEach(levelComponents => {
            components.push(...levelComponents);
        });
        return components;
    }, [recipe]);

    // Monitor construction progress
    useEffect(() => {
        if (!constructionProjectId) {
            setProgressInfo({ overall: 1, componentsVisible: allComponents });
            return;
        }

        const project = constructionSystem.getProject(constructionProjectId);
        if (!project) return;

        setConstructionProject(project);

        const updateProgress = (updatedProject: ConstructionProject) => {
            const progress = constructionSystem.getDetailedProgress(updatedProject.id);
            setProgressInfo(progress);
            setConstructionProject(updatedProject);
        };

        // Set up callback for progress updates
        constructionSystem.onProjectUpdate(constructionProjectId, updateProgress);

        // Initial progress
        const initialProgress = constructionSystem.getDetailedProgress(constructionProjectId);
        setProgressInfo(initialProgress);

        // Polling fallback for real-time updates
        const interval = setInterval(() => {
            const currentProgress = constructionSystem.getDetailedProgress(constructionProjectId);
            if (currentProgress) {
                setProgressInfo(currentProgress);
            }
        }, 1000);

        return () => {
            constructionSystem.offProjectUpdate(constructionProjectId);
            clearInterval(interval);
        };
    }, [constructionProjectId, allComponents]);

    // Gentle floating animation for selected buildings
    useFrame((state) => {
        if (buildingRef.current && isSelected && !constructionProject) {
            buildingRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        } else if (buildingRef.current && !constructionProject) {
            buildingRef.current.position.y = position[1];
        }
    });

    const visibleComponents = progressInfo?.componentsVisible || [];
    const nextComponents = progressInfo?.nextComponents || [];
    const isUnderConstruction = constructionProject?.status === 'in_progress';

    return (
        <group
            ref={buildingRef}
            position={position}
            rotation={rotation}
            scale={scale}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            {/* Render visible (completed) components */}
            {allComponents.map((component, index) => {
                const componentKey = `${component.type}_${component.position.join('_')}`;
                const isVisible = visibleComponents.some((vc: { type: string; position: any; }) =>
                    vc.type === component.type &&
                    JSON.stringify(vc.position) === JSON.stringify(component.position)
                );
                const isBeingBuilt = nextComponents.some((nc: { type: string; position: any; }) =>
                    nc.type === component.type &&
                    JSON.stringify(nc.position) === JSON.stringify(component.position)
                ) && isUnderConstruction;

                return (
                    <Suspense
                        key={`${componentKey}-${index}`}
                        fallback={
                            <mesh position={component.position}>
                                <boxGeometry args={[0.5, 0.5, 0.5]} />
                                <meshStandardMaterial color="#9ca3af" />
                            </mesh>
                        }
                    >
                        <AnimatedComponent
                            component={component}
                            isVisible={isVisible || !isUnderConstruction}
                            isBeingBuilt={isBeingBuilt}
                            buildProgress={progressInfo?.phaseProgress || 0}
                            parentRef={buildingRef}
                        />
                    </Suspense>
                );
            })}

            {/* Construction indicator */}
            {isUnderConstruction && progressInfo && showConstructionEffects && (
                <ConstructionIndicator
                    position={[0, recipe.height || 2, 0]}
                    progress={progressInfo.overall}
                    currentPhase={progressInfo.currentPhase}
                    estimatedCompletion={progressInfo.estimatedCompletion}
                />
            )}

            {/* Level indicator for completed buildings */}
            {!isUnderConstruction && (
                <mesh position={[0, (recipe.height || 2) + 0.5, 0]}>
                    <ringGeometry args={[0.3, 0.5, 8]} />
                    <meshStandardMaterial color={isSelected ? "#fbbf24" : "#10b981"} />
                </mesh>
            )}

            {/* Selection highlight */}
            {isSelected && (
                <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[recipe.baseSize[0] * 0.8, recipe.baseSize[0] * 1.2, 32]} />
                    <meshBasicMaterial color="#fbbf24" opacity={0.3} transparent />
                </mesh>
            )}
        </group>
    );
}

// Preload common components for better performance
export const preloadBuildingComponents = (components: string[]) => {
    components.forEach(componentPath => {
        useGLTF.preload(componentPath);
    });
};
