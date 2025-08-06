import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three-stdlib/loaders/FBXLoader';
import { Suspense } from 'react';

interface ThreeModelProps {
    modelPath: string;
    scale?: number;
    position?: [number, number, number];
}

export function ThreeModel({ modelPath, scale = 1, position = [0, 0, 0] }: ThreeModelProps) {
    const fbx = useLoader(FBXLoader, modelPath);

    return (
        <primitive
            object={fbx}
            scale={scale}
            position={position}
        />
    );
}

export function ModelLoader() {
    return (
        <Suspense fallback={null}>
            <ThreeModel modelPath="/path/to/your/model.fbx" />
        </Suspense>
    );
}
