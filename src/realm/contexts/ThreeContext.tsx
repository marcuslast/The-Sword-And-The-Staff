import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import React from "react";

export function ThreeProvider({ children }: { children: React.ReactNode }) {
    return (
        <Canvas
            camera={{ position: [0, 0, 10], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
        >
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            <Environment preset="city" />
            <OrbitControls enableZoom={false} />
            {children}
        </Canvas>
    );
}
