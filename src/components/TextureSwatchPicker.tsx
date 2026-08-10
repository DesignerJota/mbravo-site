// /src/components/TextureSwatchPicker.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ZoomIn, Check, Ban, AlertCircle } from 'lucide-react';
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

  // Get active yarn line metadata
  const currentYarnLine = YARN_LINES.find(l => l.id === yarnLineId) || YARN_LINES[0];

  // Helper to check if a color is out of stock
  const isColorOutOfStock = React.useCallback((swatchName: string, swatchItem?: YarnColor): boolean => {
    if (swatchItem && swatchItem.inStock === false) return true;
    
    const clean = getCleanColorName(swatchName).toLowerCase();
    
    // Check yarnStockMap
    if (yarnStockMap[clean] === false || yarnStockMap[swatchName] === false) return true;
    
    // Check outOfStockColors list
    return outOfStockColors.some(oos => {
      const cleanOOS = getCleanColorName(oos).toLowerCase();
      return cleanOOS === clean || oos.toLowerCase() === swatchName.toLowerCase();
    });
  }, [outOfStockColors, yarnStockMap]);

  // Filter swatches by yarnLineId or options provided
  const swatchList: YarnColor[] = React.useMemo(() => {
    // 1. Get database colors for the yarn line if yarnLineId is specified
    const lineColors = yarnLineId 
      ? YARN_COLORS_DATABASE.filter(item => item.yarnLineId === yarnLineId)
      : [];

    if (availableOptions && availableOptions.length > 0) {
      const mappedOptions = availableOptions.map(opt => {
        const found = findYarnColor(opt, yarnLineId);
        const clean = getCleanColorName(opt);
        if (found) {
          return {
            ...found,
            name: found.name || clean,
            swatchUrl: found.swatchUrl || found.imageUrl || (yarnLineId === 'drops-paris' ? '/paris-17.webp' : '/safran-18.webp')
          };
        }
        return {
          id: `custom-${clean}`,
          yarnLineId: yarnLineId || 'drops-safran',
          refCode: '',
          name: clean,
          colorHex: getColorSwatchBg(opt),
          swatchUrl: yarnLineId === 'drops-paris' ? '/paris-17.webp' : '/safran-18.webp',
          textureType: 'cotton-fine',
          inStock: true
        } as YarnColor;
      });

      // If yarnLineId is set, merge lineColors into mappedOptions so ALL yarn line colors are present
      if (lineColors.length > 0) {
        const fullList = [...mappedOptions];
        lineColors.forEach(lc => {
          if (!fullList.some(item => item.id === lc.id || item.name.toLowerCase() === lc.name.toLowerCase())) {
            fullList.push(lc);
          }
        });
        return fullList;
      }
      return mappedOptions;
    }

    if (lineColors.length > 0) {
      return lineColors;
    }

    return YARN_COLORS_DATABASE;
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

      {/* Yarn Line Info Badge (Clean Customer View) */}
      {showYarnBadge && currentYarnLine && (
        <div className="flex items-center justify-between text-[9px] text-forest/50 bg-[#FCFBF9] px-2.5 py-1 rounded-lg border border-forest/10">
          <span className="font-semibold text-[#C5A059] flex items-center gap-1">
            <Sparkles size={10} /> {currentYarnLine.composition}
          </span>
          <span className="text-[8.5px] uppercase tracking-wider">{currentYarnLine.badge}</span>
        </div>
      )}

      {/* Swatch Selection Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 relative">
        {swatchList.map((swatch) => {
          const isSelected = getCleanColorName(selectedColor) === swatch.name || selectedColor === swatch.name;
          const isOOS = isColorOutOfStock(swatch.name, swatch);

          return (
            <motion.div
              key={swatch.id}
              whileHover={!isOOS ? { scale: 1.08 } : { scale: 1.02 }}
              whileTap={!isOOS ? { scale: 0.95 } : undefined}
              onMouseEnter={() => setHoveredSwatch(swatch)}
              onMouseLeave={() => setHoveredSwatch(null)}
              onClick={() => {
                if (!isOOS) {
                  onChange(swatch.name);
                }
              }}
              className={`relative aspect-square rounded-xl overflow-hidden border transition-all duration-300 shadow-sm ${
                isOOS
                  ? 'cursor-not-allowed border-red-300/40 opacity-45 grayscale-[20%]'
                  : 'cursor-pointer group opacity-90 hover:opacity-100'
              } ${
                isSelected && !isOOS
                  ? 'ring-2 ring-[#C5A059] border-white shadow-md scale-105 z-10'
                  : ''
              } ${
                isSelected && isOOS
                  ? 'ring-2 ring-red-400 border-white'
                  : 'border-forest/15 hover:border-[#C5A059]'
              }`}
            >
              {/* Texture Swatch Image Container with Warm Linen Skeleton & HEX Fallback */}
              <div 
                className="w-full h-full relative overflow-hidden bg-[#FAF8F5]"
                style={{ backgroundColor: swatch.colorHex || '#D8C3A5' }}
              >
                {(swatch.swatchUrl || swatch.imageUrl) && (
                  <img
                    src={swatch.swatchUrl || swatch.imageUrl}
                    alt={swatch.name}
                    loading="eager"
                    decoding="async"
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      !isOOS ? 'group-hover:scale-125' : ''
                    }`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>

              {/* Tactile Overlay Pattern */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />

              {/* OUT OF STOCK Visual Indicator: Red Diagonal Strike-Through & Banner */}
              {isOOS && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Subtle Diagonal Line */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-600/70 to-transparent w-full h-[2px] rotate-45 top-1/2 -translate-y-1/2 shadow-xs" />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
                  <div className="z-10 bg-red-950/80 text-red-200 text-[7px] font-bold px-1 py-0.2 rounded uppercase tracking-tighter border border-red-500/30 flex items-center gap-0.5">
                    <Ban size={7} /> {lang === 'pt' ? 'ESGOTADO' : 'OOS'}
                  </div>
                </div>
              )}

              {/* Selection Check Indicator for In-Stock */}
              {isSelected && !isOOS && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-[#343E2C]/30 backdrop-blur-[1px] flex items-center justify-center text-white"
                >
                  <div className="w-4 h-4 rounded-full bg-[#C5A059] text-forest flex items-center justify-center shadow-md">
                    <Check size={10} strokeWidth={3} />
                  </div>
                </motion.div>
              )}

              {/* Hover Zoom Indicator */}
              {!isOOS && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <ZoomIn size={10} className="text-white drop-shadow-md" />
                </div>
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
                    ? `url("${hoveredSwatch.imageUrl || hoveredSwatch.swatchUrl}")`
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

