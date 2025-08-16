import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, Map, Edit3, Save, Home, Sword } from 'lucide-react';

// Import terrain textures
import grassImg from '../../assets/images/world/grass.png';
import grassRocksImg from '../../assets/images/world/rocks.png';
import forestImg from '../../assets/images/world/forest.png';
import denseForestImg from '../../assets/images/world/dense-forest.png';
import rocksImg from '../../assets/images/world/rocks.png';
import mountainsImg from '../../assets/images/world/mountains.png';
import snowyMountainsImg from '../../assets/images/world/snowy-mountains.png';
import waterImg from '../../assets/images/world/water.png';
import outpostImg from '../../assets/images/world/outpost.png';
import pondImg from '../../assets/images/world/pond.png';

const TEXTURE_SCALE = 1.08;

// Types
interface Tile {
  q: number;
  r: number;
  terrain: string;
  owner?: { id: string; name: string; color: string };
  resources?: string[];
  buildings?: string[];
  id?: string;
}
interface TerrainType {
  name: string;
  color: string;
  image?: string;
  icon: string;
}
interface HexTileProps {
  tile: Tile;
  size: number;
  isSelected: boolean;
  onClick: (tile: Tile) => void;
  isEditMode: boolean;
  showCoords: boolean;
}
interface WorldMapProps {
  mapData?: Tile[];
  mapSize?: number;
  isAdmin?: boolean;
  userId?: string;
  onBack: () => void;
  onTileUpdate?: (q: number, r: number, terrain: string) => Promise<boolean>;
  onMapSave?: () => Promise<boolean>;
  onMapGenerate?: (size: number) => Promise<boolean>;
  selectedTile?: Tile | null;
  onTileSelect?: (tile: Tile | null) => void;
  findPlayerTile?: () => Tile | undefined;
}

// Terrain definitions
const TERRAIN_TYPES: Record<string, TerrainType> = {
  grass: { name: 'Grass', color: '#4ade80', image: grassImg, icon: '🌿' },
  grass_rocks: { name: 'Grass with Rocks', color: '#65a30d', image: grassRocksImg, icon: '🪨' },
  forest: { name: 'Forest', color: '#15803d', image: forestImg, icon: '🌲' },
  dense_forest: { name: 'Dense Forest', color: '#14532d', image: denseForestImg, icon: '🌳' },
  rocks: { name: 'Rocky', color: '#78716c', image: rocksImg, icon: '⛰️' },
  mountains: { name: 'Mountains', color: '#57534e', image: mountainsImg, icon: '🏔️' },
  snowy_mountains: { name: 'Snowy Mountains', color: '#e2e8f0', image: snowyMountainsImg, icon: '🏔️' },
  water: { name: 'Water', color: '#0ea5e9', image: waterImg, icon: '💧' },
  castle: { name: 'Outpost', color: '#a8a29e', image: outpostImg, icon: '🏰' },
  pond: { name: 'Pond', color: '#06b6d4', image: pondImg, icon: '🏊' },
};

// Hex math
const HEX_SIZE = 60; // keep constant; we’ll scale the whole layer
function axialToPixel(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (1.5 * q);
  const y = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x, y };
}

const HexTile = React.memo<HexTileProps>(function HexTile({
  tile, size, isSelected, onClick, isEditMode, showCoords,
}) {
    const { x, y } = axialToPixel(tile.q, tile.r, size);
    const terrain = TERRAIN_TYPES[tile.terrain] || TERRAIN_TYPES.grass;
    const hasTexture = Boolean(terrain.image);

  // Build hex path once per size
  const pathData = useMemo(() => {
    const pts: number[][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      pts.push([Math.cos(angle) * size * 0.95, Math.sin(angle) * size * 0.95]);
    }
    return `M ${pts.map((p) => p.join(',')).join(' L ')} Z`;
  }, [size]);

  // Use a pattern fill when image exists; fallback to solid color
  const fill = hasTexture ? `url(#tex-${tile.terrain})` : terrain.color;

  return (
    <g transform={`translate(${x}, ${y})`} onClick={() => onClick(tile)} className="cursor-pointer">
      <path d={pathData} fill={fill} stroke={isSelected ? '#fbbf24' : '#374151'} strokeWidth={isSelected ? 3 : 1} />
      {/* Subtle overlay icon if no texture */}
      <text
        x={0}
        y={5}
        textAnchor="middle"
        className="select-none pointer-events-none"
        style={{ fontSize: size * 0.5, opacity: hasTexture ? 0 : 1 }}
      >
        {terrain.icon}
      </text>

      {tile.owner && (
        <>
          <circle cx={0} cy={-size * 0.3} r={size * 0.15} fill={tile.owner.color || '#ef4444'} stroke="#fff" strokeWidth={2} />
          <text x={0} y={-size * 0.25} textAnchor="middle" fill="#fff" fontSize={size * 0.15} fontWeight="bold">
            {tile.owner.name?.charAt(0) || 'P'}
          </text>
        </>
      )}

      {showCoords && (
        <text x={0} y={size * 0.4} textAnchor="middle" fill="#000" fontSize={size * 0.15} className="select-none pointer-events-none">
          {tile.q},{tile.r}
        </text>
      )}
    </g>
  );
}, (prev, next) =>
  prev.tile.q === next.tile.q &&
  prev.tile.r === next.tile.r &&
  prev.tile.terrain === next.tile.terrain &&
  prev.size === next.size &&
  prev.isSelected === next.isSelected &&
  prev.isEditMode === next.isEditMode &&
  prev.showCoords === next.showCoords
);

const WorldMap: React.FC<WorldMapProps> = ({
  mapData = [],
  mapSize = 30,
  isAdmin = false,
  userId,
  onBack,
  onTileUpdate,
  onMapSave,
  onMapGenerate,
  selectedTile: externalSelectedTile,
  onTileSelect,
  findPlayerTile,
}) => {
  // Only keep UI states that change infrequently
  const [selectedTile, setSelectedTile] = useState<Tile | null>(externalSelectedTile || null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTerrain, setSelectedTerrain] = useState('grass');
  const [showCoords, setShowCoords] = useState(false);
  const [zoomUi, setZoomUi] = useState(100);

  useEffect(() => setSelectedTile(externalSelectedTile || null), [externalSelectedTile]);

  // Imperative pan/zoom (no React re-render)
  const svgGroupRef = useRef<SVGGElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const rafRef = useRef<number | null>(null);

  const applyTransform = () => {
    const g = svgGroupRef.current;
    if (!g) return;
    // Translate to center of viewport, then apply pan offset and zoom
    const tx = offsetRef.current.x + window.innerWidth / 2;
    const ty = offsetRef.current.y + window.innerHeight / 2;
    g.setAttribute('transform', `translate(${tx}, ${ty}) scale(${zoomRef.current})`);
  };

  useEffect(() => {
    applyTransform(); // initial
    const onResize = () => applyTransform();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scheduleTransform = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyTransform();
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditMode) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    offsetRef.current = { x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y };
    scheduleTransform();
  };
  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleZoom = (delta: number) => {
    const prev = zoomRef.current;
    zoomRef.current = Math.max(0.5, Math.min(3, prev + delta));
    setZoomUi(Math.round(zoomRef.current * 100)); // update UI only
    scheduleTransform();
  };

  const handleTileClick = (tile: Tile) => {
    setSelectedTile(tile);
    onTileSelect?.(tile);
    if (isEditMode && onTileUpdate) {
      onTileUpdate(tile.q, tile.r, selectedTerrain);
    }
  };

  const centerOnHome = () => {
    const homeTile = findPlayerTile ? findPlayerTile() : mapData.find((t) => t.owner?.id === userId);
    if (!homeTile) return;
    const { x, y } = axialToPixel(homeTile.q, homeTile.r, HEX_SIZE);
    offsetRef.current = { x: -x, y: -y };
    scheduleTransform();
    setSelectedTile(homeTile);
    onTileSelect?.(homeTile);
  };

  const saveMap = async () => {
    if (!isAdmin || !onMapSave) return;
    try {
      await onMapSave();
      alert('Map saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save map');
    }
  };

  const generateNewMap = async () => {
    if (!isAdmin || !onMapGenerate) return;
    const newSize = prompt('Enter map radius (10-100):', String(mapSize));
    if (newSize) {
      const size = Math.max(10, Math.min(100, parseInt(newSize)));
      await onMapGenerate(size);
    }
  };

  // Build patterns once (one per terrain type with image)
    const patternDefs = useMemo(
        () =>
            Object.entries(TERRAIN_TYPES)
                .filter(([_, t]) => Boolean(t.image))
                .map(([key, t]) => (
                    <pattern
                        id={`tex-${key}`}
                        key={key}
                        patternUnits="objectBoundingBox"
                        patternContentUnits="objectBoundingBox"
                        width="1"
                        height="1"
                        // Slight zoom-in to hide antialias seams
                        patternTransform={`scale(${TEXTURE_SCALE})`}
                    >
                        <image
                            href={t.image!}
                            x="0"
                            y="0"
                            width="1"
                            height="1"
                            // Keep correct aspect ratio and fill the hex without distortion
                            preserveAspectRatio="xMidYMid slice"
                            // If your art is pixel-styled, uncomment the next line:
                            // style={{ imageRendering: 'crisp-edges' as any }}
                        />
                    </pattern>
                )),
        []
    );

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all flex items-center gap-2"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Map className="w-6 h-6" />
                World Map
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setIsEditMode((v) => !v)}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      isEditMode ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white hover:bg_white/30'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditMode ? 'Editing' : 'Edit'}
                  </button>
                  {isEditMode && (
                    <>
                      <button
                        onClick={saveMap}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={generateNewMap}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all flex items-center gap-2"
                      >
                        <Map className="w-4 h-4" />
                        Generate
                      </button>
                    </>
                  )}
                </>
              )}

              <button
                onClick={() => setShowCoords((v) => !v)}
                className="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-all"
                title="Toggle coordinates"
              >
                #
              </button>

              <button
                onClick={centerOnHome}
                className="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-all"
                title="Center on home"
              >
                <Home className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 bg-white/20 rounded-lg">
                <button onClick={() => handleZoom(-0.2)} className="text-white px-3 py-2 hover:bg-white/20 rounded-l-lg transition-all">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-white px-2 min-w-[60px] text-center">{zoomUi}%</span>
                <button onClick={() => handleZoom(0.2)} className="text-white px-3 py-2 hover:bg-white/20 rounded-r-lg transition-all">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        <svg
          width="100%"
          height="100%"
          className="cursor-grab"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>{patternDefs}</defs>

          <g ref={svgGroupRef}>
            {mapData.map((tile) => (
              <HexTile
                key={`${tile.q},${tile.r}`}
                tile={{ ...tile, id: tile.id || `${tile.q},${tile.r}` }}
                size={HEX_SIZE}
                isSelected={selectedTile?.q === tile.q && selectedTile?.r === tile.r}
                onClick={handleTileClick}
                isEditMode={isEditMode}
                showCoords={showCoords}
              />
            ))}
          </g>
        </svg>

        {/* Tile info */}
        {selectedTile && (
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-lg rounded-lg p-4 text-white max-w-sm">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              {TERRAIN_TYPES[selectedTile.terrain]?.icon}
              {TERRAIN_TYPES[selectedTile.terrain]?.name || 'Unknown'}
            </h3>
            <div className="text-sm space-y-1">
              <p>Coordinates: ({selectedTile.q}, {selectedTile.r})</p>
              {selectedTile.owner && (
                <p className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTile.owner.color }} />
                  Owner: {selectedTile.owner.name}
                </p>
              )}
              {selectedTile.terrain === 'castle' && (
                <div className="mt-3 space-y-2">
                  {selectedTile.owner?.id === userId ? (
                    <button className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                      <Home className="w-4 h-4" />
                      Your Settlement
                    </button>
                  ) : (
                    <button className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                      <Sword className="w-4 h-4" />
                      Attack
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-lg rounded-lg p-3 text-white/80 text-sm max-w-xs">
          <p className="mb-1">🖱️ Drag to pan</p>
          <p className="mb-1">🔍 Use zoom controls</p>
          <p>🏰 Click tiles to see details</p>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
