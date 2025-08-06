import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';

interface ComponentTesterProps {
    onClose?: () => void;
}

// Individual component preview
function ComponentPreview({
                              modelPath,
                              position = [0, 0, 0],
                              rotation = [0, 0, 0],
                              scale = [1, 1, 1],
                              name
                          }: {
    modelPath: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    name: string;
}) {
    const { scene } = useGLTF(modelPath);

    return (
        <group>
            <primitive
                object={scene.clone()}
                position={position}
                rotation={rotation}
                scale={scale}
            />
            <Html position={[position[0], position[1] + 1, position[2]]}>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
                    {name}
                </div>
            </Html>
        </group>
    );
}

// Component testing interface
export const ComponentTester: React.FC<ComponentTesterProps> = ({ onClose }) => {
    const [selectedComponent, setSelectedComponent] = useState('wall');
    const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
    const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });

    // List of available components to test
    const components = [
        { id: 'wall', name: 'Wall', path: '/models/components/wall.glb' },
        { id: 'roof_simple', name: 'Simple Roof', path: '/models/components/roof_simple.glb' },
        { id: 'roof_elaborate', name: 'Elaborate Roof', path: '/models/components/roof_elaborate.glb' },
        { id: 'door', name: 'Door', path: '/models/components/door.glb' },
        { id: 'door_large', name: 'Large Door', path: '/models/components/door_large.glb' },
        { id: 'window', name: 'Window', path: '/models/components/window.glb' },
        { id: 'foundation', name: 'Foundation', path: '/models/components/foundation.glb' },
        { id: 'pillar', name: 'Pillar', path: '/models/components/pillar.glb' },
        { id: 'chimney', name: 'Chimney', path: '/models/components/chimney.glb' },
        { id: 'stairs', name: 'Stairs', path: '/models/components/stairs.glb' },
    ];

    const currentComponent = components.find(c => c.id === selectedComponent);

    const copyToClipboard = () => {
        const componentData = {
            type: selectedComponent.split('_')[0] as any,
            modelPath: currentComponent?.path,
            position: [position.x, position.y, position.z],
            rotation: [rotation.x, rotation.y, rotation.z],
            scale: [scale.x, scale.y, scale.z]
        };

        navigator.clipboard.writeText(JSON.stringify(componentData, null, 2));
        alert('Component configuration copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex">
            {/* 3D Preview Area */}
            <div className="flex-1 relative">
                <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 10]} intensity={1} />

                    {/* Ground reference */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                        <planeGeometry args={[10, 10]} />
                        <meshStandardMaterial color="#22c55e" opacity={0.3} transparent />
                    </mesh>

                    {/* Grid helper */}
                    <gridHelper args={[10, 10]} />

                    {/* Component preview */}
                    {currentComponent && (
                        <Suspense fallback={null}>
                            <ComponentPreview
                                modelPath={currentComponent.path}
                                position={[position.x, position.y, position.z]}
                                rotation={[rotation.x, rotation.y, rotation.z]}
                                scale={[scale.x, scale.y, scale.z]}
                                name={currentComponent.name}
                            />
                        </Suspense>
                    )}

                    <OrbitControls />
                </Canvas>
            </div>

            {/* Control Panel */}
            <div className="w-80 bg-white p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Component Tester</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                        >
                            Close
                        </button>
                    )}
                </div>

                {/* Component Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Component:</label>
                    <select
                        value={selectedComponent}
                        onChange={(e) => setSelectedComponent(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        {components.map(comp => (
                            <option key={comp.id} value={comp.id}>
                                {comp.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Position Controls */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Position:</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-xs">X</label>
                            <input
                                type="number"
                                step="0.1"
                                value={position.x}
                                onChange={(e) => setPosition({...position, x: parseFloat(e.target.value) || 0})}
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs">Y</label>
                            <input
                                type="number"
                                step="0.1"
                                value={position.y}
                                onChange={(e) => setPosition({...position, y: parseFloat(e.target.value) || 0})}
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs">Z</label>
                            <input
                                type="number"
                                step="0.1"
                                value={position.z}
                                onChange={(e) => setPosition({...position, z: parseFloat(e.target.value) || 0})}
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Rotation Controls */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Rotation (radians):</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-xs">X</label>
                            <input
                                type="number"
                                step="0.1"
                                value={rotation.x}
                                onChange={(e) => setRotation({...rotation, x: parseFloat(e.target.value) || 0})}
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs">Y</label>
                            <input
                                type="number"
                                step="0.1"
                                value={rotation.y}
                                onChange={(e) => setRotation({...rotation, y: parseFloat(e.target.value) || 0})}
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs">Z</label>
                            <input
                                type="number"
                                step="0.1"
                                value={rotation.z}
                                onChange={(e) => setRotation({...rotation, z: parseFloat(e.target.value) || 0})}
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Scale Controls */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Scale:</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-xs">X</label>
                            <input
                                type="number"
                                step="0.1"
                                value={scale.x}
                                onChange={(e) => setScale({...scale, x: parseFloat(e.target.value) || 1})}
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs">Y</label>
                            <input
                                type="number"
                                step="0.1"
                                value={scale.y}
                                onChange={(e) => setScale({...scale, y: parseFloat(e.target.value) || 1})}
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs">Z</label>
                            <input
                                type="number"
                                step="0.1"
                                value={scale.z}
                                onChange={(e) => setScale({...scale, z: parseFloat(e.target.value) || 1})}
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Rotation Buttons */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Quick Rotations:</label>
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={() => setRotation({...rotation, y: 0})}
                            className="bg-blue-500 text-white p-1 rounded text-xs"
                        >
                            0°
                        </button>
                        <button
                            onClick={() => setRotation({...rotation, y: Math.PI/2})}
                            className="bg-blue-500 text-white p-1 rounded text-xs"
                        >
                            90°
                        </button>
                        <button
                            onClick={() => setRotation({...rotation, y: Math.PI})}
                            className="bg-blue-500 text-white p-1 rounded text-xs"
                        >
                            180°
                        </button>
                        <button
                            onClick={() => setRotation({...rotation, y: -Math.PI/2})}
                            className="bg-blue-500 text-white p-1 rounded text-xs"
                        >
                            270°
                        </button>
                    </div>
                </div>

                {/* Reset Button */}
                <button
                    onClick={() => {
                        setPosition({ x: 0, y: 0, z: 0 });
                        setRotation({ x: 0, y: 0, z: 0 });
                        setScale({ x: 1, y: 1, z: 1 });
                    }}
                    className="w-full bg-gray-500 text-white p-2 rounded mb-4"
                >
                    Reset Transform
                </button>

                {/* Copy Configuration */}
                <button
                    onClick={copyToClipboard}
                    className="w-full bg-green-500 text-white p-2 rounded mb-4"
                >
                    Copy Config to Clipboard
                </button>

                {/* Current Configuration Display */}
                <div className="bg-gray-100 p-3 rounded text-xs">
                    <pre className="whitespace-pre-wrap">
                        {JSON.stringify({
                            type: selectedComponent.split('_')[0],
                            modelPath: currentComponent?.path,
                            position: [position.x, position.y, position.z],
                            rotation: [rotation.x, rotation.y, rotation.z],
                            scale: [scale.x, scale.y, scale.z]
                        }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};
