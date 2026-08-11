// /src/components/TextureSwatchPicker.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ZoomIn, Check, Ban, AlertCircle, X } from 'lucide-react';
import { YARN_COLORS_DATABASE, YARN_LINES, YarnColor, getCleanColorName, findYarnColor } from '../data/yarns';
import { getColorSwatchBg } from '../translations';

interface TextureSwatchPickerProps {
  label: string;
  selectedColor: string;
  onChange: (colorName: string) => void;
  availableOptions?: string[];
  yarnLineId?: string; // e.g. "drops-safran" or "drops-paris"
  outOfStockColors?: string[]; // Array of clean color names or raw strings that are OOS
  yarnStockMap?: Record<string, boolean>; // e.g. { "Rosa Claríssimo": false }
  lang?: 'pt' | 'en';
  showYarnBadge?: boolean;
}

// Module-level shared stock map cache and subscriber listener set for universal auto-sync
let globalFetchedStockMap: Record<string, boolean> | null = null;
const stockListeners = new Set<(map: Record<string, boolean>) => void>();

async function fetchGlobalInventoryStock() {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${API_BASE_URL}/api/inventory`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.inventory)) return;

    const map: Record<string, boolean> = {};
    data.inventory.forEach((item: any) => {
      const isAvailable = Number(item.quantity ?? 0) > 0;
      if (item.id) {
        map[item.id] = isAvailable;
        map[item.id.toLowerCase()] = isAvailable;
      }
      if (item.name) {
        map[item.name] = isAvailable;
        map[item.name.toLowerCase()] = isAvailable;
        const clean = getCleanColorName(item.name).toLowerCase();
        map[clean] = isAvailable;
      }
      if (item.refCode) {
        map[item.refCode] = isAvailable;
        map[item.refCode.toLowerCase()] = isAvailable;
      }
    });
    globalFetchedStockMap = map;
    stockListeners.forEach(listener => listener(map));
  } catch (err) {
    console.warn("[TEXTURE SWATCH] Failed auto-fetching Railway inventory:", err);
  }
}

export const TextureSwatchPicker: React.FC<TextureSwatchPickerProps> = ({
  label,
  selectedColor,
  onChange,
  availableOptions,
  yarnLineId,
  outOfStockColors = [],
  yarnStockMap = {},
  lang = 'pt',
  showYarnBadge = true
}) => {
  const [hoveredSwatch, setHoveredSwatch] = useState<YarnColor | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [internalStockMap, setInternalStockMap] = useState<Record<string, boolean>>(
    globalFetchedStockMap || {}
  );

  // Auto-fetch Railway inventory on mount and subscribe to stock updates universally
  React.useEffect(() => {
    const handleUpdate = (map: Record<string, boolean>) => {
      setInternalStockMap(map);
    };
    stockListeners.add(handleUpdate);

    if (!globalFetchedStockMap) {
      fetchGlobalInventoryStock();
    } else {
      setInternalStockMap(globalFetchedStockMap);
    }

    const handleCustomEvent = () => {
      fetchGlobalInventoryStock();
    };
    window.addEventListener('inventory-updated', handleCustomEvent);

    return () => {
      stockListeners.delete(handleUpdate);
      window.removeEventListener('inventory-updated', handleCustomEvent);
    };
  }, []);

  // Combine prop yarnStockMap with auto-fetched internalStockMap
  const effectiveStockMap = React.useMemo(() => {
    return { ...internalStockMap, ...yarnStockMap };
  }, [internalStockMap, yarnStockMap]);

  // Get active yarn line metadata
  const currentYarnLine = YARN_LINES.find(l => l.id === yarnLineId) || YARN_LINES[0];

  // Helper to check if a color is out of stock
  const isColorOutOfStock = React.useCallback((swatchName: string, swatchItem?: YarnColor): boolean => {
    if (swatchItem && swatchItem.inStock === false) return true;
    
    const clean = getCleanColorName(swatchName).toLowerCase();
    
    // Check effectiveStockMap
    if (effectiveStockMap[clean] === false || effectiveStockMap[swatchName] === false || effectiveStockMap[swatchName.toLowerCase()] === false) return true;
    if (swatchItem) {
      if (effectiveStockMap[swatchItem.id] === false || effectiveStockMap[swatchItem.id.toLowerCase()] === false || effectiveStockMap[swatchItem.name.toLowerCase()] === false) return true;
    }
    
    // Check outOfStockColors list
    return outOfStockColors.some(oos => {
      const cleanOOS = getCleanColorName(oos).toLowerCase();
      return cleanOOS === clean || oos.toLowerCase() === swatchName.toLowerCase();
    });
  }, [outOfStockColors, effectiveStockMap]);

  // Filter & strictly deduplicate swatches by yarnLineId or options provided
  const swatchList: YarnColor[] = React.useMemo(() => {
    // 1. Get database colors for the yarn line if yarnLineId is specified
    const lineColors = yarnLineId 
      ? YARN_COLORS_DATABASE.filter(item => item.yarnLineId === yarnLineId)
      : [];

    let rawList: YarnColor[] = [];

    if (availableOptions && availableOptions.length > 0) {
      const mappedOptions = availableOptions.map(opt => {
        const found = findYarnColor(opt, yarnLineId);
        const clean = getCleanColorName(opt);
        if (found) {
          return {
            ...found,
            name: found.name || clean,
            swatchUrl: found.swatchUrl || found.imageUrl || (yarnLineId === 'drops-paris' ? '/swatches/paris-17.webp' : '/swatches/safran-18.webp')
          };
        }
        return {
          id: `custom-${clean.toLowerCase().replace(/\s+/g, '-')}`,
          yarnLineId: yarnLineId || 'drops-safran',
          refCode: '',
          name: clean,
          colorHex: getColorSwatchBg(opt),
          swatchUrl: yarnLineId === 'drops-paris' ? '/swatches/paris-17.webp' : '/swatches/safran-18.webp',
          textureType: 'cotton-fine',
          inStock: true
        } as YarnColor;
      });

      rawList = [...mappedOptions];

      // If yarnLineId is set, merge lineColors into rawList so ALL yarn line colors are present
      if (lineColors.length > 0) {
        lineColors.forEach(lc => {
          rawList.push(lc);
        });
      }
    } else if (lineColors.length > 0) {
      rawList = lineColors;
    } else {
      rawList = YARN_COLORS_DATABASE;
    }

    // Deduplicate strictly by normalized clean name AND by ID
    const uniqueList: YarnColor[] = [];
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();

    for (const item of rawList) {
      const cleanName = getCleanColorName(item.name).trim().toLowerCase();
      const normId = item.id.trim().toLowerCase();

      if (!seenNames.has(cleanName) && !seenIds.has(normId)) {
        seenNames.add(cleanName);
        seenIds.add(normId);
        uniqueList.push(item);
      }
    }

    return uniqueList;
  }, [availableOptions, yarnLineId]);

  const cleanSelectedName = getCleanColorName(selectedColor);
  const activeHoverSwatch = hoveredSwatch;
  const isHoveredOOS = activeHoverSwatch ? isColorOutOfStock(activeHoverSwatch.name, activeHoverSwatch) : false;
  const isSelectedOOS = isColorOutOfStock(selectedColor);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoverPos({ x, y });
  };

  // Helper para normalizar o caminho da imagem de forma segura
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className="space-y-2.5 w-full font-sans text-left">
      {/* Header Label + Selected Color Clean Name & OOS Tag */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[#C5A059] text-[10px] sm:text-xs">●</span>
          <h5 className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-forest/70">
            {label}
          </h5>
        </div>
        
        <div className="flex items-center gap-2">
          {swatchList.length > 10 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] tracking-[0.2em] font-light uppercase underline-offset-4 hover:underline text-[#C5A059] hover:text-forest transition-colors cursor-pointer bg-transparent p-0 border-0 flex items-center gap-1"
            >
              <span>
                {isExpanded
                  ? (lang === 'pt' ? 'Recolher' : 'Collapse')
                  : (lang === 'pt' ? `Ver todas (${swatchList.length})` : `Show all (${swatchList.length})`)}
              </span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-forest/5 px-2.5 py-0.5 rounded-full border border-forest/10">
            <span className={`text-[10px] sm:text-[11px] font-medium tracking-wide ${
              (activeHoverSwatch ? isHoveredOOS : isSelectedOOS) ? 'text-red-700 font-semibold' : 'text-forest'
            }`}>
              {activeHoverSwatch ? activeHoverSwatch.name : (cleanSelectedName || swatchList[0]?.name)}
              {(activeHoverSwatch ? isHoveredOOS : isSelectedOOS) && (
                <span className="ml-1 text-red-600 font-bold text-[9px]">
                  — {lang === 'pt' ? 'Indisponível' : 'Out of Stock'}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Yarn Line Info Badge (Clean Customer View) */}
      {showYarnBadge && currentYarnLine && (
        <div className="flex items-center justify-between text-[9px] text-forest/50 bg-[#FCFBF9] px-2.5 py-1 rounded-lg border border-forest/10">
          <span className="font-semibold text-[#C5A059] flex items-center gap-1">
            <Sparkles size={10} /> {currentYarnLine.composition}
          </span>
          <span className="text-[8.5px] uppercase tracking-wider">{currentYarnLine.badge}</span>
        </div>
      )}

      {/* Swatch Selection Grid / Collapsible Horizontal Container */}
      <div className={`relative transition-all duration-300 ${
        !isExpanded && swatchList.length > 10
          ? 'flex flex-wrap gap-2 sm:gap-2.5 items-center'
          : 'flex flex-wrap gap-2 sm:gap-2.5 items-center max-h-[220px] overflow-y-auto pr-1'
      }`}>
        {swatchList.slice(0, !isExpanded && swatchList.length > 10 ? 10 : swatchList.length).map((swatch) => {
          // Comparação normalizada para evitar falsas seleções múltiplas
          const isSelected = cleanSelectedName.trim().toLowerCase() === swatch.name.trim().toLowerCase();
          const isOOS = isColorOutOfStock(swatch.name, swatch);
          const rawImgUrl = swatch.swatchUrl || swatch.imageUrl;

          return (
            <motion.div
              key={swatch.id}
              whileHover={!isOOS ? { scale: 1.1 } : { scale: 1.02 }}
              whileTap={!isOOS ? { scale: 0.95 } : undefined}
              onMouseEnter={() => setHoveredSwatch(swatch)}
              onMouseLeave={() => setHoveredSwatch(null)}
              onClick={() => {
                if (!isOOS) {
                  onChange(swatch.name);
                }
              }}
              className={`relative rounded-full overflow-hidden transition-all duration-200 shrink-0 ${
                'w-6 h-6 sm:w-7 sm:h-7'
              } ${
                isOOS
                  ? 'cursor-not-allowed border border-red-300/40 opacity-40 grayscale'
                  : 'cursor-pointer group opacity-90 hover:opacity-100 border border-forest/15 hover:border-[#C5A059]'
              } ${
                isSelected && !isOOS
                  ? 'ring-1 ring-[#C5A059] ring-offset-2 ring-offset-[#FAF8F5] z-10 border-[#C5A059]'
                  : ''
              } ${
                isSelected && isOOS
                  ? 'ring-1 ring-red-400 ring-offset-2'
                  : ''
              }`}
            >
              {/* Texture Swatch Image Container */}
              <div 
                className="w-full h-full relative overflow-hidden rounded-full bg-[#FAF8F5]"
                style={{ backgroundColor: swatch.colorHex || '#D8C3A5' }}
              >
                {rawImgUrl && (
                  <img
                    src={getImageUrl(rawImgUrl)}
                    alt={swatch.name}
                    loading="eager"
                    decoding="async"
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      !isOOS ? 'group-hover:scale-125' : ''
                    }`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>

              {/* OUT OF STOCK Visual Indicator */}
              {isOOS && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-[0.5px] pointer-events-none z-10">
                  <X size={10} strokeWidth={2.5} className="text-red-300" />
                </div>
              )}

              {/* Selection Check Indicator for In-Stock */}
              {isSelected && !isOOS && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 rounded-full bg-[#343E2C]/30 backdrop-blur-[0.5px] flex items-center justify-center text-white"
                >
                  <Check size={10} strokeWidth={3} className="text-[#C5A059]" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Disruptive Tactile Magnifier / Zoom Lens View on Hover */}
      <AnimatePresence>
        {hoveredSwatch && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onMouseMove={handleMouseMove}
            className={`p-3 rounded-2xl border shadow-xl flex items-center gap-3 relative overflow-hidden ${
              isHoveredOOS 
                ? 'bg-red-950/5 border-red-300/40' 
                : 'bg-[#FCFBF9] border-[#C5A059]/30'
            }`}
          >
            {/* Magnifier Lens Window */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shadow-inner relative shrink-0 ${
              isHoveredOOS ? 'border-red-400/50' : 'border-[#C5A059]'
            }`}>
              <div
                className="w-full h-full bg-no-repeat transition-all duration-75"
                style={{
                  backgroundColor: hoveredSwatch.colorHex,
                  backgroundImage: (hoveredSwatch.imageUrl || hoveredSwatch.swatchUrl)
                    ? `url("${getImageUrl(hoveredSwatch.imageUrl || hoveredSwatch.swatchUrl)}")`
                    : 'none',
                  backgroundSize: '300%',
                  backgroundPosition: `${hoverPos.x}% ${hoverPos.y}%`
                }}
              />
              <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none" />
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[7px] px-1 rounded backdrop-blur-xs flex items-center gap-0.5">
                <ZoomIn size={8} /> LUPA 3X
              </div>
            </div>

            {/* Color Detail Text */}
            <div className="flex-1 text-left space-y-1">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: hoveredSwatch.colorHex }} />
                  <h6 className="text-[11px] sm:text-xs font-bold text-forest tracking-wide">
                    {hoveredSwatch.name}
                  </h6>
                </div>
                {isHoveredOOS ? (
                  <span className="text-[8.5px] uppercase tracking-wider font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200 flex items-center gap-0.5">
                    <AlertCircle size={9} /> {lang === 'pt' ? 'Sem Stock' : 'Out of Stock'}
                  </span>
                ) : (
                  <span className="text-[8.5px] uppercase tracking-wider font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {lang === 'pt' ? 'Stock Disponível' : 'In Stock'}
                  </span>
                )}
              </div>
              <p className="text-[9.5px] text-forest/70 leading-relaxed font-light">
                {isHoveredOOS
                  ? (lang === 'pt' 
                      ? 'Esta cor encontra-se temporariamente sem stock no Atelier. Por favor selecione outra tonalidade.'
                      : 'This color is currently out of stock in our Atelier. Please select another shade.')
                  : (lang === 'pt'
                      ? 'Amostra tátil de fio 100% algodão. Textura real e suave para tricot/crochet autoral.'
                      : 'Tactile swatch of 100% cotton yarn. Real and soft texture for authorial crochet.')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
