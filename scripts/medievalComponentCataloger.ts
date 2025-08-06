// scripts/medievalComponentCataloger.ts

import fs from 'fs';
import path from 'path';

// Your actual file list
const YOUR_GLB_FILES = [
    "models\\components\\barrels.glb",
    "models\\components\\battlement-corner-inner.glb",
    "models\\components\\battlement-corner-outer.glb",
    "models\\components\\battlement-half.glb",
    "models\\components\\battlement.glb",
    "models\\components\\bricks.glb",
    "models\\components\\column-damaged.glb",
    "models\\components\\column-paint-damaged.glb",
    "models\\components\\column-paint.glb",
    "models\\components\\column-wood.glb",
    "models\\components\\column.glb",
    "models\\components\\detail-barrel.glb",
    "models\\components\\detail-crate-ropes.glb",
    "models\\components\\detail-crate-small.glb",
    "models\\components\\detail-crate.glb",
    "models\\components\\dock-corner.glb",
    "models\\components\\dock-side.glb",
    "models\\components\\fence-top.glb",
    "models\\components\\fence-wood.glb",
    "models\\components\\fence.glb",
    "models\\components\\floor-flat.glb",
    "models\\components\\floor-stairs-corner-inner.glb",
    "models\\components\\floor-stairs-corner-outer.glb",
    "models\\components\\floor-stairs.glb",
    "models\\components\\floor-steps-corner-inner.glb",
    "models\\components\\floor-steps-corner-outer.glb",
    "models\\components\\floor-steps.glb",
    "models\\components\\floor.glb",
    "models\\components\\ladder.glb",
    "models\\components\\overhang-fence.glb",
    "models\\components\\overhang-round-railing.glb",
    "models\\components\\overhang-round.glb",
    "models\\components\\overhang.glb",
    "models\\components\\pulley-crate.glb",
    "models\\components\\pulley.glb",
    "models\\components\\roof-corner.glb",
    "models\\components\\roof-edge.glb",
    "models\\components\\roof-high-side-corner-inner.glb",
    "models\\components\\roof-high-side-corner.glb",
    "models\\components\\roof-high-side.glb",
    "models\\components\\roof-side-corner-inner.glb",
    "models\\components\\roof-side-corner.glb",
    "models\\components\\roof-side.glb",
    "models\\components\\roof.glb",
    "models\\components\\stairs-corner.glb",
    "models\\components\\stairs-stone.glb",
    "models\\components\\stairs-wood.glb",
    "models\\components\\structure-cross.glb",
    "models\\components\\structure-pole.glb",
    "models\\components\\structure-poles.glb",
    "models\\components\\structure-wall-cross.glb",
    "models\\components\\structure-wall.glb",
    "models\\components\\structure.glb",
    "models\\components\\tower-base.glb",
    "models\\components\\tower-edge.glb",
    "models\\components\\tower-paint-base.glb",
    "models\\components\\tower-paint.glb",
    "models\\components\\tower-top.glb",
    "models\\components\\tower.glb",
    "models\\components\\tree-large.glb",
    "models\\components\\tree-shrub.glb",
    "models\\components\\wall-detail.glb",
    "models\\components\\wall-door.glb",
    "models\\components\\wall-flat-gate.glb",
    "models\\components\\wall-fortified-door.glb",
    "models\\components\\wall-fortified-gate-half.glb",
    "models\\components\\wall-fortified-gate.glb",
    "models\\components\\wall-fortified-half.glb",
    "models\\components\\wall-fortified-paint-door.glb",
    "models\\components\\wall-fortified-paint-gate.glb",
    "models\\components\\wall-fortified-paint-half.glb",
    "models\\components\\wall-fortified-paint-window.glb",
    "models\\components\\wall-fortified-paint.glb",
    "models\\components\\wall-fortified-window.glb",
    "models\\components\\wall-fortified.glb",
    "models\\components\\wall-gate-half.glb",
    "models\\components\\wall-gate.glb",
    "models\\components\\wall-half.glb",
    "models\\components\\wall-low.glb",
    "models\\components\\wall-paint-detail.glb",
    "models\\components\\wall-paint-door.glb",
    "models\\components\\wall-paint-flat.glb",
    "models\\components\\wall-paint-gate.glb",
    "models\\components\\wall-paint-half.glb",
    "models\\components\\wall-paint-window.glb",
    "models\\components\\wall-paint.glb",
    "models\\components\\wall-pane-door.glb",
    "models\\components\\wall-pane-paint-door.glb",
    "models\\components\\wall-pane-paint-window.glb",
    "models\\components\\wall-pane-paint.glb",
    "models\\components\\wall-pane-painted-wood-door.glb",
    "models\\components\\wall-pane-painted-wood-window.glb",
    "models\\components\\wall-pane-painted-wood.glb",
    "models\\components\\wall-pane-window.glb",
    "models\\components\\wall-pane-wood-door.glb",
    "models\\components\\wall-pane-wood-window.glb",
    "models\\components\\wall-pane-wood.glb",
    "models\\components\\wall-pane.glb",
    "models\\components\\wall-window.glb",
    "models\\components\\wall.glb",
    "models\\components\\water.glb",
    "models\\components\\wood-floor-half.glb",
    "models\\components\\wood-floor-quarter.glb",
    "models\\components\\wood-floor-railing.glb",
    "models\\components\\wood-floor.glb"
];

interface ComponentDefinition {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    modelPath: string;
    boundingBox: { width: number; height: number; depth: number };
    tags: string[];
    connectsTo: string[];
    buildingTypes: string[];
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

// Categorization rules based on filename patterns
const COMPONENT_RULES = {
    // Foundations & Floors
    floor: { category: 'foundation', subcategory: 'floors', rarity: 'common', height: 0.2 },
    'wood-floor': { category: 'foundation', subcategory: 'floors', rarity: 'common', height: 0.15 },

    // Walls - Basic
    wall: { category: 'wall', subcategory: 'basic', rarity: 'common', height: 3, depth: 0.3 },
    'wall-half': { category: 'wall', subcategory: 'basic', rarity: 'common', height: 3, width: 1 },
    'wall-low': { category: 'wall', subcategory: 'basic', rarity: 'common', height: 1.5 },

    // Walls - With Openings
    'wall-door': { category: 'wall', subcategory: 'openings', rarity: 'common', height: 3 },
    'wall-window': { category: 'wall', subcategory: 'openings', rarity: 'common', height: 3 },
    'wall-gate': { category: 'wall', subcategory: 'openings', rarity: 'uncommon', height: 3 },

    // Walls - Fortified
    'wall-fortified': { category: 'wall', subcategory: 'fortified', rarity: 'uncommon', height: 4, depth: 0.4 },

    // Walls - Decorative
    'wall-paint': { category: 'wall', subcategory: 'decorative', rarity: 'uncommon', height: 3 },
    'wall-pane': { category: 'wall', subcategory: 'decorative', rarity: 'uncommon', height: 3 },

    // Columns
    column: { category: 'column', subcategory: 'basic', rarity: 'common', height: 4, width: 0.6, depth: 0.6 },
    'column-wood': { category: 'column', subcategory: 'basic', rarity: 'common', height: 4, width: 0.5, depth: 0.5 },
    'column-paint': { category: 'column', subcategory: 'decorative', rarity: 'uncommon', height: 4, width: 0.6, depth: 0.6 },

    // Roofs
    roof: { category: 'roof', subcategory: 'basic', rarity: 'common', height: 1.5, width: 2, depth: 2 },
    'roof-edge': { category: 'roof', subcategory: 'edge', rarity: 'common', height: 1.2, width: 2, depth: 0.5 },
    'roof-corner': { category: 'roof', subcategory: 'corner', rarity: 'common', height: 1.5, width: 1.5, depth: 1.5 },
    'roof-side': { category: 'roof', subcategory: 'side', rarity: 'common', height: 1.5 },
    'roof-high': { category: 'roof', subcategory: 'high', rarity: 'uncommon', height: 2 },

    // Towers
    'tower-base': { category: 'tower', subcategory: 'base', rarity: 'rare', height: 4, width: 3, depth: 3 },
    tower: { category: 'tower', subcategory: 'middle', rarity: 'rare', height: 4, width: 3, depth: 3 },
    'tower-top': { category: 'tower', subcategory: 'top', rarity: 'rare', height: 2, width: 3, depth: 3 },

    // Battlements
    battlement: { category: 'wall', subcategory: 'defensive', rarity: 'rare', height: 1, width: 2, depth: 0.5 },

    // Stairs
    stairs: { category: 'stairs', subcategory: 'basic', rarity: 'common', height: 1.5, width: 2, depth: 3 },
    ladder: { category: 'stairs', subcategory: 'utility', rarity: 'common', height: 3, width: 0.5, depth: 0.3 },

    // Fences
    fence: { category: 'fence', subcategory: 'basic', rarity: 'common', height: 1.5, width: 2, depth: 0.2 },

    // Decorative Elements
    barrels: { category: 'decoration', subcategory: 'props', rarity: 'common', height: 1, width: 1.5, depth: 1.5 },
    'detail-crate': { category: 'decoration', subcategory: 'props', rarity: 'common', height: 1, width: 1, depth: 1 },
    'detail-barrel': { category: 'decoration', subcategory: 'props', rarity: 'common', height: 1.2, width: 0.8, depth: 0.8 },
    overhang: { category: 'decoration', subcategory: 'architectural', rarity: 'uncommon', height: 0.5, width: 3, depth: 2 },
    pulley: { category: 'decoration', subcategory: 'utility', rarity: 'uncommon', height: 2, width: 1, depth: 1 },
    tree: { category: 'decoration', subcategory: 'nature', rarity: 'uncommon', height: 6, width: 3, depth: 3 },
    water: { category: 'decoration', subcategory: 'nature', rarity: 'rare', height: 0.2, width: 4, depth: 4 },

    // Structures
    structure: { category: 'decoration', subcategory: 'structural', rarity: 'common', height: 3, width: 1, depth: 1 },
    dock: { category: 'decoration', subcategory: 'infrastructure', rarity: 'uncommon', height: 0.3, width: 2, depth: 4 },
    bricks: { category: 'decoration', subcategory: 'materials', rarity: 'common', height: 0.5, width: 2, depth: 2 }
};

function generateComponentId(filename: string): string {
    return filename.replace('.glb', '').replace(/\\/g, '').replace(/\//g, '').replace('models/components/', '');
}

function generateHumanName(filename: string): string {
    return filename
        .replace('.glb', '')
        .replace(/.*[\\\/]/, '') // Remove path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function categorizeComponent(filename: string): ComponentDefinition {
    const id = generateComponentId(filename);
    const name = generateHumanName(filename);
    const cleanPath = filename.replace(/\\/g, '/').replace('models\\components\\', '/models/components/');

    // Find matching rule
    let matchedRule = null;
    let bestMatch = '';

    for (const [pattern, rule] of Object.entries(COMPONENT_RULES)) {
        if (id.includes(pattern) && pattern.length > bestMatch.length) {
            matchedRule = rule;
            bestMatch = pattern;
        }
    }

    // Default values
    let category = 'decoration';
    let subcategory = 'misc';
    let rarity: 'common' | 'uncommon' | 'rare' | 'epic' = 'common';
    let boundingBox = { width: 1, height: 2, depth: 1 };

    if (matchedRule) {
        category = matchedRule.category;
        subcategory = matchedRule.subcategory;

        // @ts-ignore
        rarity = matchedRule.rarity;

        boundingBox = {
            // @ts-ignore
            width: matchedRule.width || 2,
            height: matchedRule.height || 2,
            // @ts-ignore
            depth: matchedRule.depth || (category === 'wall' ? 0.3 : 1)
        };
    }

    // Generate tags
    const tags = [subcategory, category];
    if (id.includes('wood')) tags.push('wood', 'rustic');
    if (id.includes('paint')) tags.push('painted', 'decorative');
    if (id.includes('fortified')) tags.push('fortified', 'defensive');
    if (id.includes('stone')) tags.push('stone');
    if (id.includes('half')) tags.push('half', 'partial');
    if (id.includes('corner')) tags.push('corner');
    if (id.includes('damaged')) tags.push('damaged', 'weathered');
    if (id.includes('door')) tags.push('door', 'entrance');
    if (id.includes('window')) tags.push('window', 'light');
    if (id.includes('gate')) tags.push('gate', 'entrance', 'large');

    // Generate connections
    const connectsTo = [];
    if (category === 'foundation') connectsTo.push('wall', 'column', 'stairs');
    if (category === 'wall') connectsTo.push('foundation', 'wall', 'roof', 'column');
    if (category === 'roof') connectsTo.push('wall', 'column');
    if (category === 'column') connectsTo.push('foundation', 'roof', 'overhang');
    if (category === 'tower') connectsTo.push('tower', 'wall');
    if (category === 'stairs') connectsTo.push('foundation', 'floor');
    if (category === 'fence') connectsTo.push('fence', 'foundation');

    // Generate building types
    const buildingTypes = [];
    if (tags.includes('fortified') || category === 'tower') {
        buildingTypes.push('castle', 'fortress');
    }
    if (tags.includes('wood') || tags.includes('rustic')) {
        buildingTypes.push('house', 'tavern', 'farm');
    }
    if (tags.includes('painted') || tags.includes('decorative')) {
        buildingTypes.push('mansion', 'shop', 'temple');
    }
    if (category === 'decoration' && subcategory === 'props') {
        buildingTypes.push('tavern', 'warehouse', 'shop');
    }
    if (!buildingTypes.length) {
        buildingTypes.push('house', 'castle', 'shop'); // Default
    }

    return {
        id,
        name,
        category,
        subcategory,
        modelPath: cleanPath,
        boundingBox,
        tags,
        connectsTo,
        buildingTypes,
        rarity
    };
}

function generateLibraryCode(components: ComponentDefinition[]): string {
    // Group components by category and subcategory
    const grouped = components.reduce((acc, comp) => {
        if (!acc[comp.category]) acc[comp.category] = {};
        if (!acc[comp.category][comp.subcategory]) acc[comp.category][comp.subcategory] = [];
        acc[comp.category][comp.subcategory].push(comp);
        return acc;
    }, {} as Record<string, Record<string, ComponentDefinition[]>>);

    return `// Auto-generated medieval component library
// Generated on ${new Date().toISOString()}
// Total components: ${components.length}

export interface MedievalComponent {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  modelPath: string;
  boundingBox: { width: number; height: number; depth: number };
  tags: string[];
  connectsTo: string[];
  buildingTypes: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

export const GENERATED_MEDIEVAL_COMPONENTS: MedievalComponent[] = [
${components.map(comp => `  {
    id: '${comp.id}',
    name: '${comp.name}',
    category: '${comp.category}',
    subcategory: '${comp.subcategory}',
    modelPath: '${comp.modelPath}',
    boundingBox: { width: ${comp.boundingBox.width}, height: ${comp.boundingBox.height}, depth: ${comp.boundingBox.depth} },
    tags: [${comp.tags.map(t => `'${t}'`).join(', ')}],
    connectsTo: [${comp.connectsTo.map(t => `'${t}'`).join(', ')}],
    buildingTypes: [${comp.buildingTypes.map(t => `'${t}'`).join(', ')}],
    rarity: '${comp.rarity}'
  }`).join(',\n')}
];

// Component categories
${Object.keys(grouped).map(category =>
        `export const ${category.toUpperCase()}_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.category === '${category}');`
    ).join('\n')}

// Component access by rarity
export const COMMON_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.rarity === 'common');
export const UNCOMMON_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.rarity === 'uncommon');
export const RARE_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.rarity === 'rare');
export const EPIC_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.rarity === 'epic');

// Quick lookup functions
export function findComponentById(id: string): MedievalComponent | null {
  return GENERATED_MEDIEVAL_COMPONENTS.find(c => c.id === id) || null;
}

export function findComponentsByTag(tag: string): MedievalComponent[] {
  return GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.tags.includes(tag));
}

export function findComponentsByBuildingType(buildingType: string): MedievalComponent[] {
  return GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.buildingTypes.includes(buildingType));
}

// Statistics
export const COMPONENT_STATS = {
  total: ${components.length},
  byCategory: {
${Object.entries(grouped).map(([cat, subs]) =>
        `    ${cat}: ${Object.values(subs).flat().length}`
    ).join(',\n')}
  },
  byRarity: {
    common: ${components.filter(c => c.rarity === 'common').length},
    uncommon: ${components.filter(c => c.rarity === 'uncommon').length},
    rare: ${components.filter(c => c.rarity === 'rare').length},
    epic: ${components.filter(c => c.rarity === 'epic').length}
  }
};

console.log('🏰 Medieval Component Library loaded:', COMPONENT_STATS);`;
}

// Main execution
function main() {
    console.log('🔍 Processing your medieval components...');
    console.log(`📦 Found ${YOUR_GLB_FILES.length} component files`);

    const components = YOUR_GLB_FILES.map(categorizeComponent);

    // Generate statistics
    const categoryStats = components.reduce((acc, comp) => {
        acc[comp.category] = (acc[comp.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const rarityStats = components.reduce((acc, comp) => {
        acc[comp.rarity] = (acc[comp.rarity] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log('📊 Components by category:');
    Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
    });

    console.log('💎 Components by rarity:');
    Object.entries(rarityStats).forEach(([rarity, count]) => {
        console.log(`  ${rarity}: ${count}`);
    });

    // Generate the library file
    const libraryCode = generateLibraryCode(components);

    // Write to file
    const outputPath = path.join(process.cwd(), 'src/realm/config/generatedMedievalComponents.ts');
    fs.writeFileSync(outputPath, libraryCode);

    console.log(`✅ Generated medieval component library: ${outputPath}`);
    console.log('🚀 Ready to use in your building system!');

    // Show some example components
    console.log('\\n🏗️ Sample components:');
    const samples = [
        components.find(c => c.category === 'wall'),
        components.find(c => c.category === 'tower'),
        components.find(c => c.category === 'decoration')
    ].filter(Boolean);

    samples.forEach(comp => {
        if (comp) {
            console.log(`  - ${comp.name} (${comp.category}/${comp.subcategory}) - ${comp.rarity}`);
        }
    });
}

if (require.main === module) {
    main();
}

export { main as catalogMedievalComponents };
