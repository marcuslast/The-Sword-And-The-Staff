import React, { Suspense, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Component definition for building parts
export interface BuildingComponent {
    type: 'wall' | 'tower' | 'column' | 'roof' | 'door' | 'window' | 'stairs' | 'foundation' | 'decoration' | 'chimney' | 'pillar';
    modelPath: string;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    attachTo?: string; // ID of component to attach to
}

// Building recipe - defines how to construct a building
export interface BuildingRecipe {
    id: string;
    name: string;
    category: string;
    baseSize: [number, number]; // width, depth
    height: number;
    components: {
        [level: number]: BuildingComponent[]; // Components for each building level
    };
}

// Individual GLB component loader
function GLBComponent({
                          component,
                          parentRef,
                          isSelected = false
                      }: {
    component: BuildingComponent;
    parentRef?: React.RefObject<THREE.Group>;
    isSelected?: boolean;
}) {
    const { scene } = useGLTF(component.modelPath);
    const componentRef = useRef<THREE.Group>(null);

    // Clone the model to avoid sharing between instances
    const clonedScene = useMemo(() => {
        const clone = scene.clone();

        // Apply selection highlighting
        if (isSelected) {
            clone.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color(0x444444);
                    }
                }
            });
        }

        return clone;
    }, [scene, isSelected]);

    return (
        <group
            ref={componentRef}
            position={component.position}
            rotation={component.rotation || [0, 0, 0]}
            scale={component.scale || [1, 1, 1]}
        >
            <primitive object={clonedScene} />
        </group>
    );
}

// Main modular building component
export function ModularBuilding({
                                    recipe,
                                    level = 1,
                                    position = [0, 0, 0],
                                    isSelected = false,
                                    onClick,
                                    showConstruction = false
                                }: {
    recipe: BuildingRecipe;
    level: number;
    position: [number, number, number];
    isSelected?: boolean;
    onClick?: () => void;
    showConstruction?: boolean;
}) {
    const buildingRef = useRef<THREE.Group>(null);

    // Get components for current level and all previous levels
    const activeComponents = useMemo(() => {
        const components: BuildingComponent[] = [];

        // Add components from level 1 up to current level
        for (let i = 1; i <= level; i++) {
            if (recipe.components[i]) {
                components.push(...recipe.components[i]);
            }
        }

        return components;
    }, [recipe, level]);

    // Gentle floating animation for selected buildings
    useFrame((state) => {
        if (buildingRef.current && isSelected) {
            buildingRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        } else if (buildingRef.current) {
            buildingRef.current.position.y = position[1];
        }
    });

    // Construction animation - show components progressively
    const visibleComponents = useMemo(() => {
        if (!showConstruction) return activeComponents;

        // During construction, show components gradually
        const constructionTime = Date.now() % 10000; // 10 second cycle
        const progress = constructionTime / 10000;
        const visibleCount = Math.floor(progress * activeComponents.length);

        return activeComponents.slice(0, visibleCount + 1);
    }, [activeComponents, showConstruction]);

    return (
        <group
            ref={buildingRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            {/* Render all visible components */}
            {visibleComponents.map((component, index) => (
                <Suspense
                    key={`${component.type}-${index}`}
                    fallback={
                        <mesh position={component.position}>
                            <boxGeometry args={[0.5, 0.5, 0.5]} />
                            <meshStandardMaterial color="#9ca3af" />
                        </mesh>
                    }
                >
                    <GLBComponent
                        component={component}
                        parentRef={buildingRef}
                        isSelected={isSelected}
                    />
                </Suspense>
            ))}

            {/* Level indicator */}
            {level > 1 && (
                <mesh position={[0, recipe.height + 0.5, 0]}>
                    <ringGeometry args={[0.3, 0.5, 8]} />
                    <meshStandardMaterial color="#fbbf24" />
                </mesh>
            )}

            {/* Construction progress indicator */}
            {showConstruction && (
                <mesh position={[0, recipe.height + 1, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.1]} />
                    <meshStandardMaterial color="#ff6b35" />
                </mesh>
            )}
        </group>
    );
}
