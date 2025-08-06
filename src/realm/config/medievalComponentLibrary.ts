export interface MedievalComponent {
    id: string;
    name: string;
    category: 'foundation' | 'wall' | 'roof' | 'column' | 'tower' | 'detail' | 'stairs' | 'fence' | 'decoration';
    subcategory: string;
    modelPath: string;
    defaultScale: [number, number, number];
    defaultRotation: [number, number, number];
    boundingBox: { width: number; height: number; depth: number };
    tags: string[];
    connectsTo: string[];
    buildingTypes: string[]; // Which building types commonly use this
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

// Your actual component library based on the file list
export const MEDIEVAL_COMPONENTS: MedievalComponent[] = [
    // === FOUNDATION & FLOORS ===
    {
        id: 'floor',
        name: 'Stone Floor',
        category: 'foundation',
        subcategory: 'floors',
        modelPath: '/models/components/floor.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 0.2, depth: 2 },
        tags: ['stone', 'foundation', 'basic'],
        connectsTo: ['wall', 'column', 'stairs'],
        buildingTypes: ['house', 'castle', 'tower', 'shop'],
        rarity: 'common'
    },
    {
        id: 'floor_flat',
        name: 'Flat Floor',
        category: 'foundation',
        subcategory: 'floors',
        modelPath: '/models/components/floor-flat.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 0.1, depth: 2 },
        tags: ['flat', 'foundation', 'smooth'],
        connectsTo: ['wall', 'column'],
        buildingTypes: ['house', 'shop', 'tavern'],
        rarity: 'common'
    },
    {
        id: 'wood_floor',
        name: 'Wooden Floor',
        category: 'foundation',
        subcategory: 'floors',
        modelPath: '/models/components/wood-floor.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 0.15, depth: 2 },
        tags: ['wood', 'foundation', 'rustic'],
        connectsTo: ['wall', 'fence'],
        buildingTypes: ['house', 'tavern', 'shop'],
        rarity: 'common'
    },
    {
        id: 'wood_floor_half',
        name: 'Half Wooden Floor',
        category: 'foundation',
        subcategory: 'floors',
        modelPath: '/models/components/wood-floor-half.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 1, height: 0.15, depth: 2 },
        tags: ['wood', 'half', 'partial'],
        connectsTo: ['wall', 'fence'],
        buildingTypes: ['house', 'bridge'],
        rarity: 'common'
    },

    // === WALLS (Basic) ===
    {
        id: 'wall',
        name: 'Stone Wall',
        category: 'wall',
        subcategory: 'basic',
        modelPath: '/models/components/wall.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 3, depth: 0.3 },
        tags: ['stone', 'basic', 'structural'],
        connectsTo: ['foundation', 'wall', 'roof', 'column'],
        buildingTypes: ['castle', 'tower', 'fortress'],
        rarity: 'common'
    },
    {
        id: 'wall_half',
        name: 'Half Stone Wall',
        category: 'wall',
        subcategory: 'basic',
        modelPath: '/models/components/wall-half.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 1, height: 3, depth: 0.3 },
        tags: ['stone', 'half', 'partial'],
        connectsTo: ['wall', 'foundation'],
        buildingTypes: ['house', 'shop'],
        rarity: 'common'
    },
    {
        id: 'wall_low',
        name: 'Low Stone Wall',
        category: 'wall',
        subcategory: 'basic',
        modelPath: '/models/components/wall-low.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 1.5, depth: 0.3 },
        tags: ['stone', 'low', 'barrier'],
        connectsTo: ['foundation', 'wall'],
        buildingTypes: ['garden', 'courtyard'],
        rarity: 'common'
    },

    // === WALLS (With Openings) ===
    {
        id: 'wall_door',
        name: 'Wall with Door',
        category: 'wall',
        subcategory: 'openings',
        modelPath: '/models/components/wall-door.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 3, depth: 0.3 },
        tags: ['stone', 'door', 'entrance'],
        connectsTo: ['foundation', 'wall'],
        buildingTypes: ['house', 'castle', 'shop'],
        rarity: 'common'
    },
    {
        id: 'wall_window',
        name: 'Wall with Window',
        category: 'wall',
        subcategory: 'openings',
        modelPath: '/models/components/wall-window.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 3, depth: 0.3 },
        tags: ['stone', 'window', 'light'],
        connectsTo: ['foundation', 'wall'],
        buildingTypes: ['house', 'castle', 'shop'],
        rarity: 'common'
    },
    {
        id: 'wall_gate',
        name: 'Wall with Gate',
        category: 'wall',
        subcategory: 'openings',
        modelPath: '/models/components/wall-gate.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 3, depth: 0.3 },
        tags: ['stone', 'gate', 'entrance', 'large'],
        connectsTo: ['foundation', 'wall'],
        buildingTypes: ['castle', 'fortress', 'city'],
        rarity: 'uncommon'
    },

    // === WALLS (Fortified) ===
    {
        id: 'wall_fortified',
        name: 'Fortified Wall',
        category: 'wall',
        subcategory: 'fortified',
        modelPath: '/models/components/wall-fortified.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 4, depth: 0.4 },
        tags: ['stone', 'fortified', 'defensive', 'strong'],
        connectsTo: ['foundation', 'wall', 'battlement'],
        buildingTypes: ['castle', 'fortress', 'tower'],
        rarity: 'uncommon'
    },
    {
        id: 'wall_fortified_door',
        name: 'Fortified Wall with Door',
        category: 'wall',
        subcategory: 'fortified',
        modelPath: '/models/components/wall-fortified-door.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 4, depth: 0.4 },
        tags: ['stone', 'fortified', 'door', 'defensive'],
        connectsTo: ['foundation', 'wall'],
        buildingTypes: ['castle', 'fortress'],
        rarity: 'uncommon'
    },
    {
        id: 'wall_fortified_gate',
        name: 'Fortified Gate',
        category: 'wall',
        subcategory: 'fortified',
        modelPath: '/models/components/wall-fortified-gate.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 4, depth: 0.4 },
        tags: ['stone', 'fortified', 'gate', 'entrance'],
        connectsTo: ['foundation', 'wall'],
        buildingTypes: ['castle', 'fortress'],
        rarity: 'rare'
    },

    // === WALLS (Painted/Decorative) ===
    {
        id: 'wall_paint',
        name: 'Painted Wall',
        category: 'wall',
        subcategory: 'decorative',
        modelPath: '/models/components/wall-paint.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 3, depth: 0.3 },
        tags: ['painted', 'decorative', 'colorful'],
        connectsTo: ['foundation', 'wall'],
        buildingTypes: ['house', 'shop', 'tavern'],
        rarity: 'uncommon'
    },
    {
        id: 'wall_pane',
        name: 'Paneled Wall',
        category: 'wall',
        subcategory: 'decorative',
        modelPath: '/models/components/wall-pane.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 3, depth: 0.3 },
        tags: ['paneled', 'decorative', 'detailed'],
        connectsTo: ['foundation', 'wall'],
        buildingTypes: ['house', 'mansion', 'shop'],
        rarity: 'uncommon'
    },

    // === COLUMNS ===
    {
        id: 'column',
        name: 'Stone Column',
        category: 'column',
        subcategory: 'basic',
        modelPath: '/models/components/column.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 0.6, height: 4, depth: 0.6 },
        tags: ['stone', 'column', 'support', 'pillar'],
        connectsTo: ['foundation', 'roof', 'overhang'],
        buildingTypes: ['castle', 'temple', 'mansion'],
        rarity: 'common'
    },
    {
        id: 'column_wood',
        name: 'Wooden Column',
        category: 'column',
        subcategory: 'basic',
        modelPath: '/models/components/column-wood.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 0.5, height: 4, depth: 0.5 },
        tags: ['wood', 'column', 'support', 'rustic'],
        connectsTo: ['foundation', 'roof', 'wood_floor'],
        buildingTypes: ['house', 'tavern', 'shop'],
        rarity: 'common'
    },
    {
        id: 'column_paint',
        name: 'Painted Column',
        category: 'column',
        subcategory: 'decorative',
        modelPath: '/models/components/column-paint.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 0.6, height: 4, depth: 0.6 },
        tags: ['painted', 'decorative', 'colorful'],
        connectsTo: ['foundation', 'roof'],
        buildingTypes: ['mansion', 'temple', 'palace'],
        rarity: 'uncommon'
    },

    // === ROOFS ===
    {
        id: 'roof',
        name: 'Basic Roof',
        category: 'roof',
        subcategory: 'basic',
        modelPath: '/models/components/roof.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 1.5, depth: 2 },
        tags: ['roof', 'basic', 'tile'],
        connectsTo: ['wall', 'column'],
        buildingTypes: ['house', 'shop', 'basic'],
        rarity: 'common'
    },
    {
        id: 'roof_edge',
        name: 'Roof Edge',
        category: 'roof',
        subcategory: 'edge',
        modelPath: '/models/components/roof-edge.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 1.2, depth: 0.5 },
        tags: ['roof', 'edge', 'trim'],
        connectsTo: ['roof'],
        buildingTypes: ['house', 'castle'],
        rarity: 'common'
    },
    {
        id: 'roof_corner',
        name: 'Roof Corner',
        category: 'roof',
        subcategory: 'corner',
        modelPath: '/models/components/roof-corner.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 1.5, height: 1.5, depth: 1.5 },
        tags: ['roof', 'corner', 'joint'],
        connectsTo: ['roof'],
        buildingTypes: ['house', 'castle'],
        rarity: 'common'
    },

    // === TOWERS ===
    {
        id: 'tower_base',
        name: 'Tower Base',
        category: 'tower',
        subcategory: 'base',
        modelPath: '/models/components/tower-base.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 3, height: 4, depth: 3 },
        tags: ['tower', 'base', 'foundation', 'large'],
        connectsTo: ['tower', 'wall'],
        buildingTypes: ['castle', 'fortress', 'tower'],
        rarity: 'rare'
    },
    {
        id: 'tower',
        name: 'Tower Section',
        category: 'tower',
        subcategory: 'middle',
        modelPath: '/models/components/tower.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 3, height: 4, depth: 3 },
        tags: ['tower', 'section', 'cylindrical'],
        connectsTo: ['tower_base', 'tower_top', 'tower'],
        buildingTypes: ['castle', 'fortress', 'tower'],
        rarity: 'rare'
    },
    {
        id: 'tower_top',
        name: 'Tower Top',
        category: 'tower',
        subcategory: 'top',
        modelPath: '/models/components/tower-top.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 3, height: 2, depth: 3 },
        tags: ['tower', 'top', 'cap', 'roof'],
        connectsTo: ['tower'],
        buildingTypes: ['castle', 'fortress', 'tower'],
        rarity: 'rare'
    },

    // === BATTLEMENTS ===
    {
        id: 'battlement',
        name: 'Battlement',
        category: 'wall',
        subcategory: 'defensive',
        modelPath: '/models/components/battlement.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 1, depth: 0.5 },
        tags: ['battlement', 'defensive', 'castle', 'crenellation'],
        connectsTo: ['wall_fortified'],
        buildingTypes: ['castle', 'fortress'],
        rarity: 'rare'
    },
    {
        id: 'battlement_corner_outer',
        name: 'Outer Battlement Corner',
        category: 'wall',
        subcategory: 'defensive',
        modelPath: '/models/components/battlement-corner-outer.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 1.5, height: 1, depth: 1.5 },
        tags: ['battlement', 'corner', 'outer', 'defensive'],
        connectsTo: ['battlement'],
        buildingTypes: ['castle', 'fortress'],
        rarity: 'rare'
    },

    // === STAIRS ===
    {
        id: 'stairs_stone',
        name: 'Stone Stairs',
        category: 'stairs',
        subcategory: 'basic',
        modelPath: '/models/components/stairs-stone.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 1.5, depth: 3 },
        tags: ['stairs', 'stone', 'steps'],
        connectsTo: ['foundation', 'floor'],
        buildingTypes: ['castle', 'house', 'tower'],
        rarity: 'common'
    },
    {
        id: 'stairs_wood',
        name: 'Wooden Stairs',
        category: 'stairs',
        subcategory: 'basic',
        modelPath: '/models/components/stairs-wood.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 1.5, depth: 3 },
        tags: ['stairs', 'wood', 'steps', 'rustic'],
        connectsTo: ['wood_floor', 'foundation'],
        buildingTypes: ['house', 'tavern', 'shop'],
        rarity: 'common'
    },

    // === DECORATIVE DETAILS ===
    {
        id: 'barrels',
        name: 'Barrel Group',
        category: 'decoration',
        subcategory: 'props',
        modelPath: '/models/components/barrels.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 1.5, height: 1, depth: 1.5 },
        tags: ['barrels', 'storage', 'props', 'tavern'],
        connectsTo: [],
        buildingTypes: ['tavern', 'warehouse', 'shop'],
        rarity: 'common'
    },
    {
        id: 'detail_crate',
        name: 'Large Crate',
        category: 'decoration',
        subcategory: 'props',
        modelPath: '/models/components/detail-crate.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 1, height: 1, depth: 1 },
        tags: ['crate', 'storage', 'wood', 'cargo'],
        connectsTo: [],
        buildingTypes: ['warehouse', 'dock', 'shop'],
        rarity: 'common'
    },
    {
        id: 'ladder',
        name: 'Wooden Ladder',
        category: 'stairs',
        subcategory: 'utility',
        modelPath: '/models/components/ladder.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 0.5, height: 3, depth: 0.3 },
        tags: ['ladder', 'wood', 'climb', 'vertical'],
        connectsTo: ['wall', 'floor'],
        buildingTypes: ['house', 'tower', 'barn'],
        rarity: 'common'
    },

    // === FENCES ===
    {
        id: 'fence_wood',
        name: 'Wooden Fence',
        category: 'fence',
        subcategory: 'basic',
        modelPath: '/models/components/fence-wood.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 1.5, depth: 0.2 },
        tags: ['fence', 'wood', 'boundary', 'rustic'],
        connectsTo: ['fence', 'foundation'],
        buildingTypes: ['farm', 'garden', 'village'],
        rarity: 'common'
    },
    {
        id: 'fence',
        name: 'Stone Fence',
        category: 'fence',
        subcategory: 'basic',
        modelPath: '/models/components/fence.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 2, height: 1.5, depth: 0.3 },
        tags: ['fence', 'stone', 'boundary'],
        connectsTo: ['fence', 'foundation'],
        buildingTypes: ['castle', 'garden', 'estate'],
        rarity: 'common'
    },

    // === SPECIAL STRUCTURES ===
    {
        id: 'overhang',
        name: 'Building Overhang',
        category: 'decoration',
        subcategory: 'architectural',
        modelPath: '/models/components/overhang.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 3, height: 0.5, depth: 2 },
        tags: ['overhang', 'shelter', 'architectural'],
        connectsTo: ['wall', 'column'],
        buildingTypes: ['house', 'shop', 'tavern'],
        rarity: 'uncommon'
    },
    {
        id: 'tree_large',
        name: 'Large Tree',
        category: 'decoration',
        subcategory: 'nature',
        modelPath: '/models/components/tree-large.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 4, height: 8, depth: 4 },
        tags: ['tree', 'nature', 'large', 'landscape'],
        connectsTo: [],
        buildingTypes: ['park', 'garden', 'forest'],
        rarity: 'uncommon'
    },
    {
        id: 'water',
        name: 'Water Feature',
        category: 'decoration',
        subcategory: 'nature',
        modelPath: '/models/components/water.glb',
        defaultScale: [1, 1, 1],
        defaultRotation: [0, 0, 0],
        boundingBox: { width: 4, height: 0.2, depth: 4 },
        tags: ['water', 'pond', 'lake', 'nature'],
        connectsTo: [],
        buildingTypes: ['garden', 'park', 'fountain'],
        rarity: 'rare'
    }
];

// Utility functions for your medieval component system
export class MedievalComponentLibrary {
    static getAllComponents(): MedievalComponent[] {
        return MEDIEVAL_COMPONENTS;
    }

    static getComponentsByCategory(category: string): MedievalComponent[] {
        return MEDIEVAL_COMPONENTS.filter(comp => comp.category === category);
    }

    static getComponentsByBuildingType(buildingType: string): MedievalComponent[] {
        return MEDIEVAL_COMPONENTS.filter(comp =>
            comp.buildingTypes.includes(buildingType)
        );
    }

    static getComponentById(id: string): MedievalComponent | null {
        return MEDIEVAL_COMPONENTS.find(comp => comp.id === id) || null;
    }

    static getComponentsByRarity(rarity: 'common' | 'uncommon' | 'rare' | 'epic'): MedievalComponent[] {
        return MEDIEVAL_COMPONENTS.filter(comp => comp.rarity === rarity);
    }

    static getComponentsByTags(tags: string[]): MedievalComponent[] {
        return MEDIEVAL_COMPONENTS.filter(comp =>
            tags.some(tag => comp.tags.includes(tag))
        );
    }

    static getCompatibleComponents(componentId: string): MedievalComponent[] {
        const component = this.getComponentById(componentId);
        if (!component) return [];

        return MEDIEVAL_COMPONENTS.filter(comp =>
            component.connectsTo.includes(comp.category) ||
            comp.connectsTo.includes(component.category)
        );
    }

    static searchComponents(query: string): MedievalComponent[] {
        const lowerQuery = query.toLowerCase();
        return MEDIEVAL_COMPONENTS.filter(comp =>
            comp.name.toLowerCase().includes(lowerQuery) ||
            comp.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            comp.category.toLowerCase().includes(lowerQuery) ||
            comp.subcategory.toLowerCase().includes(lowerQuery)
        );
    }

    // Get recommended components for a building style
    static getRecommendedComponents(buildingType: string, style: 'basic' | 'fancy' | 'fortified' = 'basic'): {
        foundation: MedievalComponent[];
        walls: MedievalComponent[];
        roofs: MedievalComponent[];
        details: MedievalComponent[];
    } {
        const typeComponents = this.getComponentsByBuildingType(buildingType);

        const recommendations = {
            foundation: typeComponents.filter(c => c.category === 'foundation'),
            walls: typeComponents.filter(c => c.category === 'wall'),
            roofs: typeComponents.filter(c => c.category === 'roof'),
            details: typeComponents.filter(c => c.category === 'decoration')
        };

        // Filter by style preferences
        if (style === 'fancy') {
            ['walls', 'details'].forEach(cat => {
                recommendations[cat as keyof typeof recommendations] =
                    recommendations[cat as keyof typeof recommendations].filter(c =>
                        c.tags.includes('decorative') || c.tags.includes('painted') || c.rarity !== 'common'
                    );
            });
        } else if (style === 'fortified') {
            recommendations.walls = recommendations.walls.filter(c =>
                c.tags.includes('fortified') || c.tags.includes('defensive')
            );
        }

        return recommendations;
    }
}
