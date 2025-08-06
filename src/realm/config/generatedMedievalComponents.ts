// Auto-generated medieval component library
// Generated on 2025-08-06T18:29:21.670Z
// Total components: 105

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
  {
    id: 'modelscomponentsbarrels',
    name: 'Barrels',
    category: 'decoration',
    subcategory: 'props',
    modelPath: 'models/components/barrels.glb',
    boundingBox: { width: 1.5, height: 1, depth: 1.5 },
    tags: ['props', 'decoration'],
    connectsTo: [],
    buildingTypes: ['tavern', 'warehouse', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsbattlement-corner-inner',
    name: 'Battlement Corner Inner',
    category: 'wall',
    subcategory: 'defensive',
    modelPath: 'models/components/battlement-corner-inner.glb',
    boundingBox: { width: 2, height: 1, depth: 0.5 },
    tags: ['defensive', 'wall', 'corner'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentsbattlement-corner-outer',
    name: 'Battlement Corner Outer',
    category: 'wall',
    subcategory: 'defensive',
    modelPath: 'models/components/battlement-corner-outer.glb',
    boundingBox: { width: 2, height: 1, depth: 0.5 },
    tags: ['defensive', 'wall', 'corner'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentsbattlement-half',
    name: 'Battlement Half',
    category: 'wall',
    subcategory: 'defensive',
    modelPath: 'models/components/battlement-half.glb',
    boundingBox: { width: 2, height: 1, depth: 0.5 },
    tags: ['defensive', 'wall', 'half', 'partial'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentsbattlement',
    name: 'Battlement',
    category: 'wall',
    subcategory: 'defensive',
    modelPath: 'models/components/battlement.glb',
    boundingBox: { width: 2, height: 1, depth: 0.5 },
    tags: ['defensive', 'wall'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentsbricks',
    name: 'Bricks',
    category: 'decoration',
    subcategory: 'materials',
    modelPath: 'models/components/bricks.glb',
    boundingBox: { width: 2, height: 0.5, depth: 2 },
    tags: ['materials', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentscolumn-damaged',
    name: 'Column Damaged',
    category: 'column',
    subcategory: 'basic',
    modelPath: 'models/components/column-damaged.glb',
    boundingBox: { width: 0.6, height: 4, depth: 0.6 },
    tags: ['basic', 'column', 'damaged', 'weathered'],
    connectsTo: ['foundation', 'roof', 'overhang'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentscolumn-paint-damaged',
    name: 'Column Paint Damaged',
    category: 'column',
    subcategory: 'decorative',
    modelPath: 'models/components/column-paint-damaged.glb',
    boundingBox: { width: 0.6, height: 4, depth: 0.6 },
    tags: ['decorative', 'column', 'painted', 'decorative', 'damaged', 'weathered'],
    connectsTo: ['foundation', 'roof', 'overhang'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentscolumn-paint',
    name: 'Column Paint',
    category: 'column',
    subcategory: 'decorative',
    modelPath: 'models/components/column-paint.glb',
    boundingBox: { width: 0.6, height: 4, depth: 0.6 },
    tags: ['decorative', 'column', 'painted', 'decorative'],
    connectsTo: ['foundation', 'roof', 'overhang'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentscolumn-wood',
    name: 'Column Wood',
    category: 'column',
    subcategory: 'basic',
    modelPath: 'models/components/column-wood.glb',
    boundingBox: { width: 0.5, height: 4, depth: 0.5 },
    tags: ['basic', 'column', 'wood', 'rustic'],
    connectsTo: ['foundation', 'roof', 'overhang'],
    buildingTypes: ['house', 'tavern', 'farm'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentscolumn',
    name: 'Column',
    category: 'column',
    subcategory: 'basic',
    modelPath: 'models/components/column.glb',
    boundingBox: { width: 0.6, height: 4, depth: 0.6 },
    tags: ['basic', 'column'],
    connectsTo: ['foundation', 'roof', 'overhang'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsdetail-barrel',
    name: 'Detail Barrel',
    category: 'decoration',
    subcategory: 'props',
    modelPath: 'models/components/detail-barrel.glb',
    boundingBox: { width: 0.8, height: 1.2, depth: 0.8 },
    tags: ['props', 'decoration'],
    connectsTo: [],
    buildingTypes: ['tavern', 'warehouse', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsdetail-crate-ropes',
    name: 'Detail Crate Ropes',
    category: 'decoration',
    subcategory: 'props',
    modelPath: 'models/components/detail-crate-ropes.glb',
    boundingBox: { width: 1, height: 1, depth: 1 },
    tags: ['props', 'decoration'],
    connectsTo: [],
    buildingTypes: ['tavern', 'warehouse', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsdetail-crate-small',
    name: 'Detail Crate Small',
    category: 'decoration',
    subcategory: 'props',
    modelPath: 'models/components/detail-crate-small.glb',
    boundingBox: { width: 1, height: 1, depth: 1 },
    tags: ['props', 'decoration'],
    connectsTo: [],
    buildingTypes: ['tavern', 'warehouse', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsdetail-crate',
    name: 'Detail Crate',
    category: 'decoration',
    subcategory: 'props',
    modelPath: 'models/components/detail-crate.glb',
    boundingBox: { width: 1, height: 1, depth: 1 },
    tags: ['props', 'decoration'],
    connectsTo: [],
    buildingTypes: ['tavern', 'warehouse', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsdock-corner',
    name: 'Dock Corner',
    category: 'decoration',
    subcategory: 'infrastructure',
    modelPath: 'models/components/dock-corner.glb',
    boundingBox: { width: 2, height: 0.3, depth: 4 },
    tags: ['infrastructure', 'decoration', 'corner'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentsdock-side',
    name: 'Dock Side',
    category: 'decoration',
    subcategory: 'infrastructure',
    modelPath: 'models/components/dock-side.glb',
    boundingBox: { width: 2, height: 0.3, depth: 4 },
    tags: ['infrastructure', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentsfence-top',
    name: 'Fence Top',
    category: 'fence',
    subcategory: 'basic',
    modelPath: 'models/components/fence-top.glb',
    boundingBox: { width: 2, height: 1.5, depth: 0.2 },
    tags: ['basic', 'fence'],
    connectsTo: ['fence', 'foundation'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsfence-wood',
    name: 'Fence Wood',
    category: 'fence',
    subcategory: 'basic',
    modelPath: 'models/components/fence-wood.glb',
    boundingBox: { width: 2, height: 1.5, depth: 0.2 },
    tags: ['basic', 'fence', 'wood', 'rustic'],
    connectsTo: ['fence', 'foundation'],
    buildingTypes: ['house', 'tavern', 'farm'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsfence',
    name: 'Fence',
    category: 'fence',
    subcategory: 'basic',
    modelPath: 'models/components/fence.glb',
    boundingBox: { width: 2, height: 1.5, depth: 0.2 },
    tags: ['basic', 'fence'],
    connectsTo: ['fence', 'foundation'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsfloor-flat',
    name: 'Floor Flat',
    category: 'foundation',
    subcategory: 'floors',
    modelPath: 'models/components/floor-flat.glb',
    boundingBox: { width: 2, height: 0.2, depth: 1 },
    tags: ['floors', 'foundation'],
    connectsTo: ['wall', 'column', 'stairs'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsfloor-stairs-corner-inner',
    name: 'Floor Stairs Corner Inner',
    category: 'stairs',
    subcategory: 'basic',
    modelPath: 'models/components/floor-stairs-corner-inner.glb',
    boundingBox: { width: 2, height: 1.5, depth: 3 },
    tags: ['basic', 'stairs', 'corner'],
    connectsTo: ['foundation', 'floor'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsfloor-stairs-corner-outer',
    name: 'Floor Stairs Corner Outer',
    category: 'stairs',
    subcategory: 'basic',
    modelPath: 'models/components/floor-stairs-corner-outer.glb',
    boundingBox: { width: 2, height: 1.5, depth: 3 },
    tags: ['basic', 'stairs', 'corner'],
    connectsTo: ['foundation', 'floor'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsfloor-stairs',
    name: 'Floor Stairs',
    category: 'stairs',
    subcategory: 'basic',
    modelPath: 'models/components/floor-stairs.glb',
    boundingBox: { width: 2, height: 1.5, depth: 3 },
    tags: ['basic', 'stairs'],
    connectsTo: ['foundation', 'floor'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsfloor-steps-corner-inner',
    name: 'Floor Steps Corner Inner',
    category: 'foundation',
    subcategory: 'floors',
    modelPath: 'models/components/floor-steps-corner-inner.glb',
    boundingBox: { width: 2, height: 0.2, depth: 1 },
    tags: ['floors', 'foundation', 'corner'],
    connectsTo: ['wall', 'column', 'stairs'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsfloor-steps-corner-outer',
    name: 'Floor Steps Corner Outer',
    category: 'foundation',
    subcategory: 'floors',
    modelPath: 'models/components/floor-steps-corner-outer.glb',
    boundingBox: { width: 2, height: 0.2, depth: 1 },
    tags: ['floors', 'foundation', 'corner'],
    connectsTo: ['wall', 'column', 'stairs'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsfloor-steps',
    name: 'Floor Steps',
    category: 'foundation',
    subcategory: 'floors',
    modelPath: 'models/components/floor-steps.glb',
    boundingBox: { width: 2, height: 0.2, depth: 1 },
    tags: ['floors', 'foundation'],
    connectsTo: ['wall', 'column', 'stairs'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsfloor',
    name: 'Floor',
    category: 'foundation',
    subcategory: 'floors',
    modelPath: 'models/components/floor.glb',
    boundingBox: { width: 2, height: 0.2, depth: 1 },
    tags: ['floors', 'foundation'],
    connectsTo: ['wall', 'column', 'stairs'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsladder',
    name: 'Ladder',
    category: 'stairs',
    subcategory: 'utility',
    modelPath: 'models/components/ladder.glb',
    boundingBox: { width: 0.5, height: 3, depth: 0.3 },
    tags: ['utility', 'stairs'],
    connectsTo: ['foundation', 'floor'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsoverhang-fence',
    name: 'Overhang Fence',
    category: 'decoration',
    subcategory: 'architectural',
    modelPath: 'models/components/overhang-fence.glb',
    boundingBox: { width: 3, height: 0.5, depth: 2 },
    tags: ['architectural', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentsoverhang-round-railing',
    name: 'Overhang Round Railing',
    category: 'decoration',
    subcategory: 'architectural',
    modelPath: 'models/components/overhang-round-railing.glb',
    boundingBox: { width: 3, height: 0.5, depth: 2 },
    tags: ['architectural', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentsoverhang-round',
    name: 'Overhang Round',
    category: 'decoration',
    subcategory: 'architectural',
    modelPath: 'models/components/overhang-round.glb',
    boundingBox: { width: 3, height: 0.5, depth: 2 },
    tags: ['architectural', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentsoverhang',
    name: 'Overhang',
    category: 'decoration',
    subcategory: 'architectural',
    modelPath: 'models/components/overhang.glb',
    boundingBox: { width: 3, height: 0.5, depth: 2 },
    tags: ['architectural', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentspulley-crate',
    name: 'Pulley Crate',
    category: 'decoration',
    subcategory: 'utility',
    modelPath: 'models/components/pulley-crate.glb',
    boundingBox: { width: 1, height: 2, depth: 1 },
    tags: ['utility', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentspulley',
    name: 'Pulley',
    category: 'decoration',
    subcategory: 'utility',
    modelPath: 'models/components/pulley.glb',
    boundingBox: { width: 1, height: 2, depth: 1 },
    tags: ['utility', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentsroof-corner',
    name: 'Roof Corner',
    category: 'roof',
    subcategory: 'corner',
    modelPath: 'models/components/roof-corner.glb',
    boundingBox: { width: 1.5, height: 1.5, depth: 1.5 },
    tags: ['corner', 'roof', 'corner'],
    connectsTo: ['wall', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsroof-edge',
    name: 'Roof Edge',
    category: 'roof',
    subcategory: 'edge',
    modelPath: 'models/components/roof-edge.glb',
    boundingBox: { width: 2, height: 1.2, depth: 0.5 },
    tags: ['edge', 'roof'],
    connectsTo: ['wall', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsroof-high-side-corner-inner',
    name: 'Roof High Side Corner Inner',
    category: 'roof',
    subcategory: 'high',
    modelPath: 'models/components/roof-high-side-corner-inner.glb',
    boundingBox: { width: 2, height: 2, depth: 1 },
    tags: ['high', 'roof', 'corner'],
    connectsTo: ['wall', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentsroof-high-side-corner',
    name: 'Roof High Side Corner',
    category: 'roof',
    subcategory: 'high',
    modelPath: 'models/components/roof-high-side-corner.glb',
    boundingBox: { width: 2, height: 2, depth: 1 },
    tags: ['high', 'roof', 'corner'],
    connectsTo: ['wall', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentsroof-high-side',
    name: 'Roof High Side',
    category: 'roof',
    subcategory: 'high',
    modelPath: 'models/components/roof-high-side.glb',
    boundingBox: { width: 2, height: 2, depth: 1 },
    tags: ['high', 'roof'],
    connectsTo: ['wall', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentsroof-side-corner-inner',
    name: 'Roof Side Corner Inner',
    category: 'roof',
    subcategory: 'side',
    modelPath: 'models/components/roof-side-corner-inner.glb',
    boundingBox: { width: 2, height: 1.5, depth: 1 },
    tags: ['side', 'roof', 'corner'],
    connectsTo: ['wall', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsroof-side-corner',
    name: 'Roof Side Corner',
    category: 'roof',
    subcategory: 'side',
    modelPath: 'models/components/roof-side-corner.glb',
    boundingBox: { width: 2, height: 1.5, depth: 1 },
    tags: ['side', 'roof', 'corner'],
    connectsTo: ['wall', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsroof-side',
    name: 'Roof Side',
    category: 'roof',
    subcategory: 'side',
    modelPath: 'models/components/roof-side.glb',
    boundingBox: { width: 2, height: 1.5, depth: 1 },
    tags: ['side', 'roof'],
    connectsTo: ['wall', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsroof',
    name: 'Roof',
    category: 'roof',
    subcategory: 'basic',
    modelPath: 'models/components/roof.glb',
    boundingBox: { width: 2, height: 1.5, depth: 2 },
    tags: ['basic', 'roof'],
    connectsTo: ['wall', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsstairs-corner',
    name: 'Stairs Corner',
    category: 'stairs',
    subcategory: 'basic',
    modelPath: 'models/components/stairs-corner.glb',
    boundingBox: { width: 2, height: 1.5, depth: 3 },
    tags: ['basic', 'stairs', 'corner'],
    connectsTo: ['foundation', 'floor'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsstairs-stone',
    name: 'Stairs Stone',
    category: 'stairs',
    subcategory: 'basic',
    modelPath: 'models/components/stairs-stone.glb',
    boundingBox: { width: 2, height: 1.5, depth: 3 },
    tags: ['basic', 'stairs', 'stone'],
    connectsTo: ['foundation', 'floor'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsstairs-wood',
    name: 'Stairs Wood',
    category: 'stairs',
    subcategory: 'basic',
    modelPath: 'models/components/stairs-wood.glb',
    boundingBox: { width: 2, height: 1.5, depth: 3 },
    tags: ['basic', 'stairs', 'wood', 'rustic'],
    connectsTo: ['foundation', 'floor'],
    buildingTypes: ['house', 'tavern', 'farm'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsstructure-cross',
    name: 'Structure Cross',
    category: 'decoration',
    subcategory: 'structural',
    modelPath: 'models/components/structure-cross.glb',
    boundingBox: { width: 1, height: 3, depth: 1 },
    tags: ['structural', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsstructure-pole',
    name: 'Structure Pole',
    category: 'decoration',
    subcategory: 'structural',
    modelPath: 'models/components/structure-pole.glb',
    boundingBox: { width: 1, height: 3, depth: 1 },
    tags: ['structural', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsstructure-poles',
    name: 'Structure Poles',
    category: 'decoration',
    subcategory: 'structural',
    modelPath: 'models/components/structure-poles.glb',
    boundingBox: { width: 1, height: 3, depth: 1 },
    tags: ['structural', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsstructure-wall-cross',
    name: 'Structure Wall Cross',
    category: 'decoration',
    subcategory: 'structural',
    modelPath: 'models/components/structure-wall-cross.glb',
    boundingBox: { width: 1, height: 3, depth: 1 },
    tags: ['structural', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsstructure-wall',
    name: 'Structure Wall',
    category: 'decoration',
    subcategory: 'structural',
    modelPath: 'models/components/structure-wall.glb',
    boundingBox: { width: 1, height: 3, depth: 1 },
    tags: ['structural', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentsstructure',
    name: 'Structure',
    category: 'decoration',
    subcategory: 'structural',
    modelPath: 'models/components/structure.glb',
    boundingBox: { width: 1, height: 3, depth: 1 },
    tags: ['structural', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentstower-base',
    name: 'Tower Base',
    category: 'tower',
    subcategory: 'base',
    modelPath: 'models/components/tower-base.glb',
    boundingBox: { width: 3, height: 4, depth: 3 },
    tags: ['base', 'tower'],
    connectsTo: ['tower', 'wall'],
    buildingTypes: ['castle', 'fortress'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentstower-edge',
    name: 'Tower Edge',
    category: 'tower',
    subcategory: 'middle',
    modelPath: 'models/components/tower-edge.glb',
    boundingBox: { width: 3, height: 4, depth: 3 },
    tags: ['middle', 'tower'],
    connectsTo: ['tower', 'wall'],
    buildingTypes: ['castle', 'fortress'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentstower-paint-base',
    name: 'Tower Paint Base',
    category: 'tower',
    subcategory: 'middle',
    modelPath: 'models/components/tower-paint-base.glb',
    boundingBox: { width: 3, height: 4, depth: 3 },
    tags: ['middle', 'tower', 'painted', 'decorative'],
    connectsTo: ['tower', 'wall'],
    buildingTypes: ['castle', 'fortress', 'mansion', 'shop', 'temple'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentstower-paint',
    name: 'Tower Paint',
    category: 'tower',
    subcategory: 'middle',
    modelPath: 'models/components/tower-paint.glb',
    boundingBox: { width: 3, height: 4, depth: 3 },
    tags: ['middle', 'tower', 'painted', 'decorative'],
    connectsTo: ['tower', 'wall'],
    buildingTypes: ['castle', 'fortress', 'mansion', 'shop', 'temple'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentstower-top',
    name: 'Tower Top',
    category: 'tower',
    subcategory: 'top',
    modelPath: 'models/components/tower-top.glb',
    boundingBox: { width: 3, height: 2, depth: 3 },
    tags: ['top', 'tower'],
    connectsTo: ['tower', 'wall'],
    buildingTypes: ['castle', 'fortress'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentstower',
    name: 'Tower',
    category: 'tower',
    subcategory: 'middle',
    modelPath: 'models/components/tower.glb',
    boundingBox: { width: 3, height: 4, depth: 3 },
    tags: ['middle', 'tower'],
    connectsTo: ['tower', 'wall'],
    buildingTypes: ['castle', 'fortress'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentstree-large',
    name: 'Tree Large',
    category: 'decoration',
    subcategory: 'nature',
    modelPath: 'models/components/tree-large.glb',
    boundingBox: { width: 3, height: 6, depth: 3 },
    tags: ['nature', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentstree-shrub',
    name: 'Tree Shrub',
    category: 'decoration',
    subcategory: 'nature',
    modelPath: 'models/components/tree-shrub.glb',
    boundingBox: { width: 3, height: 6, depth: 3 },
    tags: ['nature', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-detail',
    name: 'Wall Detail',
    category: 'wall',
    subcategory: 'basic',
    modelPath: 'models/components/wall-detail.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['basic', 'wall'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentswall-door',
    name: 'Wall Door',
    category: 'wall',
    subcategory: 'openings',
    modelPath: 'models/components/wall-door.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['openings', 'wall', 'door', 'entrance'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentswall-flat-gate',
    name: 'Wall Flat Gate',
    category: 'wall',
    subcategory: 'basic',
    modelPath: 'models/components/wall-flat-gate.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['basic', 'wall', 'gate', 'entrance', 'large'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentswall-fortified-door',
    name: 'Wall Fortified Door',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified-door.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'fortified', 'defensive', 'door', 'entrance'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-fortified-gate-half',
    name: 'Wall Fortified Gate Half',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified-gate-half.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'fortified', 'defensive', 'half', 'partial', 'gate', 'entrance', 'large'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-fortified-gate',
    name: 'Wall Fortified Gate',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified-gate.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'fortified', 'defensive', 'gate', 'entrance', 'large'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-fortified-half',
    name: 'Wall Fortified Half',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified-half.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'fortified', 'defensive', 'half', 'partial'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-fortified-paint-door',
    name: 'Wall Fortified Paint Door',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified-paint-door.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'painted', 'decorative', 'fortified', 'defensive', 'door', 'entrance'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-fortified-paint-gate',
    name: 'Wall Fortified Paint Gate',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified-paint-gate.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'painted', 'decorative', 'fortified', 'defensive', 'gate', 'entrance', 'large'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-fortified-paint-half',
    name: 'Wall Fortified Paint Half',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified-paint-half.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'painted', 'decorative', 'fortified', 'defensive', 'half', 'partial'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-fortified-paint-window',
    name: 'Wall Fortified Paint Window',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified-paint-window.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'painted', 'decorative', 'fortified', 'defensive', 'window', 'light'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-fortified-paint',
    name: 'Wall Fortified Paint',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified-paint.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'painted', 'decorative', 'fortified', 'defensive'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-fortified-window',
    name: 'Wall Fortified Window',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified-window.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'fortified', 'defensive', 'window', 'light'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-fortified',
    name: 'Wall Fortified',
    category: 'wall',
    subcategory: 'fortified',
    modelPath: 'models/components/wall-fortified.glb',
    boundingBox: { width: 2, height: 4, depth: 0.4 },
    tags: ['fortified', 'wall', 'fortified', 'defensive'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['castle', 'fortress'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-gate-half',
    name: 'Wall Gate Half',
    category: 'wall',
    subcategory: 'openings',
    modelPath: 'models/components/wall-gate-half.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['openings', 'wall', 'half', 'partial', 'gate', 'entrance', 'large'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-gate',
    name: 'Wall Gate',
    category: 'wall',
    subcategory: 'openings',
    modelPath: 'models/components/wall-gate.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['openings', 'wall', 'gate', 'entrance', 'large'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-half',
    name: 'Wall Half',
    category: 'wall',
    subcategory: 'basic',
    modelPath: 'models/components/wall-half.glb',
    boundingBox: { width: 1, height: 3, depth: 0.3 },
    tags: ['basic', 'wall', 'half', 'partial'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentswall-low',
    name: 'Wall Low',
    category: 'wall',
    subcategory: 'basic',
    modelPath: 'models/components/wall-low.glb',
    boundingBox: { width: 2, height: 1.5, depth: 0.3 },
    tags: ['basic', 'wall'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentswall-paint-detail',
    name: 'Wall Paint Detail',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-paint-detail.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'painted', 'decorative'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-paint-door',
    name: 'Wall Paint Door',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-paint-door.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'painted', 'decorative', 'door', 'entrance'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-paint-flat',
    name: 'Wall Paint Flat',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-paint-flat.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'painted', 'decorative'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-paint-gate',
    name: 'Wall Paint Gate',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-paint-gate.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'painted', 'decorative', 'gate', 'entrance', 'large'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-paint-half',
    name: 'Wall Paint Half',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-paint-half.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'painted', 'decorative', 'half', 'partial'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-paint-window',
    name: 'Wall Paint Window',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-paint-window.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'painted', 'decorative', 'window', 'light'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-paint',
    name: 'Wall Paint',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-paint.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'painted', 'decorative'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-door',
    name: 'Wall Pane Door',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-door.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'door', 'entrance'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-paint-door',
    name: 'Wall Pane Paint Door',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-paint-door.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'painted', 'decorative', 'door', 'entrance'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-paint-window',
    name: 'Wall Pane Paint Window',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-paint-window.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'painted', 'decorative', 'window', 'light'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-paint',
    name: 'Wall Pane Paint',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-paint.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'painted', 'decorative'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-painted-wood-door',
    name: 'Wall Pane Painted Wood Door',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-painted-wood-door.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'wood', 'rustic', 'painted', 'decorative', 'door', 'entrance'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'tavern', 'farm', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-painted-wood-window',
    name: 'Wall Pane Painted Wood Window',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-painted-wood-window.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'wood', 'rustic', 'painted', 'decorative', 'window', 'light'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'tavern', 'farm', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-painted-wood',
    name: 'Wall Pane Painted Wood',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-painted-wood.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'wood', 'rustic', 'painted', 'decorative'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'tavern', 'farm', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-window',
    name: 'Wall Pane Window',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-window.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'window', 'light'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-wood-door',
    name: 'Wall Pane Wood Door',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-wood-door.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'wood', 'rustic', 'door', 'entrance'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'tavern', 'farm', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-wood-window',
    name: 'Wall Pane Wood Window',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-wood-window.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'wood', 'rustic', 'window', 'light'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'tavern', 'farm', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane-wood',
    name: 'Wall Pane Wood',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane-wood.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall', 'wood', 'rustic'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'tavern', 'farm', 'mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-pane',
    name: 'Wall Pane',
    category: 'wall',
    subcategory: 'decorative',
    modelPath: 'models/components/wall-pane.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['decorative', 'wall'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['mansion', 'shop', 'temple'],
    rarity: 'uncommon'
  },
  {
    id: 'modelscomponentswall-window',
    name: 'Wall Window',
    category: 'wall',
    subcategory: 'openings',
    modelPath: 'models/components/wall-window.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['openings', 'wall', 'window', 'light'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentswall',
    name: 'Wall',
    category: 'wall',
    subcategory: 'basic',
    modelPath: 'models/components/wall.glb',
    boundingBox: { width: 2, height: 3, depth: 0.3 },
    tags: ['basic', 'wall'],
    connectsTo: ['foundation', 'wall', 'roof', 'column'],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentswater',
    name: 'Water',
    category: 'decoration',
    subcategory: 'nature',
    modelPath: 'models/components/water.glb',
    boundingBox: { width: 4, height: 0.2, depth: 4 },
    tags: ['nature', 'decoration'],
    connectsTo: [],
    buildingTypes: ['house', 'castle', 'shop'],
    rarity: 'rare'
  },
  {
    id: 'modelscomponentswood-floor-half',
    name: 'Wood Floor Half',
    category: 'foundation',
    subcategory: 'floors',
    modelPath: 'models/components/wood-floor-half.glb',
    boundingBox: { width: 2, height: 0.15, depth: 1 },
    tags: ['floors', 'foundation', 'wood', 'rustic', 'half', 'partial'],
    connectsTo: ['wall', 'column', 'stairs'],
    buildingTypes: ['house', 'tavern', 'farm'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentswood-floor-quarter',
    name: 'Wood Floor Quarter',
    category: 'foundation',
    subcategory: 'floors',
    modelPath: 'models/components/wood-floor-quarter.glb',
    boundingBox: { width: 2, height: 0.15, depth: 1 },
    tags: ['floors', 'foundation', 'wood', 'rustic'],
    connectsTo: ['wall', 'column', 'stairs'],
    buildingTypes: ['house', 'tavern', 'farm'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentswood-floor-railing',
    name: 'Wood Floor Railing',
    category: 'foundation',
    subcategory: 'floors',
    modelPath: 'models/components/wood-floor-railing.glb',
    boundingBox: { width: 2, height: 0.15, depth: 1 },
    tags: ['floors', 'foundation', 'wood', 'rustic'],
    connectsTo: ['wall', 'column', 'stairs'],
    buildingTypes: ['house', 'tavern', 'farm'],
    rarity: 'common'
  },
  {
    id: 'modelscomponentswood-floor',
    name: 'Wood Floor',
    category: 'foundation',
    subcategory: 'floors',
    modelPath: 'models/components/wood-floor.glb',
    boundingBox: { width: 2, height: 0.15, depth: 1 },
    tags: ['floors', 'foundation', 'wood', 'rustic'],
    connectsTo: ['wall', 'column', 'stairs'],
    buildingTypes: ['house', 'tavern', 'farm'],
    rarity: 'common'
  }
];

// Component categories
export const DECORATION_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.category === 'decoration');
export const WALL_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.category === 'wall');
export const COLUMN_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.category === 'column');
export const FENCE_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.category === 'fence');
export const FOUNDATION_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.category === 'foundation');
export const STAIRS_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.category === 'stairs');
export const ROOF_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.category === 'roof');
export const TOWER_COMPONENTS = GENERATED_MEDIEVAL_COMPONENTS.filter(c => c.category === 'tower');

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
  total: 105,
  byCategory: {
    decoration: 23,
    wall: 43,
    column: 5,
    fence: 3,
    foundation: 9,
    stairs: 7,
    roof: 9,
    tower: 6
  },
  byRarity: {
    common: 47,
    uncommon: 47,
    rare: 11,
    epic: 0
  }
};

console.log('🏰 Medieval Component Library loaded:', COMPONENT_STATS);