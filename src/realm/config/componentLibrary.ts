export interface ComponentDefinition {
    id: string;
    name: string;
    category: 'structure' | 'decoration' | 'roof' | 'wall' | 'door' | 'window' | 'foundation' | 'misc';
    subcategory?: string;
    modelPath: string;
    defaultScale: [number, number, number];
    defaultRotation: [number, number, number];
    boundingBox: {
        width: number;
        height: number;
        depth: number;
    };
    snapPoints?: Array<{
        name: string;
        position: [number, number, number];
        rotation: [number, number, number];
    }>;
    tags: string[];
    compatibility: {
        connectsTo?: string[];
        incompatibleWith?: string[];
    };
}

export interface ComponentLibrary {
    [category: string]: {
        [subcategory: string]: ComponentDefinition[];
    };
}

// Auto-generate component definitions from your models directory
export const COMPONENT_LIBRARY: ComponentLibrary = {
    structure: {
        foundations: [
            {
                id: 'foundation_basic',
                name: 'Basic Foundation',
                category: 'foundation',
                modelPath: '/models/components/foundation.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 2, height: 0.2, depth: 2 },
                tags: ['basic', 'stone'],
                compatibility: { connectsTo: ['wall', 'pillar'] }
            },
            {
                id: 'foundation_large',
                name: 'Large Foundation',
                category: 'foundation',
                modelPath: '/models/components/foundation_large.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 4, height: 0.2, depth: 4 },
                tags: ['large', 'stone'],
                compatibility: { connectsTo: ['wall', 'pillar'] }
            }
        ],
        walls: [
            {
                id: 'wall_basic',
                name: 'Basic Wall',
                category: 'wall',
                modelPath: '/models/components/wall.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 2, height: 3, depth: 0.3 },
                snapPoints: [
                    { name: 'left_end', position: [-1, 0, 0], rotation: [0, 0, 0] },
                    { name: 'right_end', position: [1, 0, 0], rotation: [0, 0, 0] },
                    { name: 'top_center', position: [0, 3, 0], rotation: [0, 0, 0] }
                ],
                tags: ['basic', 'stone', 'structural'],
                compatibility: {
                    connectsTo: ['foundation', 'wall', 'roof', 'door', 'window'],
                    incompatibleWith: ['stairs']
                }
            },
            {
                id: 'wall_decorative',
                name: 'Decorative Wall',
                category: 'wall',
                modelPath: '/models/components/wall_decorative.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 2, height: 3, depth: 0.3 },
                tags: ['decorative', 'ornate'],
                compatibility: { connectsTo: ['foundation', 'wall', 'roof'] }
            }
        ],
        roofs: [
            {
                id: 'roof_simple',
                name: 'Simple Roof',
                category: 'roof',
                modelPath: '/models/components/roof_simple.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 3, height: 1.5, depth: 3 },
                tags: ['basic', 'peaked'],
                compatibility: { connectsTo: ['wall'] }
            },
            {
                id: 'roof_elaborate',
                name: 'Elaborate Roof',
                category: 'roof',
                modelPath: '/models/components/roof_elaborate.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 4, height: 2, depth: 4 },
                tags: ['elaborate', 'decorative'],
                compatibility: { connectsTo: ['wall'] }
            }
        ]
    },
    openings: {
        doors: [
            {
                id: 'door_basic',
                name: 'Basic Door',
                category: 'door',
                modelPath: '/models/components/door.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 1, height: 2.5, depth: 0.2 },
                tags: ['basic', 'wooden'],
                compatibility: { connectsTo: ['wall'] }
            },
            {
                id: 'door_large',
                name: 'Large Door',
                category: 'door',
                modelPath: '/models/components/door_large.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 2, height: 3, depth: 0.2 },
                tags: ['large', 'wooden'],
                compatibility: { connectsTo: ['wall'] }
            }
        ],
        windows: [
            {
                id: 'window_basic',
                name: 'Basic Window',
                category: 'window',
                modelPath: '/models/components/window.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 1.5, height: 1.5, depth: 0.2 },
                tags: ['basic', 'glass'],
                compatibility: { connectsTo: ['wall'] }
            }
        ]
    },
    decoration: {
        chimneys: [
            {
                id: 'chimney_basic',
                name: 'Basic Chimney',
                category: 'decoration',
                modelPath: '/models/components/chimney.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 0.8, height: 2, depth: 0.8 },
                tags: ['chimney', 'stone'],
                compatibility: { connectsTo: ['roof'] }
            }
        ],
        pillars: [
            {
                id: 'pillar_basic',
                name: 'Basic Pillar',
                category: 'decoration',
                modelPath: '/models/components/pillar.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 0.5, height: 3, depth: 0.5 },
                tags: ['pillar', 'stone', 'support'],
                compatibility: { connectsTo: ['foundation', 'roof'] }
            }
        ],
        stairs: [
            {
                id: 'stairs_basic',
                name: 'Basic Stairs',
                category: 'decoration',
                modelPath: '/models/components/stairs.glb',
                defaultScale: [1, 1, 1],
                defaultRotation: [0, 0, 0],
                boundingBox: { width: 2, height: 1.5, depth: 3 },
                tags: ['stairs', 'stone'],
                compatibility: { connectsTo: ['foundation'] }
            }
        ]
    }
};

// Utility functions for component management
export class ComponentLibraryManager {
    static getAllComponents(): ComponentDefinition[] {
        const components: ComponentDefinition[] = [];
        Object.values(COMPONENT_LIBRARY).forEach(category => {
            Object.values(category).forEach(subcategory => {
                components.push(...subcategory);
            });
        });
        return components;
    }

    static getComponentsByCategory(category: string): ComponentDefinition[] {
        const categoryData = COMPONENT_LIBRARY[category];
        if (!categoryData) return [];

        const components: ComponentDefinition[] = [];
        Object.values(categoryData).forEach(subcategory => {
            components.push(...subcategory);
        });
        return components;
    }

    static getComponentById(id: string): ComponentDefinition | null {
        const allComponents = this.getAllComponents();
        return allComponents.find(component => component.id === id) || null;
    }

    static getCompatibleComponents(componentId: string): ComponentDefinition[] {
        const component = this.getComponentById(componentId);
        if (!component || !component.compatibility.connectsTo) return [];

        return this.getAllComponents().filter(c =>
            component.compatibility.connectsTo!.includes(c.category) &&
            !component.compatibility.incompatibleWith?.includes(c.id)
        );
    }

    static searchComponents(query: string): ComponentDefinition[] {
        const allComponents = this.getAllComponents();
        const lowerQuery = query.toLowerCase();

        return allComponents.filter(component =>
            component.name.toLowerCase().includes(lowerQuery) ||
            component.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            component.category.toLowerCase().includes(lowerQuery)
        );
    }
}
