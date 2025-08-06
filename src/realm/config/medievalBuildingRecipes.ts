// src/realm/config/medievalBuildingRecipes.ts

import { BuildingRecipe } from '../components/ModularBuilding';
import { MedievalComponentLibrary } from './medievalComponentLibrary';

// Helper function to find components
function findComponent(id: string, fallbackIds: string[] = []) {
    let component = MedievalComponentLibrary.getComponentById(id);
    if (!component) {
        for (const fallbackId of fallbackIds) {
            component = MedievalComponentLibrary.getComponentById(fallbackId);
            if (component) break;
        }
    }
    return component?.modelPath || `/models/components/${id}.glb`;
}

// MEDIEVAL HOUSE RECIPE - Simple residential building
export const MEDIEVAL_HOUSE_RECIPE: BuildingRecipe = {
    id: 'medieval_house',
    name: 'Medieval House',
    category: 'residential',
    baseSize: [3, 3],
    height: 4,
    components: {
        // Level 1 - Basic Structure
        1: [
            // Wooden floor foundation
            {
                type: 'foundation',
                modelPath: findComponent('wood_floor', ['floor_flat', 'floor']),
                position: [0, 0, 0],
                scale: [3, 1, 3]
            },
            // Basic walls with door
            {
                type: 'wall',
                modelPath: findComponent('wall_door'),
                position: [0, 0, -1.5], // Front wall with door
                rotation: [0, 0, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall', ['wall_half']),
                position: [-1.5, 0, 0], // Left wall
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall', ['wall_half']),
                position: [1.5, 0, 0], // Right wall
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall', ['wall_half']),
                position: [0, 0, 1.5], // Back wall
                rotation: [0, Math.PI, 0]
            },
            // Basic roof
            {
                type: 'roof',
                modelPath: findComponent('roof'),
                position: [0, 2.5, 0],
                scale: [3.5, 1, 3.5]
            }
        ],

        // Level 2 - Add windows and details
        2: [
            // Replace side walls with windowed versions
            {
                type: 'wall',
                modelPath: findComponent('wall_window'),
                position: [-1.5, 0, -0.5],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_window'),
                position: [1.5, 0, 0.5],
                rotation: [0, Math.PI / 2, 0]
            },
            // Add wooden support column
            {
                type: 'column',
                modelPath: findComponent('column_wood', ['column']),
                position: [1.2, 0, -1.2],
                scale: [0.8, 1, 0.8]
            },
            // Add overhang for entrance
            {
                type: 'decoration',
                modelPath: findComponent('overhang'),
                position: [0, 2.2, -1.8],
                scale: [2, 1, 1]
            }
        ],

        // Level 3 - Decorative elements
        3: [
            // Add decorative details
            {
                type: 'decoration',
                modelPath: findComponent('barrels'),
                position: [2, 0, 1.8],
                scale: [0.8, 0.8, 0.8]
            },
            // Upgrade to painted walls for prosperity
            {
                type: 'wall',
                modelPath: findComponent('wall_paint_door', ['wall_door']),
                position: [0, 0, -1.5],
                rotation: [0, 0, 0]
            }
        ]
    }
};

// MEDIEVAL CASTLE RECIPE - Fortress with towers
export const MEDIEVAL_CASTLE_RECIPE: BuildingRecipe = {
    id: 'medieval_castle',
    name: 'Medieval Castle',
    category: 'military',
    baseSize: [6, 6],
    height: 8,
    components: {
        // Level 1 - Foundation and base walls
        1: [
            // Stone floor foundation
            {
                type: 'foundation',
                modelPath: findComponent('floor'),
                position: [0, 0, 0],
                scale: [6, 1, 6]
            },
            // Fortified walls around perimeter
            {
                type: 'wall',
                modelPath: findComponent('wall_fortified_gate', ['wall_fortified_door']),
                position: [0, 0, -3], // Front gate
                rotation: [0, 0, 0]
            },
            // Corner towers
            {
                type: 'tower',
                modelPath: findComponent('tower_base'),
                position: [-2.5, 0, -2.5], // Front left tower
                scale: [0.8, 1, 0.8]
            },
            {
                type: 'tower',
                modelPath: findComponent('tower_base'),
                position: [2.5, 0, -2.5], // Front right tower
                scale: [0.8, 1, 0.8]
            },
            // Side fortified walls
            {
                type: 'wall',
                modelPath: findComponent('wall_fortified'),
                position: [-3, 0, 0],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_fortified'),
                position: [3, 0, 0],
                rotation: [0, Math.PI / 2, 0]
            }
        ],

        // Level 2 - Complete wall circuit and tower sections
        2: [
            // Complete the fortified wall perimeter
            {
                type: 'wall',
                modelPath: findComponent('wall_fortified'),
                position: [0, 0, 3], // Back wall
                rotation: [0, Math.PI, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_fortified_window'),
                position: [-1.5, 0, -3], // Left front wall with window
                rotation: [0, 0, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_fortified_window'),
                position: [1.5, 0, -3], // Right front wall with window
                rotation: [0, 0, 0]
            },
            // Add tower middle sections
            {
                type: 'tower',
                modelPath: findComponent('tower'),
                position: [-2.5, 3, -2.5],
                scale: [0.8, 1, 0.8]
            },
            {
                type: 'tower',
                modelPath: findComponent('tower'),
                position: [2.5, 3, -2.5],
                scale: [0.8, 1, 0.8]
            },
            // Back corner towers
            {
                type: 'tower',
                modelPath: findComponent('tower_base'),
                position: [-2.5, 0, 2.5],
                scale: [0.8, 1, 0.8]
            },
            {
                type: 'tower',
                modelPath: findComponent('tower_base'),
                position: [2.5, 0, 2.5],
                scale: [0.8, 1, 0.8]
            }
        ],

        // Level 3 - Battlements and tower tops
        3: [
            // Battlements on walls
            {
                type: 'decoration',
                modelPath: findComponent('battlement'),
                position: [0, 4, -3],
                rotation: [0, 0, 0]
            },
            {
                type: 'decoration',
                modelPath: findComponent('battlement'),
                position: [-3, 4, 0],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'decoration',
                modelPath: findComponent('battlement'),
                position: [3, 4, 0],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'decoration',
                modelPath: findComponent('battlement'),
                position: [0, 4, 3],
                rotation: [0, Math.PI, 0]
            },
            // Battlement corners
            {
                type: 'decoration',
                modelPath: findComponent('battlement_corner_outer'),
                position: [-3, 4, -3],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'decoration',
                modelPath: findComponent('battlement_corner_outer'),
                position: [3, 4, -3],
                rotation: [0, 0, 0]
            },
            // Tower tops
            {
                type: 'tower',
                modelPath: findComponent('tower_top'),
                position: [-2.5, 6, -2.5],
                scale: [0.8, 1, 0.8]
            },
            {
                type: 'tower',
                modelPath: findComponent('tower_top'),
                position: [2.5, 6, -2.5],
                scale: [0.8, 1, 0.8]
            },
            // Complete back towers
            {
                type: 'tower',
                modelPath: findComponent('tower'),
                position: [-2.5, 3, 2.5],
                scale: [0.8, 1, 0.8]
            },
            {
                type: 'tower',
                modelPath: findComponent('tower'),
                position: [2.5, 3, 2.5],
                scale: [0.8, 1, 0.8]
            },
            {
                type: 'tower',
                modelPath: findComponent('tower_top'),
                position: [-2.5, 6, 2.5],
                scale: [0.8, 1, 0.8]
            },
            {
                type: 'tower',
                modelPath: findComponent('tower_top'),
                position: [2.5, 6, 2.5],
                scale: [0.8, 1, 0.8]
            }
        ]
    }
};

// MEDIEVAL TAVERN RECIPE - Two-story tavern with character
export const MEDIEVAL_TAVERN_RECIPE: BuildingRecipe = {
    id: 'medieval_tavern',
    name: 'Medieval Tavern',
    category: 'commercial',
    baseSize: [4, 3],
    height: 5,
    components: {
        // Level 1 - Ground floor structure
        1: [
            // Wooden floor
            {
                type: 'foundation',
                modelPath: findComponent('wood_floor'),
                position: [0, 0, 0],
                scale: [4, 1, 3]
            },
            // Walls with large door for patrons
            {
                type: 'wall',
                modelPath: findComponent('wall_door', ['wall_gate']),
                position: [0, 0, -1.5],
                rotation: [0, 0, 0]
            },
            // Side walls
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_wood', ['wall']),
                position: [-2, 0, 0],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_wood_window', ['wall_window']),
                position: [2, 0, 0],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_wood', ['wall']),
                position: [0, 0, 1.5],
                rotation: [0, Math.PI, 0]
            },
            // Wooden support columns
            {
                type: 'column',
                modelPath: findComponent('column_wood'),
                position: [-1.5, 0, -1],
                scale: [0.8, 1, 0.8]
            },
            {
                type: 'column',
                modelPath: findComponent('column_wood'),
                position: [1.5, 0, -1],
                scale: [0.8, 1, 0.8]
            }
        ],

        // Level 2 - Second floor and details
        2: [
            // Second floor
            {
                type: 'foundation',
                modelPath: findComponent('wood_floor'),
                position: [0, 3, 0],
                scale: [4, 1, 3]
            },
            // Upper walls with windows
            {
                type: 'wall',
                modelPath: findComponent('wall-pane-painted-wood-window', ['wall_paint_window']),
                position: [-2, 3, 0],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall-pane-painted-wood-window', ['wall_paint_window']),
                position: [2, 3, 0],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_painted_wood', ['wall_paint']),
                position: [0, 3, 1.5],
                rotation: [0, Math.PI, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_painted_wood', ['wall_paint']),
                position: [0, 3, -1.5],
                rotation: [0, 0, 0]
            },
            // Overhang for character
            {
                type: 'decoration',
                modelPath: findComponent('overhang'),
                position: [0, 2.5, -2],
                scale: [3, 1, 1]
            },
            // Stairs to second floor
            {
                type: 'stairs',
                modelPath: findComponent('stairs_wood'),
                position: [1.5, 0, 1],
                rotation: [0, Math.PI / 2, 0],
                scale: [0.8, 1, 0.8]
            }
        ],

        // Level 3 - Roof and tavern atmosphere
        3: [
            // Roof
            {
                type: 'roof',
                modelPath: findComponent('roof'),
                position: [0, 4.5, 0],
                scale: [4.5, 1, 3.5]
            },
            // Roof edges for detail
            {
                type: 'roof',
                modelPath: findComponent('roof_edge'),
                position: [0, 4.2, -1.5],
                scale: [4, 1, 1]
            },
            {
                type: 'roof',
                modelPath: findComponent('roof_edge'),
                position: [0, 4.2, 1.5],
                scale: [4, 1, 1]
            },
            // Barrels outside for atmosphere
            {
                type: 'decoration',
                modelPath: findComponent('barrels'),
                position: [-2.5, 0, -2],
                scale: [0.8, 0.8, 0.8]
            },
            {
                type: 'decoration',
                modelPath: findComponent('detail_crate'),
                position: [2.5, 0, -2],
                scale: [0.8, 0.8, 0.8]
            }
        ]
    }
};

// GUARD TOWER RECIPE - Defensive tower structure
export const GUARD_TOWER_RECIPE: BuildingRecipe = {
    id: 'guard_tower',
    name: 'Guard Tower',
    category: 'military',
    baseSize: [3, 3],
    height: 8,
    components: {
        // Level 1 - Foundation and base
        1: [
            // Stone foundation
            {
                type: 'foundation',
                modelPath: findComponent('floor'),
                position: [0, 0, 0],
                scale: [3, 1, 3]
            },
            // Tower base
            {
                type: 'tower',
                modelPath: findComponent('tower_base'),
                position: [0, 0, 0]
            }
        ],

        // Level 2 - Tower section with door
        2: [
            {
                type: 'tower',
                modelPath: findComponent('tower'),
                position: [0, 4, 0]
            },
            // Add fortified door at base level
            {
                type: 'wall',
                modelPath: findComponent('wall_fortified_door', ['wall_door']),
                position: [0, 0, -1.5],
                rotation: [0, 0, 0],
                scale: [0.8, 1, 0.8]
            }
        ],

        // Level 3 - Tower top with battlements
        3: [
            {
                type: 'tower',
                modelPath: findComponent('tower_top'),
                position: [0, 8, 0]
            },
            // Battlements for defense
            {
                type: 'decoration',
                modelPath: findComponent('battlement_half'),
                position: [0, 8, -1.5],
                rotation: [0, 0, 0]
            },
            {
                type: 'decoration',
                modelPath: findComponent('battlement_half'),
                position: [-1.5, 8, 0],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'decoration',
                modelPath: findComponent('battlement_half'),
                position: [1.5, 8, 0],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'decoration',
                modelPath: findComponent('battlement_half'),
                position: [0, 8, 1.5],
                rotation: [0, Math.PI, 0]
            },
            // Ladder for access
            {
                type: 'stairs',
                modelPath: findComponent('ladder'),
                position: [1.2, 0, 1.2],
                scale: [1, 2, 1]
            }
        ]
    }
};

// SIMPLE FARM RECIPE - Agricultural building
export const MEDIEVAL_FARM_RECIPE: BuildingRecipe = {
    id: 'medieval_farm',
    name: 'Medieval Farm',
    category: 'resource',
    baseSize: [4, 3],
    height: 3,
    components: {
        // Level 1 - Basic barn structure
        1: [
            // Wooden foundation
            {
                type: 'foundation',
                modelPath: findComponent('wood_floor'),
                position: [0, 0, 0],
                scale: [4, 1, 3]
            },
            // Basic wooden walls
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_wood_door', ['wall_door']),
                position: [0, 0, -1.5],
                rotation: [0, 0, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_wood', ['wall']),
                position: [-2, 0, 0],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_wood', ['wall']),
                position: [2, 0, 0],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_wood', ['wall']),
                position: [0, 0, 1.5],
                rotation: [0, Math.PI, 0]
            },
            // Basic roof
            {
                type: 'roof',
                modelPath: findComponent('roof'),
                position: [0, 2, 0],
                scale: [4.5, 1, 3.5]
            }
        ],

        // Level 2 - Add farm details
        2: [
            // Add windows for light
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_wood_window', ['wall_window']),
                position: [-2, 0, -0.5],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_wood_window', ['wall_window']),
                position: [2, 0, 0.5],
                rotation: [0, Math.PI / 2, 0]
            },
            // Storage outside
            {
                type: 'decoration',
                modelPath: findComponent('detail_crate'),
                position: [2.5, 0, -1.5],
                scale: [0.8, 0.8, 0.8]
            },
            {
                type: 'decoration',
                modelPath: findComponent('barrels'),
                position: [-2.5, 0, 1.5],
                scale: [0.8, 0.8, 0.8]
            }
        ],

        // Level 3 - Upgrade to painted/prosperous farm
        3: [
            // Upgrade to painted walls
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_painted_wood_door', ['wall_paint_door']),
                position: [0, 0, -1.5],
                rotation: [0, 0, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_painted_wood_window', ['wall_paint_window']),
                position: [-2, 0, -0.5],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: findComponent('wall_pane_painted_wood_window', ['wall_paint_window']),
                position: [2, 0, 0.5],
                rotation: [0, Math.PI / 2, 0]
            }
        ]
    }
};

// Export all recipes
export const MEDIEVAL_BUILDING_RECIPES: { [key: string]: BuildingRecipe } = {
    house: MEDIEVAL_HOUSE_RECIPE,
    castle: MEDIEVAL_CASTLE_RECIPE,
    tavern: MEDIEVAL_TAVERN_RECIPE,
    tower: GUARD_TOWER_RECIPE,
    farm: MEDIEVAL_FARM_RECIPE
};

// Helper function to get recipe by building type
export const getMedievalBuildingRecipe = (buildingType: string): BuildingRecipe | undefined => {
    return MEDIEVAL_BUILDING_RECIPES[buildingType];
};

// Generate variations of buildings using different component styles
export const generateBuildingVariation = (
    baseRecipe: BuildingRecipe,
    style: 'basic' | 'painted' | 'fortified'
): BuildingRecipe => {
    const variation = JSON.parse(JSON.stringify(baseRecipe)); // Deep clone

    // Apply style modifications to components
    Object.keys(variation.components).forEach(level => {
        variation.components[level] = variation.components[level].map((component: { type: string; modelPath: string; }) => {
            if (component.type === 'wall') {
                // Replace walls based on style
                if (style === 'painted' && component.modelPath.includes('wall-')) {
                    component.modelPath = component.modelPath.replace('wall-', 'wall-paint-');
                } else if (style === 'fortified' && component.modelPath.includes('wall-')) {
                    component.modelPath = component.modelPath.replace('wall-', 'wall-fortified-');
                }
            }
            return component;
        });
    });

    variation.id = `${baseRecipe.id}_${style}`;
    variation.name = `${baseRecipe.name} (${style})`;

    return variation;
};
