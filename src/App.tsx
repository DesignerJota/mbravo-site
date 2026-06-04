import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { Menu, X, Instagram, Facebook, ArrowRight, ChevronLeft, ChevronRight, Share2, Mail, MessageCircle, Sparkles, Layers, Ban, AlertCircle, Feather, Palette, Heart } from 'lucide-react';
// @ts-ignore
import heroBg from './assets/images/mbravo_hero_bg_1780505167063.png';

// --- Constants & Types ---
const NAV_LINKS = [
  { name: 'História', href: '#sobre' },
  { name: 'Catálogo', href: '#collection' },
  { name: 'Contactos', href: '#contacto' },
];

const CONTACT_EMAIL = "handmade.mbravo@gmail.com";
const EMAIL_SUBJECT = "Pedido de Informações - M★BRAVO";
const MAILTO_LINK = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;

const WHATSAPP_NUMBER = '351912828182';

// --- Pricing & Customization Logic ---
const BASE_PRICES: { [key: string]: number | string } = {
    'alma cardigan': 95,
    'm★bravo cardigan': 95,
    'geometric poncho': 75,
    'cozy mesh poncho': 75,
    'mini alma cardigan': 55,
    'granny square bag': 55,
    'marea bikini set': 45,
    'luxury clutch': 35,
    'marea triangle top': 25,
    'crystalline top': 25,
    'african flower pouch': 25,
    'booksleeve': 25,
    'stella cushion': 20,
    'dragonfly bandana': 15,
    'bandana': 15,
    'dragonfly headband': 12,
    'placemats': 12,
    'bookmarks': 8,
    'daisycoasters': 4,
    'yellowcoasters': 4,
    'sunflowercoasters': 4,
    'bluecoasters': 4,
    'pinkcoasters': 4
};

const getApprovedPrice = (name: string): number | string => {
    const n = name.toLowerCase().trim().replace(/\s+/g, '');
    for (const key in BASE_PRICES) {
        const cleanKey = key.replace(/\s+/g, '');
        if (n === cleanKey || n.includes(cleanKey)) {
            return BASE_PRICES[key];
        }
    }
    return 'Sob Consulta';
};

const calculateProductRange = (name: string) => {
    const price = getApprovedPrice(name);
    if (typeof price === 'string') {
        return price;
    }
    return `${price}€`;
};

const cleanEditorialText = (text: string): string[] => {
    if (!text) return [];
    return text.split('\n')
        .map(line => {
            let cleared = line.trim();
            // Remove leading hyphens, bullets, or asterisks
            cleared = cleared.replace(/^[-*•●]\s*/, '');
            // Remove prefixes like "Material: ", "Care: ", etc.
            cleared = cleared.replace(/^(Material|Care|De manutenção|Opção Leve|Opção Cozy|Opção \d+|Opção \d):\s*/i, '');
            return cleared.trim();
        })
        .filter(Boolean);
};

interface MaterialOption {
    title?: string;
    description: string;
}

const parseMaterials = (text: string): MaterialOption[] => {
    if (!text) return [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    if (lines.length === 1 && !lines[0].startsWith('-') && !lines[0].startsWith('•') && !lines[0].startsWith('*')) {
        return [{ description: lines[0] }];
    }
    
    return lines.map(line => {
        let cleanLine = line.replace(/^[-*•●]\s*/, '').trim();
        
        // Match e.g. "Opção Leve: 100% algodão" or "Opção 2: 50% algodão / 50% lã" or "Material: 100% algodão"
        const matchColon = cleanLine.match(/^(Opção\s+[0-9a-zA-Záéíóúâêîôûàèìòùãõç]+|Opção\s+Leve|Opção\s+Cozy|Composição|Material)\s*:\s*(.*)$/i);
        if (matchColon) {
            return {
                title: matchColon[1],
                description: matchColon[2]
            };
        }
        
        // Match e.g. "Opção Leve (100% Algodão)" or "Opção 1: 100% algodão (opção leve)"
        return {
            description: cleanLine
        };
    });
};

const SHOP_CATEGORIES = [
  {
    id: 'home',
    name: 'Home',
    items: 'Coasters, Placemats, Bookmarks',
    img: 'https://i.ibb.co/j9LHyxq6/Firefly-Gemini-Flash-Imagem-com-ambiente-cosy-tema-handmade-crochet-usar-o-logo-em-label-de-cartao.png',
    products: [
      { 
        id: 'h1', 
        name: 'Daisy Coasters', 
        price: calculateProductRange('Daisy Coasters'), 
        img: 'https://i.ibb.co/KcDFpYzx/mockup-coosters-luxury-1.png',
        images: [
          'https://i.ibb.co/KcDFpYzx/mockup-coosters-luxury-1.png',
          'https://i.ibb.co/xKKjH57r/IMG-20260430-WA0002.jpg',
          'https://i.ibb.co/ZRYgJ5m6/IMG-2121.jpg',
          'https://i.ibb.co/Dg9QgZ0H/IMG-2126.jpg'
        ],
        description: "Bases em crochet inspiradas na delicadeza das margaridas e nos tons suaves da natureza. Um conjunto handmade pensado para trazer um toque cozy e acolhedor ao teu espaço.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada\n- Secar ao ar"
      },
      { 
        id: 'h1b', 
        name: 'Yellow Coasters', 
        price: calculateProductRange('Yellow Coasters'), 
        img: 'https://i.ibb.co/KzFkDncp/3-DD02495-9694-47-E5-92-DC-6-EAB62-CE957-B.png',
        images: [
          'https://i.ibb.co/KzFkDncp/3-DD02495-9694-47-E5-92-DC-6-EAB62-CE957-B.png',
          'https://i.ibb.co/gZJhbCD6/IMG-2121.jpg'
        ],
        description: "Bases em crochet com um design floral delicado, pensadas para trazer um toque cozy e elegante ao teu espaço. Disponíveis em várias cores, mantendo sempre as pétalas brancas para um acabamento suave e delicado.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada\n- Secar ao ar"
      },
      { 
        id: 'h1c', 
        name: 'Sunflower Coasters', 
        price: calculateProductRange('Sunflower Coasters'), 
        img: 'https://i.ibb.co/XfkbNYF8/Sunflower-coasters-1.png',
        images: [
          'https://i.ibb.co/XfkbNYF8/Sunflower-coasters-1.png',
          'https://i.ibb.co/gMD6gQR4/Sunflower-coasters-3.jpg',
          'https://i.ibb.co/SX1R4pSF/Sunflower-coasters-2.jpg',
          'https://i.ibb.co/QvHhvxvf/Sunflower-coasters.jpg'
        ],
        description: "Bases em crochet inspiradas na beleza dos girassóis e nos seus tons quentes e acolhedores. Um conjunto handmade pensado para trazer um toque cozy e luminoso ao teu espaço.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada\n- Secar ao ar"
      },
      { 
        id: 'h1d', 
        name: 'Blue Coasters', 
        price: calculateProductRange('Blue Coasters'), 
        img: 'https://i.ibb.co/Rd5hYDv/Blue-coasters.png',
        images: [
          'https://i.ibb.co/Rd5hYDv/Blue-coasters.png',
          'https://i.ibb.co/HL6sMgBq/Blue-coasters-3.jpg',
          'https://i.ibb.co/d437sBsp/Blue-coasters-4.jpg',
          'https://i.ibb.co/fd0RgYCH/Blue-coasters-2.png'
        ],
        description: "Bases em crochet com um design floral delicado, pensadas para trazer um toque cozy e elegante ao teu espaço. Disponíveis em várias cores, mantendo sempre as pétalas brancas para um acabamento suave e delicado.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada\n- Secar ao ar"
      },
      { 
        id: 'h1e', 
        name: 'Pink Coasters', 
        price: calculateProductRange('Pink Coasters'), 
        img: 'https://i.ibb.co/pD6r9Tp/Pink-coasters.png',
        images: [
          'https://i.ibb.co/pD6r9Tp/Pink-coasters.png',
          'https://i.ibb.co/gL02D64Q/Pink-coasters-2.jpg',
          'https://i.ibb.co/PvqVqpty/Pink-coasters-3.jpg',
          'https://i.ibb.co/kVSX4zy1/Pink-coasters-1.jpg'
        ],
        description: "Bases em crochet com um design floral delicado, pensadas para trazer um toque cozy e elegante ao teu espaço. Disponíveis em várias cores, mantendo sempre as pétalas brancas para um acabamento suave e delicado.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada\n- Secar ao ar"
      },
      { 
        id: 'h2', name: 'Placemats', price: calculateProductRange('Placemats'), img: 'https://i.ibb.co/HThTzmLQ/home-placemats-1.png',
        description: "Placemats em crochet feitos à mão, criados para dar um toque cozy e especial à tua mesa. Perfeitos para decorar, proteger superfícies e tornar qualquer refeição ainda mais acolhedora. Disponíveis em diferentes formatos, designs e combinações de cores.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar ao ar"
      },
      { 
        id: 'h2b', 
        name: 'Stella Cushion', 
        price: calculateProductRange('Stella Cushion'), 
        img: 'https://i.ibb.co/zTH1WKcL/Stella-Cushion-1.jpg',
        images: [
          'https://i.ibb.co/zTH1WKcL/Stella-Cushion-1.jpg',
          'https://i.ibb.co/Kpn3md04/Stella-Cushion-5.jpg'
        ],
        description: "Almofada decorativa em forma de estrela, feita à mão em crochet para dar um toque delicado e cozy a qualquer espaço. Perfeita para decorar camas, sofás, cadeiras, quartos infantis ou qualquer cantinho especial. Disponível em várias cores para combinar com diferentes estilos de decoração.",
        material: "- Material: 100% poliéster (Fio macio e estruturado, ideal para peças decorativas)",
        care: "- Limpeza delicada à mão\n- Secar ao ar em superfície plana\n- Evitar torcer a peça"
      },
      { 
        id: 'h4', name: 'Bookmarks', price: calculateProductRange('Bookmarks'), img: 'https://i.ibb.co/yFK9DMX3/home-bookmarks-1.png',
        description: "Bookmark em crochet feito à mão, criado para dar um toque delicado e especial às tuas leituras. Perfeito para marcar páginas de forma bonita e única, sendo também uma opção querida para oferecer a qualquer book lover. Disponível em diferentes designs e combinações de cores.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar ao ar"
      }
    ]
  },
  {
    id: 'bags',
    name: 'Bags',
    items: 'African Flower Pouch, Booksleeves, Granny Square',
    img: 'https://i.ibb.co/L78HHMd/bags-pouches-1.png',
    products: [
      { 
        id: 'b1', 
        name: 'African Flower Pouch', 
        price: calculateProductRange('African Flower Pouch'), 
        img: 'https://i.ibb.co/PvjVXHPV/pouch-luxury-1.png',
        images: [
          'https://i.ibb.co/PvjVXHPV/pouch-luxury-1.png',
          'https://i.ibb.co/VW1mwZSt/Pouch-1.png',
          'https://i.ibb.co/rfKT2cfR/Pouch-3.png',
          'https://i.ibb.co/gLj3Zw8F/Pouch-4.png'
        ],
        description: "Pouch em crochet com padrão African Flower, cuidadosamente feito à mão e forrado no interior para maior estrutura e proteção. Finalizado com fecho, é perfeito para guardar os teus essenciais do dia a dia com um toque cozy e handmade.",
        material: "- Material: 100% algodão\n- Detalhe: Forro interior em tecido",
        care: "- Lavagem delicada à mão\n- Secar ao ar\n- Evitar máquina de secar",
        dimensions: "25 cm (largura) × 14 cm (altura)"
      },
      { 
        id: 'b2', name: 'Booksleeve', price: calculateProductRange('Booksleeve'), img: 'https://i.ibb.co/Jj1WHWs0/bags-booksleeve-1.png',
        description: "Book sleeve em crochet feito à mão, criado para proteger os teus livros com um toque cozy e especial. Ideal para levar na mala e proteger os livros de riscos e desgaste diário. Disponível em diferentes combinações de cores e opção de forro interior.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar ao ar"
      },
      { 
        id: 'b3', name: 'Granny Square Bag', price: calculateProductRange('Granny Square Bag'), img: 'https://i.ibb.co/FvZydN0/colecao-Granny-Square-BAGS-1.png',
        description: "Granny square bag em crochet feita à mão, perfeita para dar um toque handmade e especial aos teus looks do dia a dia. Ideal para transportar os teus essenciais, combinando conforto, estilo e um detalhe cozy único. Disponível em diferentes combinações de cores, designs e acabamentos.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar ao ar em superfície plana"
      }
    ]
  },
  {
    id: 'vestuario',
    name: 'Vestuário',
    items: 'Marea Bikini Set, Poncho, Bandanas, Dragonfly Headband',
    img: 'https://i.ibb.co/844dLBLB/mockup-cardigan.png',
    products: [
      { 
        id: 'v1', 
        name: 'Marea Bikini Set', 
        price: calculateProductRange('Marea Bikini Set'), 
        img: 'https://i.ibb.co/2QHMzGT/Bikini-CAPA.png',
        images: [
          'https://i.ibb.co/2QHMzGT/Bikini-CAPA.png',
          'https://i.ibb.co/hFchC6S9/BIKINI-FRENTE.png',
          'https://i.ibb.co/bgqhJ6tt/BIKINI-COSTAS.png'
        ],
        description: "Biquíni em crochet feito à mão, pensado para os dias de verão e momentos à beira-mar. O Marea Bikini combina um design de riscas delicadas com um ajuste confortável, criando um look handmade, minimalista e cozy. Disponível em várias combinações de cores.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar ao ar",
        details: "- Disponível em XS, S, M e L (Caso tenha dúvidas sobre o tamanho ideal, pode entrar em contacto)"
      },
      { 
        id: 'v1_dup', 
        name: 'Marea Triangle Top', 
        price: calculateProductRange('Marea Triangle Top'), 
        img: 'https://i.ibb.co/B2d99LhQ/BIKINI.png',
        images: [
          'https://i.ibb.co/B2d99LhQ/BIKINI.png',
          'https://i.ibb.co/TqF1FrCS/Bikini-top.png'
        ],
        sizes: ['XS', 'S', 'M', 'L'],
        description: "Top de biquíni em crochet feito à mão, com design triangular clássico e fitas ajustáveis para maior conforto. O Marea Triangle Top foi pensado para combinar conforto e um look delicado de verão.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar ao ar",
        details: "- Disponível em XS, S, M e L (Caso tenha dúvidas sobre o tamanho ideal, pode entrar em contacto)"
      },
      { 
        id: 'v2', name: 'Geometric Poncho', price: calculateProductRange('Geometric Poncho'), img: 'https://i.ibb.co/Zpd35Tt7/colecao-Cardigra-1.png',
        material: "Este Geometric Poncho é produzido em 100% Algodão Egípcio Safran. A suavidade deste fio nobre respeita a sensibilidade da pele.",
        care: "Lavar à mão com sabão neutro. Secar à sombra."
      },
      { 
        id: 'v2b', name: 'Cozy Mesh Poncho', price: calculateProductRange('Cozy Mesh Poncho'), img: 'https://i.ibb.co/0p2g0BJt/Poncho.png',
        images: [
          'https://i.ibb.co/0p2g0BJt/Poncho.png',
          'https://i.ibb.co/844dLBLB/mockup-cardigan.png'
        ],
        description: "Poncho em crochet leve e delicado, feito à mão com um design de malha aberta para um look effortless e cozy. Perfeito para sobrepor a tops, vestidos ou biquínis, criando um toque elegante e descontraído ao outfit. Disponível em várias cores.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar ao ar\n- Evitar máquina de secar"
      },
      { 
        id: 'v3', 
        name: 'Dragonfly Bandana', 
        price: calculateProductRange('Dragonfly Bandana'), 
        img: 'https://i.ibb.co/nNbwppxF/Bandana-LIBELINHA-capa.png',
        images: [
          'https://i.ibb.co/nNbwppxF/Bandana-LIBELINHA-capa.png',
          'https://i.ibb.co/ycdCNGhn/Bandanas-5.png',
          'https://i.ibb.co/ycdJCtrC/Bandanas-4.png',
          'https://i.ibb.co/M5hJdHrK/Dragonfly-Bandana-Libelinha-1.png',
          'https://i.ibb.co/Gf5WJzvk/Dragonfly-Bandana-Libelinha-2.png',
          'https://i.ibb.co/HDzn9x8m/Dragonfly-Bandana-Libelinha-3.png'
        ],
        description: "Bandana em crochet com delicado padrão de libelinhas, feita à mão para dar um toque cozy e especial ao teu look. Leve, confortável e versátil, perfeita para usar no dia a dia. Disponível em várias cores e em duas opções de material.",
        material: "- Opção 1: 100% algodão (opção leve)\n- Opção 2: 50% algodão, 50% lã (opção mais cozy)",
        care: "- Lavagem delicada\n- Secar ao ar"
      },
      { 
        id: 'v3b', 
        name: 'Bandana', 
        price: calculateProductRange('Bandana'), 
        img: 'https://i.ibb.co/PZHFmt0D/Bandanas-2.png',
        images: [
          'https://i.ibb.co/PZHFmt0D/Bandanas-2.png',
          'https://i.ibb.co/KxvZDqZY/Bandanas-6.png',
          'https://i.ibb.co/JjHRR7vq/Bandanas-3.png',
          'https://i.ibb.co/HfSJtngW/Bandanas-1.png'
        ],
        material: "Esta Bandana é produzida em 100% Algodão Egípcio Safran. A suavidade deste fio nobre respeita a sensibilidade da pele.",
        care: "Lavar à mão com sabão neutro. Secar à sombra."
      },
      { 
        id: 'h3', 
        name: 'Dragonfly Headband', 
        price: calculateProductRange('Dragonfly Headband'), 
        img: 'https://i.ibb.co/BHMDJZGM/Dragonfly-Headband.png',
        images: [
          'https://i.ibb.co/BHMDJZGM/Dragonfly-Headband.png',
          'https://i.ibb.co/9Hj06pQ7/Dragonfly-Headband-2.png',
          'https://i.ibb.co/8DTVnTcH/Dragonfly-Headband-1.png',
          'https://i.ibb.co/sdBrQ9sx/Headband-Dragonfly-2.png',
          'https://i.ibb.co/LX181Qts/Headband-Dragonfly-4.png',
          'https://i.ibb.co/zWwqkHxZ/Dragonfly-Headband-Costas.png'
        ],
        description: "Headband em crochet com delicado padrão de libelinhas, feita à mão para um toque leve e especial no dia a dia. Confortável, versátil e perfeita para complementar qualquer look com um detalhe handmade e cozy. Disponível em várias cores.",
        material: "- Material: 100% algodão",
        care: "- Lavagem delicada à mão\n- Secar ao ar\n- Evitar máquina de secar"
      }
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    items: 'Cardigan, Top, Clutch, Peças Únicas',
    img: 'https://i.ibb.co/hxvcw25g/Cardigan-CAPA.png',
    products: [
      { 
        id: 'b1b', 
        name: 'Alma Cardigan', 
        price: calculateProductRange('Alma Cardigan'), 
        img: 'https://i.ibb.co/4qjnQph/Cardigan-CAPA.png',
        description: "Cardigan em crochet feito à mão com granny squares clássicos e um design cozy e intemporal. Uma peça confortável e delicada, perfeita para dias frescos de verão, outono ou para criar um look mais acolhedor e effortless. Disponível em várias combinações de cores e materiais.",
        material: "- Opção 1: 100% algodão (Leve, respirável e ideal para dias mais amenos ou meia-estação)\n- Opção 2: 50% algodão / 50% lã (Mais quente, macio e aconchegante, ideal para dias mais frios)",
        care: "- Lavagem delicada à mão\n- Secar ao ar em superfície plana\n- Evitar torcer a peça",
        details: "- Modelo de manga comprida\n- Fecho em laço frontal"
      },
      { 
        id: 'b1c', 
        name: 'Mini Alma Cardigan', 
        price: calculateProductRange('Mini Alma Cardigan'), 
        img: 'https://i.ibb.co/8nQtzsbY/Mini-Alma-Cardigan-1.jpg',
        images: [
          'https://i.ibb.co/8nQtzsbY/Mini-Alma-Cardigan-1.jpg',
          'https://i.ibb.co/PzzS4Vm2/Mini-Alma-Cardigan-4.jpg',
          'https://i.ibb.co/4nXVDvLh/Mini-Alma-Cardigan-3.jpg'
        ],
        sizes: ['2 anos', '4 anos', '6 anos'],
        description: "Versão mini do Alma Cardigan, feita à mão em crochet com granny squares clássicos e um design cozy e intemporal. Pensado para os mais pequenos, combina conforto, delicadeza e um toque handmade especial. Disponível em várias combinações de cores e materiais.",
        material: "- Opção Leve: 100% algodão\n- Opção Cozy: 50% algodão, 50% lã",
        care: "- Lavagem delicada à mão\n- Secar ao ar em superfície plana\n- Evitar máquina de secar",
        details: "- Modelo de manga comprida\n- Fecho em laço frontal"
      },
      { 
        id: 'p1', name: 'M★BRAVO Cardigan', price: calculateProductRange('M★BRAVO Cardigan'), img: 'https://i.ibb.co/mrJQy5Dk/IMG-20260508-WA0003.jpg',
        material: "Este M★BRAVO Cardigan é produzido em 100% Algodão Egípcio Safran. A suavidade deste fio nobre respeita a sensibilidade da pele.",
        care: "Lavar à mão com sabão neutro. Secar à sombra."
      },
      { 
        id: 'p2', name: 'Top', price: calculateProductRange('Crystalline Top'), img: 'https://i.ibb.co/8nc4jXr3/colecao-Top-1.png',
        material: "Este Crystalline Top é produzido em 100% Algodão Egípcio Safran. A suavidade deste fio nobre respeita a sensibilidade da pele.",
        care: "Lavar à mão com sabão neutro. Secar à sombra."
      },
      { 
        id: 'p3', name: 'Luxury Clutch', price: calculateProductRange('Luxury Clutch'), img: 'https://i.ibb.co/BVjGyZK1/colecao-Clutch-1.png',
        material: "Esta Luxury Clutch é produzida em 100% Algodão. Um fio de fibra grossa que garante a estabilidade necessária.",
        care: "Lavável à máquina (40ºC). Secar na horizontal."
      },
      { 
        id: 'p4', name: 'Peça Única', price: calculateProductRange('Peça Única'), img: 'https://i.ibb.co/ZRwv4qPt/colecao-bolsa-1.png',
        material: "Esta Obra Única #01 é produzida em 100% Algodão Egípcio Safran. A suavidade deste fio nobre respeita a sensibilidade da pele.",
        care: "Lavar à mão com sabão neutro. Secar à sombra."
      }
    ]
  }
];

// Luxury Futurist Models
const PRODUCTS = [
  { 
    id: 1, 
    title: 'Aura Crystalline', 
    desc: 'Um volume arquitetónico que desafia a gravidade, marcado pela assinatura linear de Carolina. Cada ponto é uma coordenada num mapa de luxo sensorial.',
    img: 'https://images.unsplash.com/photo-1614633833026-07205c9d640f?auto=format&fit=crop&q=80&w=800', 
    price: '€285' 
  },
  { 
    id: 2, 
    title: 'Nebula Silk', 
    desc: 'A fluidez da malha encontra o design de impacto. Uma peça que carrega o DNA autoral da marca em texturas que parecem esculpidas pela luz.',
    img: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800', 
    price: '€310' 
  },
  { 
    id: 3, 
    title: 'Vector Nomad', 
    desc: 'O equilíbrio perfeito entre o saber-fazer manual e o utilitarismo futurista. Uma declaração de exclusividade gravada em cada entrelaçar de fio.',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800', 
    price: '€245' 
  },
];

// --- Components ---

const NoiseOverlay = () => <div className="noise-overlay" />;

const LogoIcon = ({ className = "h-6", light = false }: { className?: string; light?: boolean }) => {
  const color = light ? '#FAF9F6' : '#243119';
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none">
      <path 
        d="M60 0 L78 38 L118 42 L90 71 L96 111 L60 93 L24 111 L30 71 L2 42 L42 38 Z" 
        fill={color} 
      />
      <text 
        x="60" 
        y="72" 
        textAnchor="middle" 
        fill={light ? '#243119' : '#FAF9F6'} 
        style={{ fontSize: '32px', fontFamily: 'Playfair Display, serif', fontWeight: 'bold' }}
      >
        M
      </text>
    </svg>
  );
};

const Logo = ({ className = "h-12", light = false }: { className?: string, light?: boolean }) => {
  const primaryColor = light ? '#C5A059' : '#243119'; // Gold for dark backgrounds, New Brand Green for light
  
  return (
    <div className={`${className} flex items-center justify-center transition-svg`}>
      <svg 
        viewBox="0 0 500 430" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <path id="handmadePath" d="M 135 80 A 380 380 0 0 1 365 80" fill="none" />
        </defs>

        {/* HANDMADE On Curved Path */}
        <text 
          fill={primaryColor} 
          style={{ fontSize: '12px', letterSpacing: '0.85em', fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}
        >
          <textPath href="#handmadePath" startOffset="50%" textAnchor="middle">
            HANDMADE
          </textPath>
        </text>

        {/* STAR WITH M */}
        <g transform="translate(250, 135)">
          <path 
            d="M0 -45 L13 -16 L44 -13 L22 8 L27 38 L0 24 L-27 38 L-22 8 L-44 -13 L-13 -16 Z" 
            fill={primaryColor} 
          />
          <text 
            y="9" 
            textAnchor="middle" 
            fill={light ? '#243119' : '#FAF9F6'} 
            style={{ fontSize: '24px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold' }}
          >
            M
          </text>
        </g>

        {/* BRAVO */}
        <text 
          x="50%" 
          y="310" 
          textAnchor="middle" 
          fill={primaryColor} 
          style={{ fontSize: '105px', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.04em', fontWeight: 400 }}
        >
          BRAVO
        </text>

        {/* BY CAROLINA with Lines */}
        <g transform="translate(250, 395)">
          <text 
            x="0" 
            y="0" 
            textAnchor="middle" 
            fill={primaryColor} 
            style={{ fontSize: '12px', letterSpacing: '0.6em', fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}
          >
            BY CAROLINA
          </text>
          
          {/* Decorative Lines */}
          <line x1="-135" y1="-4" x2="-90" y2="-4" stroke={primaryColor} strokeWidth="1.2" opacity={light ? "0.8" : "0.5"} />
          <line x1="90" y1="-4" x2="135" y2="-4" stroke={primaryColor} strokeWidth="1.2" opacity={light ? "0.8" : "0.5"} />
        </g>
      </svg>
    </div>
  );
};

const LoadingScreen = ({ onComplete }: { onComplete: () => void; key?: string }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-forest flex flex-col items-center justify-center overflow-hidden"
      exit={{ y: '-100%', transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <Logo light className="h-32 md:h-48" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-12 text-cream/30 font-serif italic tracking-[0.3em] text-xs uppercase"
      >
        Peças feitas com tempo, amor e memória.
      </motion.p>
      
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[800px] h-[800px] border border-cream rounded-full pointer-events-none"
      />
    </motion.div>
  );
};

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDarkBg, setIsDarkBg] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const sections = document.querySelectorAll('section, [data-background]');
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -95% 0px', // Target the top portion of the screen
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const bgType = entry.target.getAttribute('data-background');
                    if (bgType) {
                        setIsDarkBg(bgType === 'dark');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Totally transparent as requested
    const navBg = 'bg-transparent';
    const textColor = isDarkBg ? 'text-cream' : 'text-forest';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-1000 ${isScrolled ? 'py-4' : 'py-8'} ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo with entry animation and Smart Invert */}
        <motion.a 
            href="#" 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
        >
          <Logo light={isDarkBg} className="h-10 md:h-12" />
        </motion.a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link, i) => {
            const isHighlight = link.name === 'Contactos';
            return (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
                className={`text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-1000 relative group ${textColor} ${
                  isHighlight 
                    ? `px-6 py-2 border rounded-full ${
                        isDarkBg 
                          ? 'border-cream/30 hover:bg-cream hover:text-forest' 
                          : 'border-forest/30 hover:bg-forest hover:text-cream'
                      }` 
                    : 'hover:opacity-60'
                }`}
              >
                {link.name}
                {!isHighlight && (
                  <div className={`absolute -bottom-1 left-0 w-0 h-[1px] ${isDarkBg ? 'bg-cream' : 'bg-forest'} group-hover:w-full transition-all duration-1000 opacity-40`} />
                )}
              </motion.a>
            );
          })}
        </div>

        {/* Mobile Toggle */}
        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`md:hidden transition-colors duration-1000 ${textColor}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu Overlay - Refined with Forest theme */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[60] bg-forest/95 flex flex-col items-center justify-center gap-12"
          >
             <button 
                className="absolute top-8 right-6 text-cream"
                onClick={() => setMobileMenuOpen(false)}
             >
                <X size={32} />
             </button>
             {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setMobileMenuOpen(false)}
                className="text-5xl font-serif text-cream hover:text-brand-green-light hover:italic transition-all duration-500"
              >
                {link.name}
              </motion.a>
            ))}
                <div className="mt-12 flex gap-10">
                    <a href="https://www.instagram.com/mbravo.handmade/" target="_blank" rel="noopener noreferrer">
                        <Instagram className="text-cream/30 hover:text-cream transition-colors" size={24} />
                    </a>
                    <a href={MAILTO_LINK}>
                        <Mail className="text-cream/30 hover:text-cream transition-colors" size={24} />
                    </a>
                </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
    const { scrollY } = useScroll();
    // Parallax background movement: background slowly slides up or down on scroll
    const bgY = useTransform(scrollY, [0, 800], [0, 150]);
    const bgScale = useTransform(scrollY, [0, 800], [1.02, 1.12]);
    const logoScale = useTransform(scrollY, [0, 500], [1, 0.92]);
    const logoOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const contentY = useTransform(scrollY, [0, 500], [0, 60]);
    const scrollYTransform = useTransform(scrollY, [0, 400], [0, -50]);

    // Words for the cinematic stagger fade-in
    const titleWords = ["Cada", "ponto", "guarda", "uma", "memória."];

    return (
        <section data-background="dark" className="relative z-20 h-screen flex flex-col items-center justify-center bg-forest overflow-hidden text-cream">
            {/* Ambient Overlay Image with Parallax & Slow Animation - Revealing more texture and matter */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <motion.div 
                    style={{ y: bgY, scale: bgScale, backgroundImage: `url(${heroBg})` }}
                    animate={{ 
                        opacity: [0.90, 0.96, 0.90],
                    }}
                    transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cover bg-center brightness-[0.46] contrast-[1.40] saturate-[1.05]"
                />
                
                {/* Golden ambient studio lighting leak/flare overlay, adding richness and luxury with organic movement */}
                <motion.div 
                    animate={{ 
                        opacity: [0.75, 0.95, 0.75],
                        scale: [1, 1.04, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(197,160,89,0.24)_0%,transparent_60%)] z-10 pointer-events-none mix-blend-color-dodge origin-top-right"
                />
                <motion.div 
                    animate={{ 
                        opacity: [0.50, 0.72, 0.50],
                        x: [-20, 20, -20],
                        y: [-10, 10, -10]
                    }}
                    transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_25%_65%,rgba(197,160,89,0.15)_0%,transparent_50%)] z-10 pointer-events-none mix-blend-overlay"
                />
 
                {/* Subtle volumetric ray of light sweeping slowly like workshop window sun shafts */}
                <motion.div 
                    animate={{ 
                        opacity: [0.38, 0.58, 0.38],
                        rotate: [-1, 1, -1]
                    }}
                    transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_0%,rgba(255,251,240,0.15)_0%,transparent_45%)] z-10 pointer-events-none mix-blend-screen origin-top"
                />
 
                {/* Handmade texture layer: Premium subtle cellulose/organic film grain */}
                <div 
                    className="absolute inset-0 pointer-events-none z-10 opacity-[0.075] mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />
                
                {/* Soft bloom backglow centered right behind the signature to separate and spotlight the brand from the background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.22)_0%,rgba(197,160,89,0.05)_45%,transparent_70%)] z-10 pointer-events-none mix-blend-screen" />
 
                {/* Radial gradient vignette and linear gradients for ultimate depth and blend - bottom is completely transparent to flow into page below */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#243119_90%)] z-10 pointer-events-none opacity-50 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#243119]/40 via-transparent to-transparent z-10 pointer-events-none" />
            </div>
 
            {/* Cinematic Centered Editorial Content */}
            <motion.div 
                style={{ scale: logoScale, y: contentY }}
                className="relative z-20 flex flex-col items-center px-6 text-center select-none"
            >
                {/* Scroll-fading content wrapper to keep the primary brand elements clean while scroll progresses */}
                <motion.div
                    style={{ opacity: logoOpacity }}
                    className="flex flex-col items-center"
                >
                    {/* Official Logo M★Bravo - An elegant editorial brand signature, emerging naturally with majestic scale and supreme presence */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, filter: "blur(12px)", y: -15 }}
                        animate={{ scale: 1.0, opacity: 1.0, filter: "blur(0px)", y: 0 }}
                        transition={{ 
                            duration: 2.2,
                            delay: 0.5,
                            ease: [0.16, 1, 0.3, 1] 
                        }}
                        whileHover={{ opacity: 1, scale: 1.008, transition: { duration: 1.0 } }}
                        style={{ 
                            filter: "drop-shadow(0 24px 54px rgba(18,26,13,0.95)) drop-shadow(0 4px 20px rgba(197,160,89,0.18))"
                        }}
                        className="h-[8.5rem] sm:h-[11rem] md:h-[13.5rem] lg:h-[16.5rem] xl:h-[20rem] mb-1 sm:mb-1.5 md:mb-2 lg:mb-2.5 -mt-3 md:-mt-5 origin-center select-none"
                    >
                        <Logo light className="h-full" />
                    </motion.div>
 
                    {/* Headline: "Cada ponto guarda uma memória." - Refined to a luxury editorial masterwork with staggered word reveal following the logo introduction */}
                    <h1
                        style={{ 
                            fontFamily: "'Cormorant Garamond', serif",
                            textShadow: "0 15px 40px rgba(18, 26, 13, 0.95), 0 4px 12px rgba(18, 26, 13, 0.7)",
                            letterSpacing: "-0.015em"
                        }}
                        className="italic text-2xl sm:text-3xl md:text-[2.5rem] lg:text-[2.85rem] leading-[1.15] md:leading-[1.18] font-normal text-[#FFFDF9] mb-0 antialiased selection:bg-[#C5A059]/30 flex flex-wrap justify-center gap-x-[0.25em] md:gap-x-[0.28em] max-w-2xl"
                    >
                        {titleWords.map((word, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{
                                    delay: 1.2 + i * 0.15,
                                    duration: 2.2,
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                                className="inline-block text-[#FFFDF9]"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>
 
                    {/* Subheadline: "Criado à mão, com tempo, amor e memórias." - Soft, quiet luxury whispering text layout */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.58, y: 0 }}
                        transition={{ delay: 2.4, duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            textShadow: "0 4px 12px rgba(18, 26, 13, 0.25)",
                            letterSpacing: "0.024em"
                        }}
                        className="italic text-xs sm:text-sm md:text-base font-light text-[#D4C3A3] max-w-[260px] sm:max-w-xs md:max-w-sm mx-auto leading-relaxed mb-0 antialiased"
                    >
                        Criado à mão, com tempo, amor e memórias.
                    </motion.p>
                </motion.div>

                {/* Zero-height anchor for the thread container so it stays exactly below the subtitle on all screens with perfect vertical composition */}
                <div className="relative w-full h-0 mt-6 md:mt-8 flex justify-center overflow-visible">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ 
                            duration: 1.5,
                            delay: 2.6
                        }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-[450px] flex flex-col items-center justify-start pointer-events-none select-none z-30 overflow-visible"
                    >
                        <div className="relative w-full h-[450px] flex items-start justify-center overflow-visible">
                            <svg 
                                width="320" 
                                height="450" 
                                viewBox="0 0 320 450" 
                                fill="none" 
                                className="select-none pointer-events-none overflow-visible"
                            >
                                <defs>
                                    {/* High-quality warm golden daylight gradient with sunset vibe fading entirely at bottom */}
                                    <linearGradient id="warmSunlight" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#FFF4D6" stopOpacity="0.95" />
                                        <stop offset="40%" stopColor="#C5A059" stopOpacity="0.9" />
                                        <stop offset="85%" stopColor="#D4B26F" stopOpacity="0.85" />
                                        <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                                    </linearGradient>
 
                                    {/* Fading transparent gradient for the underlying thread shadow to integrate flawlessly on the cream block */}
                                    <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#182414" stopOpacity="0.32" />
                                        <stop offset="85%" stopColor="#182414" stopOpacity="0.22" />
                                        <stop offset="100%" stopColor="#182414" stopOpacity="0" />
                                    </linearGradient>
 
                                    {/* Transparent fading gradient for the core metallic thread */}
                                    <linearGradient id="solidThreadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#C5A059" stopOpacity="0.85" />
                                        <stop offset="85%" stopColor="#C5A059" stopOpacity="0.75" />
                                        <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                                    </linearGradient>
 
                                    {/* Transparent fading gradient for the shiny specular highlight */}
                                    <linearGradient id="specularGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                                        <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.75" />
                                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                                    </linearGradient>
 
                                    {/* Warm, soft focus sunbeam blur/glow for active light particles */}
                                    <filter id="subtleThreadGlow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="1.1" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* 1. Underlying shadow/glow depth to give dimensional physical presence to the fine thread */}
                                <motion.path 
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: [0, 0.22, 0.16, 0.22],
                                        d: [
                                            "M 160 40 C 160 70, 185 90, 180 120 C 175 150, 135 165, 145 200 C 155 235, 180 260, 165 300 C 150 335, 160 345, 160 383 C 155 415, 175 430, 160 450",
                                            "M 160 40 C 158 68, 181 87, 176 117 C 171 147, 139 167, 149 197 C 159 232, 176 257, 161 296 C 146 335, 159 345, 159 383 C 154 412, 171 427, 160 450",
                                            "M 160 40 C 162 72, 189 93, 184 123 C 179 153, 131 163, 141 203 C 151 238, 184 263, 169 304 C 154 335, 161 345, 161 383 C 151 418, 179 433, 160 450",
                                            "M 160 40 C 160 70, 185 90, 180 120 C 175 150, 135 165, 145 200 C 155 235, 180 260, 165 300 C 150 335, 160 345, 160 383 C 155 415, 175 430, 160 450"
                                        ]
                                    }}
                                    transition={{
                                        opacity: { delay: 3.4, times: [0, 0.2, 0.7, 1], duration: 18, repeat: Infinity, repeatType: "reverse" },
                                        d: { duration: 18, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    stroke="url(#shadowGradient)" 
                                    strokeWidth="1.2" 
                                    strokeLinecap="round"
                                    className="blur-[0.7px]"
                                />

                                {/* 2. Core extremely thin handcrafted thread */}
                                <motion.path 
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: 0.40,
                                        d: [
                                            "M 160 40 C 160 70, 185 90, 180 120 C 175 150, 135 165, 145 200 C 155 235, 180 260, 165 300 C 150 335, 160 345, 160 383 C 155 415, 175 430, 160 450",
                                            "M 160 40 C 158 68, 181 87, 176 117 C 171 147, 139 167, 149 197 C 159 232, 176 257, 161 296 C 146 335, 159 345, 159 383 C 154 412, 171 427, 160 450",
                                            "M 160 40 C 162 72, 189 93, 184 123 C 179 153, 131 163, 141 203 C 151 238, 184 263, 169 304 C 154 335, 161 345, 161 383 C 151 418, 179 433, 160 450",
                                            "M 160 40 C 160 70, 185 90, 180 120 C 175 150, 135 165, 145 200 C 155 235, 180 260, 165 300 C 150 335, 160 345, 160 383 C 155 415, 175 430, 160 450"
                                        ]
                                    }}
                                    transition={{
                                        opacity: { delay: 3.4, duration: 2.5 },
                                        d: { duration: 18, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    stroke="url(#solidThreadGradient)" 
                                    strokeWidth="0.5" 
                                    strokeLinecap="round"
                                />

                                {/* 3. Soft warm sunlight catching the thread, breathing gently */}
                                <motion.path 
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: [0, 0.70, 0.45, 0.70],
                                        d: [
                                            "M 160 40 C 160 70, 185 90, 180 120 C 175 150, 135 165, 145 200 C 155 235, 180 260, 165 300 C 150 335, 160 345, 160 383 C 155 415, 175 430, 160 450",
                                            "M 160 40 C 158 68, 181 87, 176 117 C 171 147, 139 167, 149 197 C 159 232, 176 257, 161 296 C 146 335, 159 345, 159 383 C 154 412, 171 427, 160 450",
                                            "M 160 40 C 162 72, 189 93, 184 123 C 179 153, 131 163, 141 203 C 151 238, 184 263, 169 304 C 154 335, 161 345, 161 383 C 151 418, 179 433, 160 450",
                                            "M 160 40 C 160 70, 185 90, 180 120 C 175 150, 135 165, 145 200 C 155 235, 180 260, 165 300 C 150 335, 160 345, 160 383 C 155 415, 175 430, 160 450"
                                        ]
                                    }}
                                    transition={{
                                        opacity: { delay: 3.6, times: [0, 0.35, 0.75, 1], duration: 14, repeat: Infinity, repeatType: "reverse" },
                                        d: { duration: 18, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    stroke="url(#warmSunlight)" 
                                    strokeWidth="0.8" 
                                    strokeLinecap="round"
                                    filter="url(#subtleThreadGlow)"
                                />

                                {/* 4. Ultra-thin glowing specular highlight catching natural afternoon glare */}
                                <motion.path 
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: [0, 0.85, 0.50, 0.85],
                                        d: [
                                            "M 160 40 C 160 70, 185 90, 180 120 C 175 150, 135 165, 145 200 C 155 235, 180 260, 165 300 C 150 335, 160 345, 160 383 C 155 415, 175 430, 160 450",
                                            "M 160 40 C 158 68, 181 87, 176 117 C 171 147, 139 167, 149 197 C 159 232, 176 257, 161 296 C 146 335, 159 345, 159 383 C 154 412, 171 427, 160 450",
                                            "M 160 40 C 162 72, 189 93, 184 123 C 179 153, 131 163, 141 203 C 151 238, 184 263, 169 304 C 154 335, 161 345, 161 383 C 151 418, 179 433, 160 450",
                                            "M 160 40 C 160 70, 185 90, 180 120 C 175 150, 135 165, 145 200 C 155 235, 180 260, 165 300 C 150 335, 160 345, 160 383 C 155 415, 175 430, 160 450"
                                        ]
                                    }}
                                    transition={{
                                        opacity: { delay: 3.6, times: [0, 0.35, 0.75, 1], duration: 11, repeat: Infinity, repeatType: "reverse" },
                                        d: { duration: 18, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    stroke="url(#specularGradient)" 
                                    strokeWidth="0.25" 
                                    strokeLinecap="round"
                                />

                                {/* Star Group centered exactly around its bottom indent (0, 0), and positioned perfectly at the start of the thread (160, 40) with zero visual gaps */}
                                <motion.g 
                                    initial={{ opacity: 0, scale: 0.73, y: 55, x: 160 }}
                                    animate={{ 
                                        opacity: [0, 0.95, 0.92, 0.95],
                                        scale: [0.73, 0.79, 0.77, 0.79],
                                        y: 40,
                                        x: 160
                                    }}
                                    transition={{
                                        opacity: {
                                            times: [0, 0.15, 0.65, 1],
                                            delay: 2.9,
                                            duration: 16,
                                            repeat: Infinity,
                                            repeatType: "reverse"
                                        },
                                        scale: {
                                            times: [0, 0.15, 0.65, 1],
                                            delay: 2.9,
                                            duration: 16,
                                            repeat: Infinity,
                                            repeatType: "reverse"
                                        },
                                        y: {
                                            delay: 2.9,
                                            duration: 2.5,
                                            ease: [0.16, 1, 0.3, 1]
                                        }
                                    }}
                                >
                                    {/* Official M★Bravo Star shape, solid gold - centered such that its bottom indent is at (0, 0) */}
                                    <path 
                                        d="M0 -23 L4.3 -13.3 L14.7 -12.3 L7.3 -5.3 L9 4.7 L0 0 L-9 4.7 L-7.3 -5.3 L-14.7 -12.3 L-4.3 -13.3 Z" 
                                        fill="#C5A059"
                                    />
 
                                    {/* Elegant Serif "M" inside the star to correspond 100% to the official brand star */}
                                    <text 
                                        x="0" 
                                        y="-6.5" 
                                        textAnchor="middle" 
                                        fill="#243119" 
                                        style={{ fontSize: '7px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold' }}
                                    >
                                        M
                                    </text>
                                </motion.g>
                            </svg>
                        </div>
                    </motion.div>
                </div>
 
            </motion.div>
 
            {/* Corner Labels (Editorial feel) */}
            <div className="absolute bottom-12 left-12 hidden lg:block z-20 pointer-events-none select-none">
                <span className="text-[9px] uppercase tracking-[0.4em] text-cream/20 [writing-mode:vertical-rl] rotate-180">ESTAB. 2025</span>
            </div>
            <div className="absolute bottom-12 right-12 hidden lg:block z-20 pointer-events-none select-none">
                <span className="text-[9px] uppercase tracking-[0.4em] text-cream/20 [writing-mode:vertical-rl]">BRAVO ARTESANATO</span>
            </div>
        </section>
    );
};

const StorySection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const xTrack = useTransform(smoothProgress, [0, 1], ["-15%", "15%"]);
    const yTrack = useTransform(smoothProgress, [0, 1], ["-20%", "30%"]);
    const opacityTrack = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.03, 0.03, 0]);

    const storyImages = [
        "https://i.ibb.co/S48hcbDp/Firefly-Gemini-Flash-Imagem-com-ambiente-cosy-tema-handmade-crochet-usar-o-logo-em-label-costirado.png",
        "https://i.ibb.co/Gvnm8pC3/organic-cotton-labels-1.png",
        "https://i.ibb.co/XktWbR4R/laser-engraved-wood-tag-1.png"
    ];

    const [currentImg, setCurrentImg] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImg(prev => (prev + 1) % storyImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section ref={containerRef} id="sobre" data-background="light" className="py-44 md:py-64 lg:py-72 px-6 sm:px-12 md:px-20 lg:px-24 bg-cream relative z-10 overflow-hidden select-none">
            {/* Elegant Large Watermark Signature in Background */}
            <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Great Vibes', cursive" }}
                className="absolute inset-0 pointer-events-none text-forest text-[32vw] leading-none whitespace-nowrap text-center flex items-center justify-center select-none"
            >
                Carolina
            </motion.div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32 items-center relative z-10">
                {/* Left Side: Elegant Portrait / Working Hands Presentation */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.96, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative lg:col-span-5"
                >
                    <div className="aspect-[4/5] overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative bg-forest/5">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={currentImg}
                                src={storyImages[currentImg]} 
                                alt="Crochet craft hands and label process by M★Bravo" 
                                initial={{ opacity: 0, scale: 1.08 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 1.8, ease: "easeInOut" }}
                                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-[1200ms] ease-out"
                            />
                        </AnimatePresence>
                        <div className="absolute inset-0 ring-1 ring-inset ring-forest/10 rounded-[2rem] md:rounded-[2.5rem]" />
                        
                        {/* Slide Indicators */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            {storyImages.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentImg(idx)}
                                    className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
                                        currentImg === idx ? 'w-8 bg-cream' : 'w-1.5 bg-cream/40 hover:bg-cream/70'
                                    }`}
                                    aria-label={`Show slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Luxurious Rotating Brand Badge */}
                    <div className="absolute -bottom-10 -right-4 md:-bottom-12 md:-right-12 w-36 h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 hidden sm:flex items-center justify-center bg-forest rounded-full p-1 border-4 border-cream shadow-[0_25px_60px_rgba(36,49,25,0.25)] z-20 overflow-hidden group">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full relative flex items-center justify-center"
                        >
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                <path
                                    id="circlePathBadge"
                                    d="M 50, 50 m -36, 0 a 36,36 0 1, 1 72,0 a 36,36 0 1, 1 -72,0"
                                    fill="none"
                                />
                                <text className="text-[10px] font-bold uppercase tracking-[0.14em] fill-cream">
                                    <textPath href="#circlePathBadge" startOffset="0%">
                                        M★BRAVO ★ HANDMADE ★ EST. 2025 ★ 
                                    </textPath>
                                </text>
                            </svg>
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg viewBox="0 0 120 120" className="w-16 h-16 md:w-20 md:h-20">
                                <path 
                                    d="M60 0 L78 38 L118 42 L90 71 L96 111 L60 93 L24 111 L30 71 L2 42 L42 38 Z" 
                                    fill="#C5A059" 
                                />
                                <text 
                                    x="60" 
                                    y="72" 
                                    textAnchor="middle" 
                                    fill="#243119" 
                                    style={{ fontSize: '32px', fontFamily: 'Playfair Display, serif', fontWeight: 'bold' }}
                                >
                                    M
                                </text>
                            </svg>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Emotional Storytelling & Pure Philosophy */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-12 md:gap-14 lg:col-span-7 lg:pl-12 text-left"
                >
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.45em] font-bold text-forest/35 block font-sans">
                            01 / MEMÓRIA E AFETO
                        </span>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-forest tracking-tight leading-[1.05] font-light">
                            Tudo começou com <br />
                            <span className="italic font-normal text-[#C5A059]">uma memória.</span>
                        </h2>
                    </div>
                    
                    <div className="space-y-8">
                        <p className="text-forest font-serif italic text-xl md:text-2xl leading-relaxed font-light text-forest/90">
                            Antes de existir uma marca, existia uma história. <br />
                            <span className="text-base sm:text-lg font-sans not-italic text-forest/70 block mt-3 font-light leading-relaxed">
                                Uma história feita de afeto, de tempo e de momentos que permanecem mesmo quando os dias passam.
                            </span>
                        </p>
                        
                        <p className="text-forest font-serif italic text-xl md:text-2xl leading-relaxed font-light text-forest/95">
                            M★Bravo nasceu desse sentimento.
                        </p>
                        
                        <p className="text-forest/70 text-[15px] md:text-lg leading-relaxed font-sans font-light max-w-2xl">
                            Cada peça é criada à mão, com calma e intenção, respeitando o tempo que as coisas verdadeiramente importantes merecem.
                        </p>
                    </div>

                    {/* Staggered Mantras (M★Bravo Pillars) with elegant lines */}
                    <div className="space-y-6 pt-10 border-t border-forest/10 max-w-xl">
                        {[
                            "Porque algumas histórias não foram feitas para ficar guardadas.",
                            "Foram feitas para ser sentidas."
                        ].map((mantra, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.4 + idx * 0.2 }}
                                className="flex items-center gap-4 group"
                            >
                                <span className="text-[#C5A059] text-xs font-serif select-none transition-transform duration-500 group-hover:scale-125">★</span>
                                <span className="text-forest font-serif text-[16px] md:text-xl font-light tracking-wide">
                                    {mantra}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Elegant, Non-Commercial CTA */}
                    <div className="pt-8 md:pt-10">
                        <a 
                            href="#collection" 
                            className="group relative inline-flex items-center gap-6 px-10 py-5 bg-forest text-cream rounded-full overflow-hidden transition-all duration-500 hover:pr-14"
                        >
                            <span className="relative z-10 text-[10px] uppercase tracking-[0.3em] font-semibold">
                                Descobrir a Coleção
                            </span>
                            <div className="absolute right-4 w-10 h-10 bg-[#C5A059] text-forest rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-6">
                                <ArrowRight size={16} />
                            </div>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const MadeWithTimeSection = () => {
    return (
        <section id="manifesto" data-background="light" className="py-44 md:py-60 lg:py-68 bg-[#FCFBF9] px-6 sm:px-12 md:px-20 lg:px-24 relative overflow-hidden select-none border-t border-forest/5">
            <div className="max-w-7xl mx-auto">
                {/* Header: Large Typography */}
                <div className="max-w-3xl mb-24 md:mb-32">
                    <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-forest/35 block mb-4 font-sans">
                        02 / THE CHRONICLES OF SLOW DESIGN
                    </span>
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif text-forest tracking-tight leading-[1.1] font-light">
                        Feito com Tempo. <br />
                        <span className="italic font-normal text-[#C5A059]">O ritmo calmo de tudo o que merece permanecer.</span>
                    </h2>
                    <p className="mt-6 text-forest/75 text-base md:text-xl font-light leading-relaxed max-w-2xl font-serif italic">
                        "To slow down is to notice the universe in a single thread."
                    </p>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32 items-start">
                    
                    {/* Left side: Warm Natural Imagery with luxurious framing */}
                    <div className="lg:col-span-5 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="aspect-[3/4] relative rounded-[2rem] overflow-hidden shadow-2xl group"
                        >
                            <img 
                                src="https://i.ibb.co/j9LHyxq6/Firefly-Gemini-Flash-Imagem-com-ambiente-cosy-tema-handmade-crochet-usar-o-logo-em-label-de-cartao.png" 
                                alt="Warm cozy ambient handcrafted yarn detail by M★Bravo" 
                                className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05] group-hover:scale-105 transition-transform duration-[2.5s] ease-out brightness-95"
                            />
                            {/* Floating Quote Card */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-8 md:p-10">
                                <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-medium mb-2 block font-sans">AUTHENTIC PROCESS</span>
                                <p className="text-cream font-serif italic text-lg md:text-xl font-light leading-relaxed">
                                    "Memory is woven into every single knot we craft."
                                </p>
                            </div>
                        </motion.div>
                        
                        {/* Under-image metadata */}
                        <div className="flex justify-between items-center px-2 mt-4 select-none pointer-events-none">
                            <span className="text-[9px] uppercase tracking-[0.25em] text-forest/40 font-mono">EST. 2025 PORTUGAL</span>
                            <span className="text-[9px] uppercase tracking-[0.25em] text-forest/45 font-mono">100% EXCLUSIVE PIECES</span>
                        </div>
                    </div>

                    {/* Right side: The Four Pillars */}
                    <div className="lg:col-span-7 space-y-16 lg:space-y-24">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-20 md:gap-y-28">
                            
                            {/* Pillar 1: Handmade Craftsmanship */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.1 }}
                                className="space-y-4 text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-[#C5A059] group-hover:bg-[#C5A059]/10 group-hover:text-forest transition-all duration-500">
                                        <Feather size={18} />
                                    </div>
                                    <span className="font-mono text-xs text-forest/40">01 / ARTISAN</span>
                                </div>
                                <h3 className="text-xl font-serif text-forest tracking-wide group-hover:text-[#C5A059] transition-colors duration-300">
                                    Algumas coisas precisam de tempo para nascer.
                                </h3>
                                <p className="text-forest/65 text-sm leading-relaxed font-sans font-light">
                                    Não acredito em apressar aquilo que realmente importa.
                                    <br /><br />
                                    Cada peça começa em silêncio, crescendo ponto a ponto, respeitando o seu próprio ritmo.
                                    <br /><br />
                                    Porque as coisas mais significativas da vida raramente são criadas à pressa.
                                </p>
                            </motion.div>

                            {/* Pillar 2: Unique Pieces */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="space-y-4 text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-[#C5A059] group-hover:bg-[#C5A059]/10 group-hover:text-forest transition-all duration-500">
                                        <Sparkles size={18} />
                                    </div>
                                    <span className="font-mono text-xs text-forest/40">02 / EXCLUSIVE</span>
                                </div>
                                <h3 className="text-xl font-serif text-forest tracking-wide group-hover:text-[#C5A059] transition-colors duration-300">
                                    Nenhuma memória nasce duas vezes.
                                </h3>
                                <p className="text-forest/65 text-sm leading-relaxed font-sans font-light">
                                    Raramente procuro recriar uma peça exatamente da mesma forma.
                                    <br /><br />
                                    Tal como as memórias, cada criação carrega o seu próprio carácter, as suas imperfeições e a sua história.
                                    <br /><br />
                                    É aí que vive a sua beleza.
                                </p>
                            </motion.div>

                            {/* Pillar 3: Thoughtful Design */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="space-y-4 text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-[#C5A059] group-hover:bg-[#C5A059]/10 group-hover:text-forest transition-all duration-500">
                                        <Palette size={18} />
                                    </div>
                                    <span className="font-mono text-xs text-forest/40">03 / CONSCIOUS</span>
                                </div>
                                <h3 className="text-xl font-serif text-forest tracking-wide group-hover:text-[#C5A059] transition-colors duration-300">
                                    A criação acontece no silêncio.
                                </h3>
                                <p className="text-forest/65 text-sm leading-relaxed font-sans font-light">
                                    Muitas ideias nascem entre fios, pensamentos e momentos de quietude.
                                    <br /><br />
                                    O processo nunca é acelerado.
                                    <br /><br />
                                    É neste ritmo mais lento que os detalhes se revelam e a inspiração encontra o seu lugar.
                                </p>
                            </motion.div>

                            {/* Pillar 4: Emotional Value */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.4 }}
                                className="space-y-4 text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-[#C5A059] group-hover:bg-[#C5A059]/10 group-hover:text-forest transition-all duration-500">
                                        <Heart size={18} />
                                    </div>
                                    <span className="font-mono text-xs text-forest/40">04 / EMOTIONAL</span>
                                </div>
                                <h3 className="text-xl font-serif text-forest tracking-wide group-hover:text-[#C5A059] transition-colors duration-300">
                                    O verdadeiro valor é aquilo que permanece.
                                </h3>
                                <p className="text-forest/65 text-sm leading-relaxed font-sans font-light">
                                    O valor de uma peça artesanal não vive apenas nos materiais.
                                    <br /><br />
                                    Vive no cuidado, na intenção e na emoção transportada em cada ponto.
                                    <br /><br />
                                    Muito depois de o fio ser tecido, o sentimento permanece.
                                </p>
                            </motion.div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const KnotSection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const xTrack = useTransform(smoothProgress, [0, 1], ["30%", "-30%"]);
    const yTrack = useTransform(smoothProgress, [0, 1], ["-35%", "25%"]);
    const opacityTrack = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.04, 0.04, 0]);

    return (
        <section ref={containerRef} id="feeling" data-background="dark" className="bg-forest py-52 md:py-80 lg:py-96 px-6 sm:px-12 md:px-20 lg:px-24 relative overflow-hidden">
            <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute inset-0 pointer-events-none text-cream text-[35vw] leading-none italic font-light whitespace-nowrap text-center flex items-center justify-center select-none"
            >
                Handmade
            </motion.div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="max-w-3xl mb-36 md:mb-44 lg:mb-48">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[10px] uppercase tracking-[0.4em] font-bold text-cream/30 mb-8 block"
                    >
                        Filosofia de Criação
                    </motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="text-6xl md:text-8xl font-serif text-cream leading-tight mb-14 md:mb-16"
                    >
                        O Ritmo do Coração <br />
                        <span className="italic font-normal text-brand-green-light">em Cada Ponto.</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-cream/80 text-xl md:text-2xl font-light leading-relaxed"
                    >
                        Há algo especial em criar com as próprias mãos.
                        <br /><br />
                        Cada ponto nasce de um gesto simples, repetido com calma, até ganhar forma, textura e significado.
                        <br /><br />
                        Enquanto as peças crescem, também crescem as memórias, os pensamentos e as histórias que as acompanham.
                        <br /><br />
                        Talvez seja por isso que o handmade nos toca de forma diferente.
                        <br /><br />
                        Porque não transporta apenas matéria.
                        <br /><br />
                        Transporta tempo.
                        <br /><br />
                        E tudo aquilo que sentimos enquanto criamos.
                    </motion.p>
                </div>

                {/* Minimalist Details Gallery */}
                <div className="grid grid-cols-12 gap-12 md:gap-20 lg:gap-24">
                    {/* Main Focus Detail */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5 }}
                        className="col-span-12 md:col-span-7 aspect-[4/5] rounded-[3rem] overflow-hidden relative group shadow-2xl"
                    >
                        <img 
                            src="https://i.ibb.co/F4Z4Fp4Z/LOGOTIPOo.jpg" 
                            alt="Textura de malha" 
                            className="w-full h-full object-cover grayscale brightness-[0.4] group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-[2s] ease-out scale-110 group-hover:scale-100"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-forest/80 to-transparent">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-cream/40 mb-2 block">Premium / Bags</span>
                            <p className="text-cream text-lg md:text-2xl font-serif italic">A trama que define o DNA Bravo.</p>
                        </div>
                    </motion.div>

                    {/* Secondary Details */}
                    <div className="col-span-12 md:col-span-5 flex flex-col gap-12 md:gap-20 lg:gap-24 justify-center">
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            className="aspect-square rounded-[3rem] overflow-hidden grayscale brightness-[0.4] hover:grayscale-0 hover:brightness-100 transition-all duration-1000 shadow-xl relative group"
                        >
                            <img 
                                src="https://i.ibb.co/d0Rn6jC7/MOOD-01.png" 
                                alt="Mãos da artesã" 
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s]"
                            />
                            <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-cream/10 backdrop-blur-md px-4 py-1 rounded-full text-[8px] uppercase tracking-widest text-cream">Home Essentials</span>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.5 }}
                            className="aspect-video rounded-[3rem] overflow-hidden grayscale brightness-[0.4] hover:grayscale-0 hover:brightness-100 transition-all duration-1000 shadow-xl relative group"
                        >
                            <img 
                                src="https://i.ibb.co/0pfJPj9V/emotional-thank-you-card-1.png" 
                                alt="Detalhe de material" 
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s]"
                            />
                            <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-cream/10 backdrop-blur-md px-4 py-1 rounded-full text-[8px] uppercase tracking-widest text-cream">Bikinis & Beach</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? "100%" : direction > 0 ? "-100%" : 0,
        opacity: 0,
    }),
};

interface ProductCardProps {
    product: any;
    i: number;
    isFocused: boolean;
    isSubdued: boolean;
    onFocus: (id: string | null) => void;
    onPrevProduct?: () => void;
    onNextProduct?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, i, isFocused, isSubdued, onFocus, onPrevProduct, onNextProduct }) => {
    const defaultSize = product.sizes ? product.sizes[0] : 'M';
    const [selections, setSelections] = useState({
        tamanho: defaultSize,
        cor: 'Verde Musgo',
        quantidade: product.name.toLowerCase().includes('coasters') ? '4und.' : '2und.',
        fecho: '',
        forro: '',
        detalhe: ''
    });
    const cardRef = useRef<HTMLDivElement>(null);
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const productImages = product.images || [product.img];

    useEffect(() => {
        setActiveImgIndex(0);
        setDirection(0);
    }, [product.id, isFocused]);

    const n = product.name.toLowerCase();
    const isVestuario = n.includes('bikini') || n.includes('top') || n.includes('cardigan') || n.includes('poncho') || n.includes('belt') || n.includes('bandana') || n.includes('headband');
    const isBag = n.includes('bag') || n.includes('pouch') || n.includes('booksleeve') || n.includes('clutch');
    const isHomeSet = n.includes('coasters') || n.includes('placemats');
    
    const hasSize = isVestuario;

    const hasQuantity = isHomeSet;

    // Logic for Material & Care
    const isSafran = isVestuario || product.id.startsWith('v') || product.id.startsWith('p');
    
    const materialText = product.material || (isSafran 
        ? "Produzido em 100% Algodão Egípcio Safran. Um fio nobre, fino e delicado, com um brilho suave e toque refrescante. Garante conforto térmico e elegância no caimento."
        : "Produzido em 100% Algodão. Um fio de fibra grossa e penteada que confere estrutura e alta resistência. Ideal para suportar o uso diário mantendo a forma original.");

    const careText = product.care || (isSafran
        ? "Lavar em ciclo delicado ou à mão (30ºC). Não usar amaciador e não deixar de molho. Secar à sombra e sempre na horizontal para evitar que a peça estique."
        : "Lavável à máquina (40ºC). Não usar lixívia. Secar na horizontal para manter a estrutura da peça.");

    const finalNote = "Cada peça M★BRAVO é tecida manualmente com fios certificados, garantindo exclusividade em cada detalhe.";

    const calculatePrice = () => {
        const price = getApprovedPrice(product.name);
        if (typeof price === 'string') {
            return price;
        }

        const qty = hasQuantity ? (parseInt(selections.quantidade) || 1) : 1;
        const total = price * qty;
        return `Total: ${total}€`;
    };

    const currentPrice = calculatePrice();

    const rawPrice = getApprovedPrice(product.name);
    const totalPrice = typeof rawPrice === 'number' 
        ? `${rawPrice * (hasQuantity ? (parseInt(selections.quantidade) || 1) : 1)}`
        : 'Sob Consulta';
    const selectedSize = hasSize ? selections.tamanho : 'Não aplicável';
    const selectedColor = selections.cor;
    const quantity = hasQuantity ? selections.quantidade : '1';

    const messageText = `Olá Carolina! Quero encomendar uma peça M★BRAVO.\n\nProduto: ${product.name}\nTamanho: ${selectedSize}\nCor: ${selectedColor}\nQuantidade: ${quantity}\n\nValor Total: ${totalPrice}€\n\nFico a aguardar os detalhes para combinarmos o envio e o pagamento. Obrigada!`;

    const whatsappUrl = `https://wa.me/351912828182?text=${encodeURIComponent(messageText)}`;

    useEffect(() => {
        if (!isFocused) {
            setSelections({ 
                tamanho: product.sizes ? product.sizes[0] : 'M', 
                cor: 'Verde Musgo', 
                quantidade: product.name.toLowerCase().includes('coasters') ? '4und.' : '2und.', 
                fecho: '', 
                forro: '', 
                detalhe: '' 
            });
        }
    }, [isFocused, product.name, product.sizes]);

    const sizes = product.sizes || (product.name.toLowerCase().includes('marea bikini') 
        ? ['XS', 'S', 'M', 'L'] 
        : ['S', 'M', 'L']);
    const quantities = product.name.toLowerCase().includes('coasters')
        ? ['4und.', '6und.', '8und.']
        : ['2und.', '4und.', '6und.', '8und.'];

    const colors = [
        { name: 'Verde Musgo', hex: '#243119' },
        { name: 'Hortelã-Pimenta', hex: '#789D8A' },
        { name: 'Petróleo', hex: '#005F6B' },
        { name: 'Azul Glaciar', hex: '#A2C2D1' },
        { name: 'Sorvete Limão', hex: '#F4D03F' },
        { name: 'Creme', hex: '#FDFBF7' },
        { name: 'Bege Claro', hex: '#E1D5C9' },
        { name: 'Rosa Ternura', hex: '#FADADD' },
        { name: 'Castanho', hex: '#5D4037' },
        { name: 'Branco', hex: '#FFFFFF' }
    ];

    const handleToggle = () => {
        onFocus(isFocused ? null : product.id);
    };

    const [isZoomed, setIsZoomed] = useState(false);

    if (!isFocused) {
        return (
            <motion.div 
                ref={cardRef}
                layoutId={`product-card-${product.id}`}
                className="group relative flex flex-col h-full bg-white rounded-[16px] shadow-[0_4px_22px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_-12px_rgba(36,49,25,0.14)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
            >
                <div className="flex flex-col h-full">
                    {/* Image Container with Fixed Aspect Ratio */}
                    <div 
                        className="relative overflow-hidden aspect-[4/5] cursor-pointer"
                        onClick={handleToggle}
                        style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
                    >
                        <div className="relative w-full h-full overflow-hidden bg-[#FAF8F5]/50">
                            <motion.img 
                                layoutId={`product-img-${product.id}`}
                                src={productImages[0]} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                            />
                        </div>
                        <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <span className="bg-forest/85 backdrop-blur-md text-white text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold">
                                M★BRAVO
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col justify-between flex-grow bg-white">
                        <div>
                            <h3 className="text-lg font-serif font-normal tracking-wide text-forest mb-1">{product.name}</h3>
                            <p className="text-forest/40 text-[9px] uppercase tracking-[0.3em] font-semibold mb-4 font-sans">HANDMADE EXCLUSIVE</p>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-sans font-semibold tracking-wider text-forest/70">{product.price}</span>
                            <button 
                                onClick={handleToggle}
                                className="p-2 rounded-full bg-forest text-cream hover:bg-forest/90 transition-all shadow-lg shadow-forest/10 hover:scale-105 active:scale-95 duration-200"
                            >
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // FOCUSED/EXPANDED MODAL LAYOUT
    const currentImg = productImages[activeImgIndex];

    return (
        <div className="w-full h-full md:max-w-6xl md:h-[88vh] bg-[#FCFBF9] rounded-none md:rounded-[2.5rem] flex flex-col md:flex-row shadow-2xl relative overflow-y-auto md:overflow-hidden text-forest select-none">
            {/* a) Área de Visualização */}
            <div 
                className={`transition-all duration-500 ease-in-out relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-[#141A11] ${
                    isZoomed 
                        ? 'fixed inset-0 z-[140] w-screen h-screen bg-black/98 p-4 md:p-8 border-none' 
                        : 'w-full md:w-[62%] h-[46vh] md:h-full shrink-0 border-b md:border-b-0 md:border-r border-white/5'
                }`}
                style={{ touchAction: 'none' }}
            >
                {/* Back button from zoomed-in mode */}
                {isZoomed && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsZoomed(false);
                        }}
                        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all border border-white/10 cursor-pointer"
                        title="Fechar Zoom"
                    >
                        <X size={20} />
                    </button>
                )}

                {!isZoomed && (
                    <div className="absolute top-6 left-6 z-20 pointer-events-none hidden md:block">
                        <span className="bg-white/15 backdrop-blur-md text-white/70 text-[8px] uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full border border-white/5">
                            Clique para aproximar a foto
                        </span>
                    </div>
                )}

                {/* Main Proportional Visual Frame with layoutId */}
                <div className="relative w-full h-full max-w-full max-h-[80vh] flex items-center justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.img 
                            key={activeImgIndex}
                            layoutId={activeImgIndex === 0 ? `product-img-${product.id}` : undefined}
                            src={currentImg} 
                            alt={`${product.name} - Imagem ${activeImgIndex + 1}`} 
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ 
                                x: { type: "spring", stiffness: 350, damping: 33 },
                                opacity: { duration: 0.15 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.4}
                            onDragEnd={(e, info) => {
                                if (info.offset.x < -60) {
                                    if (productImages.length > 1) {
                                        setDirection(1);
                                        setActiveImgIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
                                    }
                                } else if (info.offset.x > 60) {
                                    if (productImages.length > 1) {
                                        setDirection(-1);
                                        setActiveImgIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
                                    }
                                }
                            }}
                            className={`max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing select-none rounded-[1.5rem] transition-transform duration-300 ${
                                isZoomed ? 'md:max-h-[85vh] scale-[1.03]' : 'md:max-h-[75vh] hover:scale-[1.01]'
                            }`}
                            onClick={() => {
                                if (!isZoomed) setIsZoomed(true);
                            }}
                        />
                    </AnimatePresence>
                </div>

                {/* Gallery Nav Arrows inside Área de Visualização */}
                {productImages.length > 1 && (
                    <>
                        <div className="absolute inset-y-0 left-4 md:left-6 flex items-center z-30 pointer-events-none">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDirection(-1);
                                    setActiveImgIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
                                }}
                                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white text-white hover:text-forest backdrop-blur-md shadow-md flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-105 active:scale-95 border border-white/5 cursor-pointer"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        </div>
                        <div className="absolute inset-y-0 right-4 md:right-6 flex items-center z-30 pointer-events-none">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDirection(1);
                                    setActiveImgIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
                                }}
                                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white text-white hover:text-forest backdrop-blur-md shadow-md flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-105 active:scale-95 border border-white/5 cursor-pointer"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Pagination Indicator dots at bottom of viewing box */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/5">
                            {productImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (idx !== activeImgIndex) {
                                            setDirection(idx > activeImgIndex ? 1 : -1);
                                            setActiveImgIndex(idx);
                                        }
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeImgIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white'}`}
                                />
                            ))}
                        </div>
                        
                        {/* Interactive Luxury Thumbnails Strip in Viewer */}
                        {!isZoomed && (
                            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-35 hidden md:flex gap-2 p-1.5 bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 max-w-[85%] overflow-x-auto no-scrollbar">
                                {productImages.map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (idx !== activeImgIndex) {
                                                setDirection(idx > activeImgIndex ? 1 : -1);
                                                setActiveImgIndex(idx);
                                            }
                                        }}
                                        className={`relative w-10 h-10 rounded-lg overflow-hidden border transition-all shrink-0 ${
                                            idx === activeImgIndex 
                                                ? 'border-white scale-95 shadow-lg' 
                                                : 'border-transparent opacity-50 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* b) Área de Informação (Details / Sidebar and custom features) */}
            <div className="w-full md:w-[38%] h-auto md:h-full bg-[#FCFBF9] flex flex-col pl-5 pr-5 py-6 md:py-8 text-forest relative box-border">
                {/* Upper Scrollable Info Panel with compact spacing */}
                <div className="flex-1 overflow-y-visible md:overflow-y-auto space-y-5 pr-1 select-text scrollbar-thin scrollbar-thumb-forest/10 scrollbar-track-transparent">
                    
                    {/* Title & Navigation/Close Controls */}
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <span className="text-[9px] uppercase tracking-[0.4em] text-[#C5A059] block mb-1 font-sans font-semibold">EXCLUSIVO M★BRAVO</span>
                            <h3 className="text-3xl md:text-3.5xl font-serif font-light text-forest leading-tight tracking-[0.05em] mb-1">{product.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 z-30">
                            {onPrevProduct && onNextProduct && (
                                <div className="flex items-center bg-forest/5 rounded-full p-1 border border-forest/10 shadow-sm backdrop-blur-sm">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPrevProduct();
                                        }}
                                        className="p-1.5 rounded-full hover:bg-forest hover:text-cream transition-all bg-transparent text-forest cursor-pointer"
                                        title="Produto Anterior"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="text-[8px] uppercase tracking-widest font-black text-forest/45 px-1.5 pointer-events-none select-none">PEÇA</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNextProduct();
                                        }}
                                        className="p-1.5 rounded-full hover:bg-forest hover:text-cream transition-all bg-transparent text-forest cursor-pointer"
                                        title="Próximo Produto"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                            <button 
                                onClick={handleToggle}
                                className="p-2.5 rounded-full bg-forest/5 text-forest hover:bg-forest hover:text-cream transition-all border border-forest/10 shadow-sm cursor-pointer"
                                title="Fechar"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Descrição em Layout Editorial Expandido e Fluido */}
                    {product.description && (
                        <p className="text-[13px] text-forest/75 leading-relaxed tracking-wide font-light font-sans whitespace-pre-line max-w-prose md:max-w-[90%] w-full mb-6">
                            {product.description}
                        </p>
                    )}

                    {/* Customization Selection Panels */}
                    <div className="space-y-6">
                        {/* Container Comum para Seletores (Cores, Tamanho, Quantidade) com recuo explícito */}
                        <div id="selection-selectors-group" className="space-y-6 text-left w-full">
                            {/* Cores */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                        <span className="text-[#C5A059] text-xs">●</span> COR DA PEÇA
                                    </h5>
                                    <span className="text-[9px] font-extrabold text-[#A68244] bg-[#FDF9F3] px-3 py-0.5 rounded-full border border-[#C5A059]/10">
                                        {selections.cor}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map(opt => (
                                        <button 
                                            key={opt.name}
                                            onClick={() => setSelections(prev => ({ ...prev, cor: opt.name }))}
                                            className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 cursor-pointer ${
                                                selections.cor === opt.name ? 'border-forest scale-110 shadow-md shadow-forest/10' : 'border-transparent hover:scale-110'
                                            }`}
                                            title={opt.name}
                                        >
                                            <div className="w-full h-full rounded-full border border-forest/5" style={{ backgroundColor: opt.hex }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tamanho */}
                            {hasSize && (
                                <div className="space-y-2">
                                    <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                        <span className="text-[#C5A059] text-xs">●</span> TAMANHO
                                    </h5>
                                    <div className="flex flex-wrap gap-1.5">
                                        {sizes.map(opt => (
                                            <button 
                                                key={opt}
                                                onClick={() => setSelections(prev => ({ ...prev, tamanho: opt }))}
                                                className={`rounded-full px-4 py-1.5 border border-forest/20 transition-all duration-300 text-xs font-bold cursor-pointer ${
                                                    selections.tamanho === opt 
                                                        ? 'bg-forest text-cream border-forest shadow-sm scale-105' 
                                                        : 'bg-white text-forest hover:bg-forest/5'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantidade */}
                            {hasQuantity && (
                                <div className="space-y-2">
                                    <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                        <span className="text-[#C5A059] text-xs">●</span> QUANTIDADE DO CONJUNTO
                                    </h5>
                                    <div className="flex gap-1.5">
                                        {quantities.map(opt => (
                                            <button 
                                                key={opt}
                                                onClick={() => setSelections(prev => ({ ...prev, quantidade: opt }))}
                                                className={`rounded-full px-4 py-1.5 border border-forest/20 transition-all duration-300 text-xs font-bold cursor-pointer ${
                                                    selections.quantidade === opt 
                                                        ? 'bg-forest text-cream border-forest shadow-sm scale-105' 
                                                        : 'bg-white text-forest hover:bg-forest/5'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Secção de Material & Composição (Estrutura de Cartões Minimalistas) */}
                        <div className="space-y-2 text-left">
                            <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                <span className="text-[#C5A059] text-xs">●</span> MATERIAL & COMPOSIÇÃO
                            </h5>
                            <div className="flex flex-col gap-2 w-full pt-1">
                                {parseMaterials(materialText).map((item, idx) => (
                                    <div key={idx} className="bg-neutral-100/50 rounded-xl p-3 border border-forest/5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-left select-text">
                                        {item.title ? (
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#A68244] block">
                                                    {item.title}
                                                </span>
                                                <p className="text-[12px] text-forest/80 leading-relaxed font-light font-sans">
                                                    {item.description}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-[12px] text-forest/80 leading-relaxed font-light font-sans">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Secção de Manutenção e Cuidados (Com Ícones e Legendas) */}
                        <div className="space-y-3 text-left">
                            <h5 className="text-[9px] uppercase tracking-[0.25em] font-bold text-forest/45 flex items-center gap-1.5">
                                <span className="text-[#C5A059] text-xs">●</span> MANUTENÇÃO & CUIDADOS
                            </h5>
                            <div className="grid grid-cols-4 gap-2 pt-1 select-none">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest/70 border border-forest/5 hover:bg-forest/10 transition-colors">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            {/* Wash tub container */}
                                            <path d="M3 9h18c0 0-1.5 8-2 10s-1.5 2-3 2H8c-1.5 0-2.5-2-3-2S3 9 3 9z" />
                                            {/* Wavy water level */}
                                            <path d="M3 12c1.8-1.5 3.8 1.5 5.6 0s3.8-1.5 5.6 0 3.8 1.5 5.6 0" />
                                            {/* Hand reaching in */}
                                            <path d="M12 3v7M9.5 4.5v5.5M14.5 3.5v6.5M7 6v4c0 1 1 2 2 2h4.5" />
                                        </svg>
                                    </div>
                                    <span className="text-[9px] tracking-tight leading-tight mt-1 text-forest/70 font-light font-sans max-w-[65px]">
                                        LAVAGEM À MÃO
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest/70 border border-forest/5 hover:bg-forest/10 transition-colors">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            {/* Square container representing drying */}
                                            <rect x="4" y="4" width="16" height="16" rx="3" />
                                            {/* Horizontal line representing flat drying */}
                                            <line x1="8" y1="12" x2="16" y2="12" />
                                        </svg>
                                    </div>
                                    <span className="text-[9px] tracking-tight leading-tight mt-1 text-forest/70 font-light font-sans max-w-[65px]">
                                        SECAR HORIZONTAL
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest/70 border border-forest/5 hover:bg-forest/10 transition-colors">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            {/* Square for drying */}
                                            <rect x="4" y="4" width="16" height="16" rx="3" />
                                            {/* Circle inside for tumble */}
                                            <circle cx="12" cy="12" r="5" />
                                            {/* Cross slash (X) to prohibit */}
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                        </svg>
                                    </div>
                                    <span className="text-[9px] tracking-tight leading-tight mt-1 text-forest/70 font-light font-sans max-w-[65px]">
                                        SEM SECADORA
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest/70 border border-forest/5 hover:bg-forest/10 transition-colors">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            {/* Twisted cloth shape representing wringing */}
                                            <path d="M5 8c2 0 3 4 5 4s3-4 5-4 3 4 5 4M4 14c2 0 3-4 5-4s3 4 5 4 3-4 5-4" />
                                            {/* Diagonal line of prohibition */}
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                        </svg>
                                    </div>
                                    <span className="text-[9px] tracking-tight leading-tight mt-1 text-forest/70 font-light font-sans max-w-[65px]">
                                        EVITAR TORCER
                                    </span>
                                </div>
                            </div>
                        </div>

                    <div className="text-center font-sans tracking-wide py-4">
                        <p className="text-[10px] text-[#A68244]/80 italic font-medium">{finalNote}</p>
                    </div>

                        {/* B & C) TABLET & MOBILE CHECKOUT BOX: Rendered statically in the scroll flow, liberating vertical space */}
                        <div className="md:hidden block">
                            <div id="checkout-box-mobile" className="bg-[#343E2C] rounded-2xl p-5 border border-white/10 shadow-lg relative overflow-hidden text-[#FCFBF9] animate-fadeIn">
                                <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-white/10">
                                    <h4 className="text-[11px] uppercase tracking-[0.25em] font-semibold bg-gradient-to-b from-[#F5E0B5] to-[#D4AF37] bg-clip-text text-transparent">ENCOMENDA</h4>
                                    <span className="text-2xl md:text-3xl font-serif text-[#FCFBF9] font-semibold tracking-tight">{currentPrice}</span>
                                </div>

                                <div className="space-y-1.5 mb-3.5 text-[11px] uppercase tracking-wider text-white/90 font-normal">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                        <span className="text-white/40 text-[9px] tracking-[0.2em]">COR</span>
                                        <span className="text-[#FCFBF9] font-semibold">{selections.cor || 'Verde Musgo'}</span>
                                    </div>
                                    {hasSize && (
                                        <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                            <span className="text-white/40 text-[9px] tracking-[0.2em]">TAMANHO</span>
                                            <span className="text-[#FCFBF9] font-semibold">{selections.tamanho}</span>
                                        </div>
                                    )}
                                    {hasQuantity && (
                                        <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                            <span className="text-white/40 text-[9px] tracking-[0.2em]">QUANTIDADE</span>
                                            <span className="text-[#FCFBF9] font-semibold">{selections.quantidade}</span>
                                        </div>
                                    )}
                                    {product.dimensions && (
                                        <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                            <span className="text-white/40 text-[9px] tracking-[0.2em]">DIMENSÕES</span>
                                            <span className="text-[#FCFBF9] font-semibold">{product.dimensions}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <motion.a 
                                    href={whatsappUrl}
                                    target="_blank"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full rounded-full py-3.5 text-center font-bold bg-[#C5A059] text-[#343E2C] hover:bg-[#d5b069] active:scale-95 text-[11px] uppercase tracking-widest cursor-pointer shadow-[0_4px_15px_rgba(197,160,89,0.3)] border border-[#C5A059]/10 block transition-all duration-300"
                                >
                                    ENVIAR ENCOMENDA
                                </motion.a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* A) DESKTOP FIXED FOOTER CHECKOUT BOX: Always anchored at the base of the sidebar, content scrolls beautifully behind it */}
                <div className="hidden md:block shrink-0 mt-2">
                    <div id="checkout-box-desktop" className="bg-[#343E2C] rounded-2xl p-5 border border-white/10 shadow-lg relative overflow-hidden text-[#FCFBF9] animate-fadeIn">
                        <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-white/10">
                            <h4 className="text-[11px] uppercase tracking-[0.25em] font-semibold bg-gradient-to-b from-[#F5E0B5] to-[#D4AF37] bg-clip-text text-transparent">ENCOMENDA</h4>
                            <span className="text-2xl md:text-3xl font-serif text-[#FCFBF9] font-semibold tracking-tight">{currentPrice}</span>
                        </div>

                        <div className="space-y-1.5 mb-3.5 text-[11px] uppercase tracking-wider text-white/90 font-normal">
                            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                <span className="text-white/40 text-[9px] tracking-[0.2em]">COR</span>
                                <span className="text-[#FCFBF9] font-semibold">{selections.cor || 'Verde Musgo'}</span>
                            </div>
                            {hasSize && (
                                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                    <span className="text-white/40 text-[9px] tracking-[0.2em]">TAMANHO</span>
                                    <span className="text-[#FCFBF9] font-semibold">{selections.tamanho}</span>
                                </div>
                            )}
                            {hasQuantity && (
                                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                    <span className="text-white/40 text-[9px] tracking-[0.2em]">QUANTIDADE</span>
                                    <span className="text-[#FCFBF9] font-semibold">{selections.quantidade}</span>
                                </div>
                            )}
                            {product.dimensions && (
                                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                    <span className="text-white/40 text-[9px] tracking-[0.2em]">DIMENSÕES</span>
                                    <span className="text-[#FCFBF9] font-semibold">{product.dimensions}</span>
                                </div>
                            )}
                        </div>
                        
                        <motion.a 
                            href={whatsappUrl}
                            target="_blank"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full rounded-full py-3.5 text-center font-bold bg-[#C5A059] text-[#343E2C] hover:bg-[#d5b069] active:scale-95 text-[11px] uppercase tracking-widest cursor-pointer shadow-[0_4px_15px_rgba(197,160,89,0.3)] border border-[#C5A059]/10 block transition-all duration-300"
                        >
                            ENVIAR ENCOMENDA
                        </motion.a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CarouselItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex-none w-full md:w-[calc(100%/3)] px-4 snap-center md:snap-start">
            <div className="w-full h-full">
                {children}
            </div>
        </div>
    );
};

const CollectionSection = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [focusedProductId, setFocusedProductId] = useState<string | null>(null);
    const containerRef = useRef(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const xTrack = useTransform(smoothProgress, [0, 1], ["-25%", "25%"]);
    const yTrack = useTransform(smoothProgress, [0, 1], ["-35%", "25%"]);
    const opacityTrack = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.04, 0.04, 0]);

    const activeCategory = SHOP_CATEGORIES.find(c => c.id === selectedCategory);

    const handlePrevProduct = () => {
        if (!activeCategory || !focusedProductId) return;
        const index = activeCategory.products.findIndex(p => p.id === focusedProductId);
        if (index !== -1) {
            const prevIndex = index === 0 ? activeCategory.products.length - 1 : index - 1;
            setFocusedProductId(activeCategory.products[prevIndex].id);
        }
    };

    const handleNextProduct = () => {
        if (!activeCategory || !focusedProductId) return;
        const index = activeCategory.products.findIndex(p => p.id === focusedProductId);
        if (index !== -1) {
            const nextIndex = index === activeCategory.products.length - 1 ? 0 : index + 1;
            setFocusedProductId(activeCategory.products[nextIndex].id);
        }
    };

    // Reset focused product when changing category
    useEffect(() => {
        setFocusedProductId(null);
    }, [selectedCategory]);

    // Lock body scroll when a product focus modal is open
    useEffect(() => {
        if (focusedProductId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [focusedProductId]);

    return (
        <section ref={containerRef} id="collection" data-background="light" className="py-44 md:py-64 lg:py-72 bg-cream min-h-screen relative overflow-hidden">
            <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute inset-0 pointer-events-none text-forest text-[35vw] leading-none italic font-light whitespace-nowrap text-center flex items-center justify-center select-none"
            >
                M★Bravo
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 mb-44 md:mb-52 text-center relative z-10">
                 <motion.span 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-[10px] uppercase tracking-[0.4em] font-bold text-forest/30 mb-4 block"
                 >
                    {selectedCategory ? activeCategory?.name : 'Categorias'}
                 </motion.span>
                 <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-8xl font-serif text-forest leading-tight"
                 >
                    {selectedCategory ? activeCategory?.name : <>Catálogo</>}
                 </motion.h2>

                 {selectedCategory && (
                    <motion.button 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setSelectedCategory(null)}
                        className="mt-12 group flex items-center gap-4 mx-auto text-[10px] uppercase tracking-[0.4em] font-bold text-forest/40 hover:text-forest transition-colors"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                        Voltar às Categorias
                    </motion.button>
                 )}
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "linear" }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24"
                        >
                            {SHOP_CATEGORIES.map((cat, i) => (
                                <motion.div 
                                    key={cat.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative aspect-[4/3] rounded-[3rem] overflow-hidden bg-forest/5 cursor-pointer"
                                    style={{ willChange: 'transform' }}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    <img 
                                        src={cat.img} 
                                        alt={cat.name} 
                                        className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-[2s] ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent flex flex-col justify-end p-12 translate-y-6 group-hover:translate-y-0 transition-transform duration-700">
                                        <span className="text-brand-green-light text-[10px] uppercase tracking-[0.5em] font-bold mb-4">Categoria</span>
                                        <h3 className="text-4xl md:text-6xl font-serif text-cream mb-4">{cat.name}</h3>
                                        <p className="text-cream/60 text-sm font-light mb-10 max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700">{cat.items}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="detail"
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "linear" }}
                            className="relative"
                        >
                            {/* Carousel Container - ALWAYS rendered to keep scroll and heights */}
                            <div className={`transition-all duration-500 ${focusedProductId ? "opacity-30 pointer-events-none scale-[0.98] blur-[2px]" : "opacity-100"}`}>
                                <div className="relative group/carousel px-4">
                                    {/* Horizontal Product Carousel - High-End eCommerce Layout */}
                                    <div 
                                        ref={carouselRef}
                                        className="relative w-full overflow-x-auto pb-12 pt-4 snap-x snap-mandatory no-scrollbar flex scroll-smooth"
                                    >
                                        {activeCategory?.products.map((product, i) => (
                                            <CarouselItem key={product.id}>
                                                <ProductCard 
                                                    product={product} 
                                                    i={i} 
                                                    isFocused={false}
                                                    isSubdued={focusedProductId !== null && focusedProductId !== product.id}
                                                    onFocus={setFocusedProductId}
                                                />
                                            </CarouselItem>
                                        ))}
                                    </div>

                                    {/* Minimalist Navigation Controls */}
                                    <div className="hidden md:flex absolute top-1/2 -left-4 -right-4 -translate-y-1/2 items-center justify-between pointer-events-none px-4">
                                        <button 
                                            onClick={() => carouselRef.current?.scrollBy({ left: -carouselRef.current.offsetWidth, behavior: 'smooth' })}
                                            className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg pointer-events-auto hover:bg-forest hover:text-cream transition-all -translate-x-2"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button 
                                            onClick={() => carouselRef.current?.scrollBy({ left: carouselRef.current.offsetWidth, behavior: 'smooth' })}
                                            className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg pointer-events-auto hover:bg-forest hover:text-cream transition-all translate-x-2"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>

                                    {/* Discrete Pagination Dots */}
                                    <div className="flex justify-center gap-2 mt-4">
                                        {activeCategory?.products.map((_, idx) => (
                                            <div 
                                                key={idx}
                                                className="h-1 rounded-full bg-forest/20 w-8"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Focused Product Modal */}
                            <AnimatePresence>
                                {focusedProductId && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-6 lg:p-12 bg-forest/60 backdrop-blur-lg overflow-hidden"
                                    >
                                        {/* Clickable Backdrop inside */}
                                        <div 
                                            className="fixed inset-0 -z-10 cursor-pointer" 
                                            onClick={() => setFocusedProductId(null)} 
                                        />
                                        
                                        <div className="relative w-full h-full md:h-auto max-w-6xl z-10 flex items-center justify-center">
                                            <ProductCard 
                                                product={activeCategory?.products.find(p => p.id === focusedProductId)} 
                                                i={0} 
                                                isFocused={true}
                                                isSubdued={false}
                                                onFocus={setFocusedProductId}
                                                onPrevProduct={handlePrevProduct}
                                                onNextProduct={handleNextProduct}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

const ContactSection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const xTrack = useTransform(smoothProgress, [0, 1], ["-10%", "10%"]);
    const yTrack = useTransform(smoothProgress, [0, 1], ["-20%", "20%"]);
    const opacityTrack = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.02, 0.02, 0]);

    return (
        <section ref={containerRef} id="contacto" data-background="dark" className="py-44 md:py-64 lg:py-72 bg-forest px-6 sm:px-12 md:px-20 lg:px-24 relative overflow-hidden">
             {/* Large Script Background */}
             <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute inset-0 pointer-events-none text-cream text-[35vw] leading-none italic font-light whitespace-nowrap text-center flex items-center justify-center select-none"
             >
                 M★Bravo
             </motion.div>

             <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-5xl md:text-8xl font-serif text-cream mb-14 md:mb-16">Entre no nosso <br /><span className="italic">Universo.</span></h2>
                    <p className="text-cream/50 text-xl font-light mb-20 md:mb-24 leading-relaxed">
                        Deseja uma peça personalizada ou simplesmente quer saber mais sobre o nosso processo? Estamos a um ponto de distância.
                    </p>
                    
                    <div className="flex flex-col items-center gap-10 md:gap-12">
                        <a 
                            href={MAILTO_LINK}
                            className="group flex items-center gap-4 text-2xl md:text-4xl font-serif text-cream hover:text-brand-green-light transition-all border-b border-cream/20 pb-4"
                        >
                            <Mail size={24} className="md:w-8 md:h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                            {CONTACT_EMAIL}
                        </a>

                        <a 
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Vi o site da M★BRAVO e gostaria de saber mais sobre as suas peças.")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 text-2xl md:text-4xl font-serif text-cream hover:text-brand-green-light transition-all border-b border-cream/20 pb-4"
                        >
                            <MessageCircle size={24} className="md:w-8 md:h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                            Conversar via WhatsApp
                        </a>
                    </div>
                </motion.div>

                <div className="mt-40 md:mt-48 flex flex-wrap justify-center gap-14 md:gap-16 lg:gap-20">
                    <a href="https://www.instagram.com/mbravo.handmade/" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-[0.4em] text-cream/40 hover:text-cream transition-colors">
                        Instagram
                    </a>
                    <a href={MAILTO_LINK} className="text-[10px] uppercase tracking-[0.4em] text-cream/40 hover:text-cream transition-colors">
                        E-mail
                    </a>
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Vi o site da M★BRAVO e gostaria de saber mais sobre as suas peças.")}`} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-[0.4em] text-cream/40 hover:text-cream transition-colors">
                        WhatsApp
                    </a>
                </div>
             </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="bg-forest text-cream py-20 px-6 border-t border-cream/5">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
                <Logo light className="opacity-50 h-28 md:h-48" />
                
                <div className="flex gap-12 text-[10px] uppercase tracking-[0.2em] font-medium text-cream/30">
                    <a href="#" className="hover:text-cream transition-colors">FAQ</a>
                    <a href="#" className="hover:text-cream transition-colors">Envios</a>
                    <a href="#" className="hover:text-cream transition-colors">Política</a>
                </div>

                <div className="text-[9px] uppercase tracking-[0.2em] text-cream/20 text-center md:text-right">
                    {CONTACT_EMAIL} <br />
                    © 2025 M★BRAVO | Handmade with Love <br />
                    Criado com tempo, em Portugal.
                </div>
            </div>
        </footer>
    );
};

const MemoryContinuesSection = () => {
    return (
        <section id="memoria" data-background="light" className="py-40 md:py-60 lg:py-64 bg-[#FCFBF9] px-6 sm:px-12 md:px-20 lg:px-24 relative overflow-hidden select-none border-b border-forest/5">
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-16 md:space-y-24"
                >
                    {/* Section label */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-forest/35 block font-sans">
                            03 / A MEMÓRIA CONTINUA
                        </span>
                        <div className="h-[1px] w-12 bg-forest/10 mx-auto" />
                    </div>

                    {/* Main text and body with elegant layout */}
                    <div className="space-y-10 lg:space-y-14">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif text-forest tracking-tight leading-tight font-light col-span-2">
                            Há histórias que <br className="inline sm:hidden" /> não desaparecem.
                        </h2>
                        
                        <p className="text-forest/70 font-serif italic text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto font-light">
                            Continuam presentes nos gestos, nas memórias e nas pequenas coisas que criamos com amor.
                        </p>
                    </div>

                    <div className="space-y-8 max-w-xl mx-auto">
                        <p className="text-[#C5A059] font-serif italic text-xl md:text-2xl font-normal tracking-wide">
                            M★Bravo nasceu dessa presença.
                        </p>
                        
                        <p className="text-forest/65 text-sm sm:text-base md:text-lg leading-relaxed font-sans font-light">
                            Cada ponto, cada textura e cada detalhe transportam um pedaço dessa história, transformando fios em peças únicas e memórias em algo que pode ser tocado.
                        </p>
                    </div>

                    <div className="pt-12 md:pt-16 border-t border-forest/10 max-w-md mx-auto">
                        <p className="text-forest font-serif italic text-lg md:text-xl font-light leading-relaxed text-forest/80">
                            "Mais do que croché, é uma forma de preservar aquilo que realmente importa."
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);

  // Smooth scroll logic for standard browser behavior
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-cream text-forest select-none">
      <NoiseOverlay />
      
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loading" onComplete={() => setLoading(false)} />
        ) : (
          <motion.main
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col"
          >
            <Navbar />
            
            {/* Smooth Parallax Scroll Content */}
            <div className="relative">
                <Hero />
                <div className="relative overflow-hidden">
                    <StorySection />
                    <MadeWithTimeSection />
                    <KnotSection />
                </div>
                <CollectionSection />
                
                {/* Visual Interlude */}
                <div data-background="dark" className="h-[60vh] md:h-[100vh] bg-forest relative overflow-hidden flex items-center justify-center">
                    <motion.div 
                        initial={{ scale: 1.5, opacity: 0 }}
                        whileInView={{ scale: 1.15, opacity: 1 }}
                        transition={{ duration: 2.5, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <img 
                            src="https://i.ibb.co/xqh0LJ7g/Firefly-Gemini-Flash-Imagem-com-ambiente-cosy-tema-handmade-crochet-usar-o-logo-em-business-card.png" 
                            alt="Brand visual" 
                            className="w-full h-full object-cover brightness-[0.4] grayscale-[0.5]"
                        />
                    </motion.div>
                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6 md:gap-8">
                        <h2 className="text-cream font-serif italic text-4xl md:text-7xl leading-tight">
                            "A beleza está na alma <br className="hidden md:inline" /> que colocamos em cada gesto."
                        </h2>
                        <span className="text-[#C5A059]/80 font-serif italic text-lg md:text-2xl tracking-wide font-light select-none block max-w-xl mx-auto">
                            "Peças criadas com tempo, amor e memória."
                        </span>
                    </div>
                </div>

                <MemoryContinuesSection />

                <ContactSection />
            </div>
            
            <Footer />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
