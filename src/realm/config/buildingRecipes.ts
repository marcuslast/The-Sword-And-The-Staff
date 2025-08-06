import { BuildingRecipe } from '../components/ModularBuilding';

// Town Hall Recipe - 3 levels of construction
export const TOWN_HALL_RECIPE: BuildingRecipe = {
    id: 'townhall',
    name: 'Town Hall',
    category: 'special',
    baseSize: [3, 3],
    height: 4,
    components: {
        // Level 1 - Basic structure
        1: [
            // Foundation
            {
                type: 'foundation',
                modelPath: '/models/components/foundation.glb',
                position: [0, 0, 0],
                scale: [3, 1, 3]
            },
            // Corner walls
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [-1, 0, -1],
                rotation: [0, 0, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [1, 0, -1],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [1, 0, 1],
                rotation: [0, Math.PI, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [-1, 0, 1],
                rotation: [0, -Math.PI / 2, 0]
            },
            // Front door
            {
                type: 'door',
                modelPath: '/models/components/door.glb',
                position: [0, 0, -1],
                rotation: [0, 0, 0]
            },
            // Simple roof
            {
                type: 'roof',
                modelPath: '/models/components/roof_simple.glb',
                position: [0, 2, 0],
                scale: [3.2, 1, 3.2]
            }
        ],

        // Level 2 - Add windows and decorations
        2: [
            // Windows on sides
            {
                type: 'window',
                modelPath: '/models/components/window.glb',
                position: [-1, 1, 0],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'window',
                modelPath: '/models/components/window.glb',
                position: [1, 1, 0],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'window',
                modelPath: '/models/components/window.glb',
                position: [0, 1, 1],
                rotation: [0, Math.PI, 0]
            },
            // Decorative pillars
            {
                type: 'pillar',
                modelPath: '/models/components/pillar.glb',
                position: [-0.8, 0, -1.2],
                scale: [1, 2, 1]
            },
            {
                type: 'pillar',
                modelPath: '/models/components/pillar.glb',
                position: [0.8, 0, -1.2],
                scale: [1, 2, 1]
            }
        ],

        // Level 3 - Second floor and better roof
        3: [
            // Second floor walls
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [-1, 2, -1],
                rotation: [0, 0, 0],
                scale: [1, 0.8, 1]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [1, 2, -1],
                rotation: [0, Math.PI / 2, 0],
                scale: [1, 0.8, 1]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [1, 2, 1],
                rotation: [0, Math.PI, 0],
                scale: [1, 0.8, 1]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [-1, 2, 1],
                rotation: [0, -Math.PI / 2, 0],
                scale: [1, 0.8, 1]
            },
            // Replace simple roof with elaborate one
            {
                type: 'roof',
                modelPath: '/models/components/roof_elaborate.glb',
                position: [0, 3.5, 0],
                scale: [3.5, 1.2, 3.5]
            },
            // Chimney
            {
                type: 'chimney',
                modelPath: '/models/components/chimney.glb',
                position: [0.8, 4, 0.8]
            }
        ]
    }
};

// House Recipe
export const HOUSE_RECIPE: BuildingRecipe = {
    id: 'house',
    name: 'Residence',
    category: 'residential',
    baseSize: [2, 2],
    height: 2.5,
    components: {
        1: [
            // Foundation
            {
                type: 'foundation',
                modelPath: '/models/components/foundation.glb',
                position: [0, 0, 0],
                scale: [2, 1, 2]
            },
            // Walls
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [-1, 0, -1],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [1, 0, -1],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [1, 0, 1],
                rotation: [0, Math.PI, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [-1, 0, 1],
                rotation: [0, -Math.PI / 2, 0]
            },
            // Door
            {
                type: 'door',
                modelPath: '/models/components/door.glb',
                position: [0, 0, -1],
                rotation: [0, 0, 0]
            },
            // Roof
            {
                type: 'roof',
                modelPath: '/models/components/roof_simple.glb',
                position: [0, 1.5, 0],
                scale: [2.2, 1, 2.2]
            }
        ],
        2: [
            // Add windows
            {
                type: 'window',
                modelPath: '/models/components/window.glb',
                position: [-1, 0.8, 0],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'window',
                modelPath: '/models/components/window.glb',
                position: [1, 0.8, 0],
                rotation: [0, Math.PI / 2, 0]
            },
            // Chimney
            {
                type: 'chimney',
                modelPath: '/models/components/chimney.glb',
                position: [0.6, 2.5, 0.6],
                scale: [0.8, 0.8, 0.8]
            }
        ]
    }
};

// Farm Recipe
export const FARM_RECIPE: BuildingRecipe = {
    id: 'farm',
    name: 'Farm',
    category: 'resource',
    baseSize: [3, 2],
    height: 2,
    components: {
        1: [
            // Foundation
            {
                type: 'foundation',
                modelPath: '/models/components/foundation.glb',
                position: [0, 0, 0],
                scale: [3, 1, 2]
            },
            // Walls - barn style
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [-1.5, 0, -1],
                rotation: [0, 0, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [1.5, 0, -1],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [1.5, 0, 1],
                rotation: [0, Math.PI, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall.glb',
                position: [-1.5, 0, 1],
                rotation: [0, -Math.PI / 2, 0]
            },
            // Large door for farm equipment
            {
                type: 'door',
                modelPath: '/models/components/door_large.glb',
                position: [0, 0, -1],
                rotation: [0, 0, 0]
            },
            // Slanted roof
            {
                type: 'roof',
                modelPath: '/models/components/roof_slanted.glb',
                position: [0, 1.5, 0],
                scale: [3.2, 1, 2.2]
            }
        ],
        2: [
            // Add silo
            {
                type: 'decoration',
                modelPath: '/models/components/silo.glb',
                position: [2.5, 0, 0],
                scale: [0.8, 1.5, 0.8]
            },
            // Windows
            {
                type: 'window',
                modelPath: '/models/components/window.glb',
                position: [-1.5, 0.8, 0],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                type: 'window',
                modelPath: '/models/components/window.glb',
                position: [1.5, 0.8, 0],
                rotation: [0, Math.PI / 2, 0]
            }
        ]
    }
};

// Mine Recipe
export const MINE_RECIPE: BuildingRecipe = {
    id: 'mine',
    name: 'Iron Mine',
    category: 'resource',
    baseSize: [2, 3],
    height: 3,
    components: {
        1: [
            // Foundation with mine entrance
            {
                type: 'foundation',
                modelPath: '/models/components/foundation_stone.glb',
                position: [0, 0, 0],
                scale: [2, 1, 3]
            },
            // Mine entrance walls
            {
                type: 'wall',
                modelPath: '/models/components/wall_stone.glb',
                position: [-1, 0, -1.5],
                rotation: [0, 0, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall_stone.glb',
                position: [1, 0, -1.5],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall_stone.glb',
                position: [1, 0, 1.5],
                rotation: [0, Math.PI, 0]
            },
            {
                type: 'wall',
                modelPath: '/models/components/wall_stone.glb',
                position: [-1, 0, 1.5],
                rotation: [0, -Math.PI / 2, 0]
            },
            // Mine shaft entrance
            {
                type: 'door',
                modelPath: '/models/components/mine_entrance.glb',
                position: [0, 0, -1.5],
                rotation: [0, 0, 0]
            },
            // Support beams
            {
                type: 'pillar',
                modelPath: '/models/components/beam.glb',
                position: [-0.8, 0, -1.2],
                scale: [1, 2, 1]
            },
            {
                type: 'pillar',
                modelPath: '/models/components/beam.glb',
                position: [0.8, 0, -1.2],
                scale: [1, 2, 1]
            },
            // Simple roof
            {
                type: 'roof',
                modelPath: '/models/components/roof_simple.glb',
                position: [0, 1.5, 0],
                scale: [2.2, 1, 3.2]
            }
        ],
        2: [
            // Add mining equipment
            {
                type: 'decoration',
                modelPath: '/models/components/mining_cart.glb',
                position: [-1.2, 0, 0]
            },
            {
                type: 'decoration',
                modelPath: '/models/components/pickaxe_rack.glb',
                position: [1, 0, 0.5]
            },
            // Chimney for forge
            {
                type: 'chimney',
                modelPath: '/models/components/chimney_stone.glb',
                position: [0.8, 2.5, 0.8]
            }
        ]
    }
};

// Export all recipes
export const BUILDING_RECIPES: { [key: string]: BuildingRecipe } = {
    townhall: TOWN_HALL_RECIPE,
    house: HOUSE_RECIPE,
    farm: FARM_RECIPE,
    mine: MINE_RECIPE,
    // Add more recipes as needed...
};

// Helper function to get recipe by building type
export const getBuildingRecipe = (buildingType: string): BuildingRecipe | undefined => {
    return BUILDING_RECIPES[buildingType];
};
