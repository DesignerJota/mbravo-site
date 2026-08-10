// /src/data/yarns.ts
// Intelligent Raw Materials & Real Yarn Swatches Database (Senshoku / DROPS Design Catalog)

export interface YarnLine {
  id: string;
  name: string; // e.g. "DROPS Safran"
  supplier: string; // e.g. "DROPS Design / Senshoku"
  composition: string; // e.g. "100% Algodão Egípcio Penteado"
  description: string;
  weight: string; // e.g. "50g = ~160m"
  recommendedHook: string; // e.g. "3.0mm"
  badge: string; // e.g. "Fio Fino / Nobre"
  catalogUrl: string;
  websiteUrl: string;
}

export interface YarnColor {
  id: string;
  yarnLineId: string; // "drops-safran" | "drops-paris" | "drops-muskat"
  refCode: string; // Technical reference (e.g., "Ref. 57") - ADMIN ONLY
  name: string; // Clean public name (e.g., "Rosa Claríssimo")
  colorHex: string; // Fallback CSS hex color
  swatchUrl: string; // High-resolution real texture swatch image URL from Senshoku/DROPS
  imageUrl?: string; // Optional alias for swatchUrl
  inStock?: boolean; // Optional stock status
  textureType: 'cotton-fine' | 'cotton-[#121A0D]' | 'cotton-thick' | 'linen-rustic' | 'crochet-ribbed';
}

export const YARN_LINES: YarnLine[] = [
  {
    id: 'drops-safran',
    name: 'DROPS Safran',
    supplier: 'DROPS Design / Senshoku',
    composition: '100% Algodão Egípcio Penteado',
    description: 'Fio nobre de algodão egípcio de fibra longa, fiação com múltiplos fios e brilho natural acetinado. Ideal para vestuário e acessórios delicados.',
    weight: '50g (~160m) - Grupo A',
    recommendedHook: '3.0mm',
    badge: 'Vestuário & Peças Delicadas',
    catalogUrl: 'https://www.senshoku.es/pt/buscar?controller=search&s=drops+safran',
    websiteUrl: 'https://www.senshoku.es/pt/buscar?controller=search&s=drops+safran'
  },
  {
    id: 'drops-paris',
    name: 'DROPS Paris',
    supplier: 'DROPS Design / Senshoku',
    composition: '100% Algodão Penteado Virgem',
    description: 'Algodão de fibra grossa, altamente absorvente, estruturado e macio ao toque. Perfeito para malas, pouches, ncessaires e decoração de casa.',
    weight: '50g (~75m) - Grupo C',
    recommendedHook: '5.0mm',
    badge: 'Malas, Pouches & Décor',
    catalogUrl: 'https://www.senshoku.es/pt/buscar?controller=search&s=drops+paris',
    websiteUrl: 'https://www.senshoku.es/pt/buscar?controller=search&s=drops+paris'
  },
  {
    id: 'drops-muskat',
    name: 'DROPS Muskat',
    supplier: 'DROPS Design / Senshoku',
    composition: '100% Algodão Egípcio Mercerizado',
    description: 'Algodão egípcio mercerizado com brilho suave radiante, elasticidade natural e extraordinária resistência ao desgaste.',
    weight: '50g (~100m) - Grupo B',
    recommendedHook: '4.0mm',
    badge: 'Acessórios Premium',
    catalogUrl: 'https://www.senshoku.es/pt/buscar?controller=search&s=drops+muskat',
    websiteUrl: 'https://www.senshoku.es/pt/buscar?controller=search&s=drops+muskat'
  }
];

export const YARN_COLORS_DATABASE: YarnColor[] = [
  // --- DROPS SAFRAN (Vestuário & Acessórios Fofos) ---
  {
    id: 'safran-18',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 18',
    name: 'Natural',
    colorHex: '#F5EFEB',
    swatchUrl: '/safran-18.webp',
    textureType: 'cotton-fine'
  },
  {
    id: 'safran-17',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 17',
    name: 'Branco',
    colorHex: '#FFFFFF',
    swatchUrl: '/safran-17.webp',
    textureType: 'cotton-fine'
  },
  {
    id: 'safran-68',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 68',
    name: 'Café',
    colorHex: '#4A3525',
    swatchUrl: '/safran-68.webp',
    textureType: 'cotton-fine'
  },
  {
    id: 'safran-01',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 01',
    name: 'Rosa do Deserto',
    colorHex: '#E2A9B0',
    swatchUrl: '/safran-01.webp',
    textureType: 'cotton-fine'
  },
  {
    id: 'safran-78',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 78',
    name: 'Verde Floresta',
    colorHex: '#2D442B',
    swatchUrl: '/safran-78.webp',
    textureType: 'cotton-fine'
  },
  {
    id: 'safran-60',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 60',
    name: 'Verde Musgo',
    colorHex: '#485935',
    swatchUrl: '/safran-60.webp',
    textureType: 'cotton-fine'
  },
  {
    id: 'safran-73',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 73',
    name: 'Azul Cobalto',
    colorHex: '#1E3862',
    swatchUrl: '/safran-73.webp',
    textureType: 'cotton-fine'
  },
  {
    id: 'safran-50',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 50',
    name: 'Menta',
    colorHex: '#9AC4B5',
    swatchUrl: '/safran-50.webp',
    textureType: 'cotton-fine'
  },
  {
    id: 'safran-19',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 19',
    name: 'Vermelho',
    colorHex: '#B8252A',
    swatchUrl: '/safran-19.webp',
    textureType: 'cotton-fine'
  },
  {
    id: 'safran-76',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 76',
    name: 'Azul Pó',
    colorHex: '#A0B4C8',
    swatchUrl: '/safran-76.webp',
    textureType: 'cotton-fine'
  },
  {
    id: 'safran-57',
    yarnLineId: 'drops-safran',
    refCode: 'Ref. 57',
    name: 'Rosa Claríssimo',
    colorHex: '#F2D3D8',
    swatchUrl: '/safran-57.webp',
    textureType: 'cotton-fine'
  },

  // --- DROPS PARIS (Malas, Pouches & Décor) ---
  {
    id: 'paris-16',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 16',
    name: 'Branco',
    colorHex: '#FAFAFA',
    swatchUrl: '/paris-16.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-43',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 43',
    name: 'Verde',
    colorHex: '#355E3B',
    swatchUrl: '/paris-43.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-25',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 25',
    name: 'Verde Musgo',
    colorHex: '#485935',
    swatchUrl: '/paris-25.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-48',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 48',
    name: 'Petróleo',
    colorHex: '#2C4D59',
    swatchUrl: '/paris-48.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-76',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 76',
    name: 'Azul Ternura',
    colorHex: '#89AEC6',
    swatchUrl: '/paris-76.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-57',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 57',
    name: 'Rosa Claríssimo',
    colorHex: '#F2D3D8',
    swatchUrl: '/paris-57.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-35',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 35',
    name: 'Baunilha',
    colorHex: '#F3E2B8',
    swatchUrl: '/paris-35.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-19',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 19',
    name: 'Amarelo Claro',
    colorHex: '#F9E086',
    swatchUrl: '/paris-19.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-44',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 44',
    name: 'Castanho',
    colorHex: '#5C4033',
    swatchUrl: '/paris-44.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-12',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 12',
    name: 'Vermelho',
    colorHex: '#C41E3A',
    swatchUrl: '/paris-12.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-15',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 15',
    name: 'Preto',
    colorHex: '#121212',
    swatchUrl: '/paris-15.webp',
    textureType: 'cotton-thick'
  },
  {
    id: 'paris-17',
    yarnLineId: 'drops-paris',
    refCode: 'Ref. 17',
    name: 'Natural',
    colorHex: '#F0EAD6',
    swatchUrl: '/paris-17.webp',
    textureType: 'cotton-thick'
  }
];

/**
 * Returns clean customer-facing color name (strips Ref. code and supplier names)
 */
export function getCleanColorName(rawColorStr: string): string {
  if (!rawColorStr) return '';
  let cleaned = rawColorStr.trim();

  // Strip rm_ prefix (e.g. rm_safran_18_natural -> safran 18 natural)
  cleaned = cleaned.replace(/^rm_/i, '');
  // Strip DROPS or Senshoku references
  cleaned = cleaned.replace(/^(DROPS|Senshoku)\s+[A-Za-z0-9\s]+?[-–—]\s*/i, '');
  cleaned = cleaned.replace(/^Ref\.\s*\d+\s*[-–—]?\s*/i, '');
  cleaned = cleaned.replace(/^(\d+)\s*[-–—]?\s*/, '');
  cleaned = cleaned.replace(/\s*\(Ref\.\s*\d+\)/i, '');
  
  // If string contains hyphenated parts like "DROPS Safran - Ref. 57 Rosa Claríssimo", split by hyphen
  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ');
    cleaned = parts[parts.length - 1].trim();
  }

  // Handle rm_safran_18_natural or safran_18_natural format
  if (cleaned.includes('_')) {
    const parts = cleaned.split('_').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (lastPart && !/^\d+$/.test(lastPart)) {
      cleaned = lastPart;
    } else if (parts.length > 1) {
      cleaned = parts.slice(1).join(' ');
    }
  }

  cleaned = cleaned.replace(/^Ref\.\s*\d+\s*/i, '');

  return cleaned.trim() || rawColorStr.trim();
}

/**
 * Finds matching yarn color from database by name, reference code, or admin ID.
 * Guarantees that a valid YarnColor object with a real .webp swatchUrl is returned.
 */
export function findYarnColor(colorNameOrRef: string, yarnLineId?: string): YarnColor | undefined {
  if (!colorNameOrRef) return undefined;
  const rawLower = colorNameOrRef.toLowerCase().trim();
  const target = rawLower.replace(/_/g, ' ');
  const cleanTarget = getCleanColorName(colorNameOrRef).toLowerCase();

  // Extract digits if present in target (e.g., "18", "68", "01")
  const numMatch = target.match(/\b(\d{1,2})\b/);
  const targetNum = numMatch ? numMatch[1].padStart(2, '0') : null;

  // 1. Direct ID match (e.g. "safran-18", "paris-16")
  const directId = YARN_COLORS_DATABASE.find(item => {
    if (yarnLineId && item.yarnLineId !== yarnLineId) return false;
    return item.id.toLowerCase() === rawLower || item.id.toLowerCase() === rawLower.replace(/^rm_/, '');
  });
  if (directId) return directId;

  // 2. Search by ref number + yarn line if available
  if (targetNum) {
    const matchByNum = YARN_COLORS_DATABASE.find(item => {
      if (yarnLineId && item.yarnLineId !== yarnLineId) return false;
      const refNum = item.refCode.replace(/\D/g, '').padStart(2, '0');
      if (refNum === targetNum) {
        if (target.includes('safran') && item.yarnLineId === 'drops-safran') return true;
        if (target.includes('paris') && item.yarnLineId === 'drops-paris') return true;
        if (!target.includes('safran') && !target.includes('paris')) return true;
      }
      return false;
    });
    if (matchByNum) return matchByNum;
  }

  // 3. Match by name or cleanTarget within requested yarnLineId
  const lineMatch = YARN_COLORS_DATABASE.find(item => {
    if (yarnLineId && item.yarnLineId !== yarnLineId) return false;
    const itemName = item.name.toLowerCase();
    return itemName === cleanTarget || target.includes(itemName) || itemName.includes(cleanTarget);
  });
  if (lineMatch) return lineMatch;

  // 4. Cross-line search if yarnLineId restriction produced no match
  const globalMatch = YARN_COLORS_DATABASE.find(item => {
    const itemName = item.name.toLowerCase();
    return itemName === cleanTarget || target.includes(itemName) || itemName.includes(cleanTarget);
  });
  if (globalMatch) return globalMatch;

  // 5. Keyword fuzzy matching to ensure 100% .webp image coverage
  const keywordMap: Array<{ keywords: string[]; swatchId: string }> = [
    { keywords: ['rosa', 'pink', 'pálido', 'deserto', 'claríssimo', 'coral', 'marmore'], swatchId: yarnLineId === 'drops-paris' ? 'paris-57' : 'safran-01' },
    { keywords: ['verde', 'musgo', 'floresta', 'menta', 'mousse', 'oliva', 'sálvia', 'abacate'], swatchId: yarnLineId === 'drops-paris' ? 'paris-25' : 'safran-60' },
    { keywords: ['azul', 'glaciar', 'cobalto', 'petróleo', 'pó', 'ternura', 'céu', 'marino', 'marinho'], swatchId: yarnLineId === 'drops-paris' ? 'paris-76' : 'safran-76' },
    { keywords: ['amarelo', 'baunilha', 'mostarda', 'gold', 'ouro', 'sol', 'canário'], swatchId: yarnLineId === 'drops-paris' ? 'paris-19' : 'paris-35' },
    { keywords: ['cacau', 'café', 'marrom', 'castanho', 'chocolate', 'nogueira', 'terra', 'avelã'], swatchId: yarnLineId === 'drops-paris' ? 'paris-44' : 'safran-68' },
    { keywords: ['preto', 'black', 'noite', 'carvão'], swatchId: 'paris-15' },
    { keywords: ['branco', 'white', 'gelo', 'neve', 'puro'], swatchId: yarnLineId === 'drops-paris' ? 'paris-16' : 'safran-17' },
    { keywords: ['natural', 'cru', 'bege', 'creme', 'areia', 'nude', 'marfim', 'palha', 'linho'], swatchId: yarnLineId === 'drops-paris' ? 'paris-17' : 'safran-18' },
    { keywords: ['vermelho', 'red', 'vinho', 'terracota', 'bordo', 'rubi'], swatchId: yarnLineId === 'drops-paris' ? 'paris-12' : 'safran-19' }
  ];

  for (const group of keywordMap) {
    if (group.keywords.some(k => target.includes(k) || cleanTarget.includes(k))) {
      const kwMatch = YARN_COLORS_DATABASE.find(item => item.id === group.swatchId);
      if (kwMatch) return kwMatch;
    }
  }

  // 6. Absolute Fallback: Return a valid default YarnColor matching requested yarnLineId
  const defaultFallbackId = yarnLineId === 'drops-paris' ? 'paris-17' : 'safran-18';
  return YARN_COLORS_DATABASE.find(item => item.id === defaultFallbackId) || YARN_COLORS_DATABASE[0];
}

/**
 * Helper to generate background style with real texture image or CSS fallback pattern
 */
export function getSwatchStyle(colorNameOrRef: string, yarnLineId?: string) {
  const match = findYarnColor(colorNameOrRef, yarnLineId);
  if (match) {
    const imgUrl = match.imageUrl || match.swatchUrl;
    return {
      backgroundColor: match.colorHex,
      backgroundImage: `url(${imgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  // Fallback
  return {
    backgroundColor: '#D8C3A5'
  };
}
