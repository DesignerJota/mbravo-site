import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { Menu, X, Instagram, Facebook, ArrowRight, ChevronLeft, ChevronRight, Share2, Mail, MessageCircle } from 'lucide-react';

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
    const { scrollYProgress } = useScroll();
    const logoScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.85]);
    const logoOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const contentY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

    return (
        <section data-background="dark" className="relative h-screen flex flex-col items-center justify-center bg-forest overflow-hidden text-cream">
            {/* Ambient Overlay Image */}
            <div className="absolute inset-0 z-0">
                 <motion.div 
                    animate={{ 
                        opacity: [0.15, 0.25, 0.15],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[url('https://i.ibb.co/fVfHtWRj/cozy-home-composition-with-cup-herbal-tea-books-wooden-surface.jpg')] bg-cover bg-center brightness-[0.4] saturate-[0.8]"
                 />
            </div>

            {/* Centered Logo & Slogan */}
            <motion.div 
                style={{ scale: logoScale, opacity: logoOpacity, y: contentY }}
                className="relative z-10 flex flex-col items-center px-6 -mt-20 md:-mt-32"
            >
                <motion.div
                    initial={{ scale: 0.2, opacity: 0, filter: "blur(10px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    transition={{ 
                        delay: 1.2, 
                        duration: 3, 
                        ease: [0.22, 1, 0.36, 1] 
                    }}
                    className="mb-14"
                >
                    <Logo light className="h-40 md:h-56" />
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5, duration: 2 }}
                    className="text-center"
                >
                    <p className="text-brand-green-light font-serif italic text-xl md:text-3xl tracking-widest max-w-xl leading-relaxed">
                        “Peças feitas com tempo, <br className="md:hidden" /> amor e memória.”
                    </p>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
                style={{ opacity: logoOpacity }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ 
                    opacity: { delay: 3, duration: 1 },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute bottom-10 flex flex-col items-center gap-4 z-20"
            >
                <span className="text-cream/20 text-[9px] uppercase tracking-[0.6em]">Scroll para Mergulhar</span>
                <div className="relative h-24 w-6 flex justify-center">
                    {/* Organic Crochet Thread SVG */}
                    <svg width="24" height="96" viewBox="0 0 24 96" fill="none" className="stroke-cream/40">
                        <path 
                            d="M12 0C12 5 14 8 14 12C14 16 10 20 10 24C10 28 14 32 14 36C14 40 10 44 10 48C10 52 13 56 12 60C11 64 12 80 12 96" 
                            strokeWidth="0.8" 
                            strokeLinecap="round"
                            className="opacity-60"
                        />
                        {/* Faded end of thread */}
                        <defs>
                            <linearGradient id="threadGradient" x1="12" y1="0" x2="12" y2="96" gradientUnits="userSpaceOnUse">
                                <stop stopColor="currentColor" stopOpacity="0.8"/>
                                <stop offset="1" stopColor="currentColor" stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                        <path 
                            d="M12 0C12 5 14 8 14 12C14 16 10 20 10 24C10 28 14 32 14 36C14 40 10 44 10 48C10 52 13 56 12 60C11 64 12 80 12 96" 
                            stroke="url(#threadGradient)" 
                            strokeWidth="1.2" 
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            </motion.div>

            {/* Corner Labels (Editorial feel) */}
            <div className="absolute bottom-12 left-12 hidden lg:block z-20">
                <span className="text-[10px] uppercase tracking-[0.4em] text-cream/20 [writing-mode:vertical-rl] rotate-180">ESTAB. 2025</span>
            </div>
            <div className="absolute bottom-12 right-12 hidden lg:block z-20">
                <span className="text-[10px] uppercase tracking-[0.4em] text-cream/20 [writing-mode:vertical-rl]">BRAVO ARTESANATO</span>
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

    const xTrack = useTransform(smoothProgress, [0, 1], ["-20%", "20%"]);
    const yTrack = useTransform(smoothProgress, [0, 1], ["-30%", "40%"]);
    const opacityTrack = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.04, 0.04, 0]);

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
        <section ref={containerRef} id="sobre" data-background="light" className="py-32 md:py-56 px-6 bg-cream relative overflow-hidden">
            <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Great Vibes', cursive" }}
                className="absolute inset-0 pointer-events-none text-forest text-[40vw] leading-none whitespace-nowrap text-center flex items-center justify-center select-none"
            >
                Carolina
            </motion.div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2 }}
                    className="relative"
                >
                    <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl relative bg-forest/5">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={currentImg}
                                src={storyImages[currentImg]} 
                                alt={`M★BRAVO story ${currentImg + 1}`} 
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 2.0, ease: "easeInOut" }}
                                className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000 ease-out"
                            />
                        </AnimatePresence>
                        <div className="absolute inset-0 ring-1 ring-inset ring-forest/10 rounded-[2.5rem]" />
                        
                        {/* Slide indicators */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                            {storyImages.map((_, idx) => (
                                <div 
                                    key={idx}
                                    className={`h-1 rounded-full transition-all duration-500 ${
                                        currentImg === idx ? 'w-8 bg-cream' : 'w-2 bg-cream/30'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute -bottom-12 -right-12 md:-bottom-16 md:-right-16 w-44 h-44 lg:w-48 lg:h-48 hidden md:flex items-center justify-center bg-forest rounded-full p-1.5 shadow-[0_20px_50px_rgba(20,40,20,0.3)] border-4 border-cream z-20 overflow-hidden group">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full relative flex items-center justify-center"
                        >
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                <path
                                    id="circlePathBadge"
                                    d="M 50, 50 m -36, 0 a 36,36 0 1, 1 72,0 a 36,36 0 1, 1 -72,0"
                                    fill="none"
                                />
                                <text className="text-[9.8px] font-bold uppercase tracking-[0.14em] fill-cream">
                                    <textPath href="#circlePathBadge" startOffset="0%">
                                        M★BRAVO ★ HANDMADE ★ EST. 2025 ★ 
                                    </textPath>
                                </text>
                            </svg>
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg viewBox="0 0 120 120" className="w-20 h-20">
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

                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1 }}
                    className="flex flex-col gap-10"
                >
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-forest/30">Nossa Identidade</span>
                        <h2 className="text-6xl md:text-8xl font-serif text-forest leading-[0.95]">
                            A Herança <br />
                            <span className="italic font-normal text-brand-green-light">do Detalhe.</span>
                        </h2>
                    </div>
                    
                    <p className="text-forest/70 text-lg md:text-2xl leading-relaxed font-light">
                        Na M★BRAVO, acreditamos que a verdadeira sofisticação reside no que é impercetível ao olhar apressado. Cada peça nasce de um diálogo silencioso entre as mãos e a matéria, onde o luxo não é ostentação, mas sim a calma de um ponto perfeito. Não criamos acessórios; tecemos fragmentos de tempo e paciência, transformando fios nobres em peças que carregam uma história — a sua.
                    </p>

                    <div className="space-y-4 pt-12 border-t border-forest/5">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-forest/30">O Toque da Fundadora</span>
                        <p className="text-forest/60 text-base md:text-lg leading-relaxed font-light italic">
                            "Carolina é a alma por trás da M★BRAVO. O que começou como um fascínio pelo ritmo das agulhas transformou-se num compromisso consciente. Para ela, cada peça é um diálogo entre a tradição do artesanal e a visão contemporânea da moda."
                        </p>
                    </div>

                    <div className="pt-6">
                        <a href="#colecao" className="group relative inline-flex items-center gap-6 px-10 py-5 bg-forest text-cream rounded-full overflow-hidden transition-all duration-500 hover:pr-14">
                            <span className="relative z-10 text-xs uppercase tracking-[0.3em] font-semibold">Explorar Galeria</span>
                            <div className="absolute right-4 w-10 h-10 bg-cream text-forest rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-6">
                                <ArrowRight size={18} />
                            </div>
                        </a>
                    </div>
                </motion.div>
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
        <section ref={containerRef} id="feeling" data-background="dark" className="bg-forest py-48 md:py-80 relative overflow-hidden">
            <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute inset-0 pointer-events-none text-cream text-[35vw] leading-none italic font-light whitespace-nowrap text-center flex items-center justify-center select-none"
            >
                Handmade
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="max-w-3xl mb-32">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[10px] uppercase tracking-[0.4em] font-bold text-cream/30 mb-6 block"
                    >
                        Filosofia de Criação
                    </motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="text-6xl md:text-8xl font-serif text-cream leading-tight mb-12"
                    >
                        O Ritmo do Coração <br />
                        <span className="italic font-normal text-brand-green-light">em Cada Ponto.</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-cream/50 text-xl md:text-2xl font-light leading-relaxed"
                    >
                        Há uma poesia intrínseca no ato de dar um nó: é o compromisso entre a memória e o presente. Cada criação é uma experiência sensorial, desenhada para ser sentida na pele e guardada na alma. É o aconchego de uma tarde de outono, o detalhe que interrompe a rotina e o sentimento de que o luxo, no seu estado mais puro, é aquilo que é feito exclusivamente para nós, com o carinho que só uma vida de dedicação consegue transmitir.
                    </motion.p>
                </div>

                {/* Minimalist Details Gallery */}
                <div className="grid grid-cols-12 gap-6 md:gap-12">
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
                    <div className="col-span-12 md:col-span-5 flex flex-col gap-6 md:gap-12 justify-center">
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

interface ProductCardProps {
    product: any;
    i: number;
    isFocused: boolean;
    isSubdued: boolean;
    onFocus: (id: string | null) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, i, isFocused, isSubdued, onFocus }) => {
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

    const productImages = product.images || [product.img];

    useEffect(() => {
        setActiveImgIndex(0);
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

    return (
        <motion.div 
            ref={cardRef}
            layout
            layoutId={product.id}
            className={`group relative flex flex-col h-full transition-all duration-500 overflow-hidden ${
                isFocused 
                    ? 'w-full max-w-6xl mx-auto bg-white z-50 rounded-[2rem] p-8 md:p-12 shadow-2xl' 
                    : 'bg-white rounded-[12px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(36,49,25,0.15)] hover:-translate-y-2'
            }`}
        >
            <div className={`flex flex-col h-full ${isFocused ? 'lg:grid lg:grid-cols-2 lg:gap-16' : ''}`}>
                {/* Image Container with Fixed Aspect Ratio */}
                <div 
                    className={`relative overflow-hidden ${isFocused ? 'rounded-[1.5rem] h-full min-h-[400px]' : 'aspect-[4/5] rounded-t-[12px] cursor-pointer'}`}
                    onClick={!isFocused ? handleToggle : undefined}
                >
                    <div className="relative w-full h-full overflow-hidden bg-cream/20">
                        <AnimatePresence mode="popLayout">
                            {(() => {
                                const currentImg = productImages[activeImgIndex];
                                const isSpecialDragonfly = currentImg && /Headband-Dragonfly-4/i.test(currentImg);
                                return (
                                    <motion.img 
                                        key={activeImgIndex}
                                        src={currentImg} 
                                        alt={`${product.name} - Imagem ${activeImgIndex + 1}`} 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`w-full h-full ${
                                            isSpecialDragonfly 
                                                ? 'object-contain p-2 bg-[#FAF8F5]' 
                                                : 'object-cover'
                                        } ${!isFocused ? 'group-hover:scale-105' : ''}`}
                                        style={{ transition: 'transform 1s ease' }}
                                    />
                                );
                            })()}
                        </AnimatePresence>
                    </div>

                    {!isFocused && (
                        <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <span className="bg-forest/80 backdrop-blur-md text-white text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold">
                                M★BRAVO
                            </span>
                        </div>
                    )}

                    {/* Interactive Gallery Overlays */}
                    {productImages.length > 1 && (
                        <>
                            {/* Navigation Arrows */}
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none z-20">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveImgIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
                                    }}
                                    className="w-10 h-10 rounded-full bg-white/75 backdrop-blur-md shadow-md flex items-center justify-center text-forest pointer-events-auto opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-forest hover:text-cream transition-all duration-300"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveImgIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
                                    }}
                                    className="w-10 h-10 rounded-full bg-white/75 backdrop-blur-md shadow-md flex items-center justify-center text-forest pointer-events-auto opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-forest hover:text-cream transition-all duration-300"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Bullet navigation dot indicators at bottom center */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-forest/20 backdrop-blur-md px-3.5 py-2 rounded-full">
                                {productImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImgIndex(idx);
                                        }}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeImgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white'}`}
                                    />
                                ))}
                            </div>

                            {/* Luxury Mini-Thumbnails Strip in Focus Mode */}
                            {isFocused && (
                                <div className="absolute bottom-4 left-4 z-20 flex gap-1.5 overflow-x-auto no-scrollbar max-w-[calc(100%-2rem)] p-1 bg-white/30 backdrop-blur-md rounded-xl">
                                    {productImages.map((imgUrl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveImgIndex(idx);
                                            }}
                                            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${idx === activeImgIndex ? 'border-forest scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        >
                                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Content Section */}
                <div className={`${isFocused ? 'py-8 flex flex-col h-full' : 'p-6 flex flex-col justify-between flex-grow bg-white'}`}>
                    {!isFocused ? (
                        <>
                            <div>
                                <h3 className="text-xl font-serif font-normal tracking-wide text-forest mb-1">{product.name}</h3>
                                <p className="text-forest/40 text-[9px] uppercase tracking-[0.3em] font-medium mb-4 font-sans">HANDMADE EXCLUSIVE</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-base font-sans font-semibold tracking-wider text-forest/80">{product.price}</span>
                                <button 
                                    onClick={handleToggle}
                                    className="p-2 rounded-full bg-forest text-cream hover:bg-brand-green-light transition-colors shadow-lg"
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <AnimatePresence>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[9px] uppercase tracking-[0.4em] text-forest/35 block mb-2 font-sans font-semibold">A personalizar...</span>
                                        <h3 className="text-4xl md:text-5xl font-serif font-normal text-forest tracking-wide">{product.name}</h3>
                                        {product.description && (
                                            <p className="mt-4 text-sm text-forest/70 leading-relaxed font-light font-sans whitespace-pre-line">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>
                                    <button 
                                        onClick={handleToggle}
                                        className="p-3 rounded-full bg-forest/5 text-forest hover:bg-forest hover:text-cream transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Customization Controls */}
                                <div className="space-y-10">
                                    {/* Color selection */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest/40 flex items-center gap-2">
                                                <span className="text-[#C5A059] text-xs">●</span> COR
                                            </h5>
                                            <AnimatePresence mode="wait">
                                                <motion.span 
                                                    key={selections.cor}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="text-[9px] font-extrabold text-[#A68244] bg-[#FDF9F3] px-3.5 py-1 rounded-full uppercase tracking-widest border border-[#C5A059]/10"
                                                >
                                                    {selections.cor}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {colors.map(opt => (
                                                <button 
                                                    key={opt.name}
                                                    onClick={() => setSelections(prev => ({ ...prev, cor: opt.name }))}
                                                    className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 ${
                                                        selections.cor === opt.name ? 'border-forest scale-110' : 'border-transparent hover:scale-110'
                                                    }`}
                                                    title={opt.name}
                                                >
                                                    <div className="w-full h-full rounded-full" style={{ backgroundColor: opt.hex }} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Size or Quantity controls */}
                                    {hasSize && (
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest/40 flex items-center gap-2">
                                                <span className="text-[#C5A059] text-xs">●</span> TAMANHO
                                            </h5>
                                            <div className="flex gap-2">
                                                {sizes.map(opt => (
                                                    <button 
                                                        key={opt}
                                                        onClick={() => setSelections(prev => ({ ...prev, tamanho: opt }))}
                                                        className={`rounded-full px-6 py-2 border border-forest transition-all duration-300 text-xs font-bold ${
                                                            selections.tamanho === opt 
                                                                ? 'bg-forest text-cream shadow-md scale-105' 
                                                                : 'bg-white text-forest hover:bg-forest/5'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
 
                                    {hasQuantity && (
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest/40 flex items-center gap-2">
                                                <span className="text-[#C5A059] text-xs">●</span> QUANTIDADE
                                            </h5>
                                            <div className="flex gap-2">
                                                {quantities.map(opt => (
                                                    <button 
                                                        key={opt}
                                                        onClick={() => setSelections(prev => ({ ...prev, quantidade: opt }))}
                                                        className={`rounded-full px-6 py-2 border border-forest transition-all duration-300 text-xs font-bold ${
                                                            selections.quantidade === opt 
                                                                ? 'bg-forest text-cream shadow-md scale-105' 
                                                                : 'bg-white text-forest hover:bg-forest/5'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
 
                                    {/* Final Summary Component (WhatsApp) */}
                                    <div className="bg-forest text-cream rounded-2xl p-6 shadow-xl relative overflow-hidden mt-8">
                                        <div className="flex justify-between items-baseline mb-6 pb-4 border-b border-cream/10">
                                            <h4 className="text-[13px] uppercase tracking-[0.4em] font-extrabold text-[#C5A059]">SPEOS</h4>
                                            <span className="text-2xl font-serif text-cream font-medium tracking-tight">{currentPrice}</span>
                                        </div>

                                        <div className="space-y-3.5 mb-6 text-xs uppercase tracking-wider text-cream/75 font-light">
                                            <div className="flex justify-between items-center border-b border-cream/10 pb-2">
                                                <span className="text-cream/40 text-[10px] tracking-[0.2em]">COR</span>
                                                <span className="text-cream font-light">{selections.cor || 'Verde Musgo'}</span>
                                            </div>
                                            {hasSize && (
                                                <div className="flex justify-between items-center border-b border-cream/10 pb-2">
                                                    <span className="text-cream/40 text-[10px] tracking-[0.2em]">TAMANHO</span>
                                                    <span className="text-cream font-light">{selections.tamanho}</span>
                                                </div>
                                            )}
                                            {hasQuantity && (
                                                <div className="flex justify-between items-center border-b border-cream/10 pb-2">
                                                    <span className="text-cream/40 text-[10px] tracking-[0.2em]">QUANTIDADE</span>
                                                    <span className="text-cream font-light">{selections.quantidade}</span>
                                                </div>
                                            )}
                                            {product.dimensions && (
                                                <div className="flex justify-between items-center border-b border-cream/10 pb-2">
                                                    <span className="text-cream/40 text-[10px] tracking-[0.2em]">DIMENSÕES</span>
                                                    <span className="text-cream font-light">{product.dimensions}</span>
                                                </div>
                                            )}
                                            {product.details && (
                                                <div className="flex justify-between items-start border-b border-cream/10 pb-2">
                                                    <span className="text-cream/40 text-[10px] tracking-[0.2em] mt-0.5">DETALHES</span>
                                                    <span className="text-cream font-light text-right max-w-[70%] whitespace-pre-line text-[11px] leading-relaxed">{product.details}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <motion.a 
                                            href={whatsappUrl}
                                            target="_blank"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full rounded-full py-4 text-center font-semibold transition-all duration-300 bg-[#C5A059] text-forest block uppercase tracking-widest text-xs cursor-pointer shadow-lg hover:bg-[#d0ab64] border border-[#C5A059]/10"
                                        >
                                            ENVIAR PEDIDO
                                        </motion.a>
                                    </div>

                                    {/* Detailed Info - Below Button */}
                                    <div className="space-y-6 pt-6 border-t border-forest/5 mt-8 text-left">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest/40 block mb-2">Composição</span>
                                            <p className="text-sm text-forest/75 leading-relaxed font-light whitespace-pre-line">{materialText}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest/40 block mb-2">Manutenção</span>
                                            <p className="text-sm text-forest/75 leading-relaxed font-light whitespace-pre-line">{careText}</p>
                                        </div>
                                        {product.details && (
                                            <div>
                                                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest/40 block mb-2">Detalhes do Produto</span>
                                                <p className="text-sm text-forest/75 leading-relaxed font-light whitespace-pre-line">{product.details}</p>
                                            </div>
                                        )}
                                        <div className="pt-2">
                                            <p className="text-xs text-brand-green-light italic leading-relaxed font-medium">{finalNote}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </motion.div>
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

    // Reset focused product when changing category
    useEffect(() => {
        setFocusedProductId(null);
    }, [selectedCategory]);

    return (
        <section ref={containerRef} id="collection" data-background="light" className="py-32 md:py-64 bg-cream min-h-screen relative overflow-hidden">
            <motion.div 
                style={{ x: xTrack, y: yTrack, opacity: opacityTrack, fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute inset-0 pointer-events-none text-forest text-[35vw] leading-none italic font-light whitespace-nowrap text-center flex items-center justify-center select-none"
            >
                M★Bravo
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 mb-40 text-center relative z-10">
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
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
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
                            <AnimatePresence mode="wait">
                                {!focusedProductId ? (
                                    <motion.div 
                                        key="carousel-container"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                    >
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
                                                            isSubdued={false}
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
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="focused-product"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="pt-4"
                                    >
                                        <ProductCard 
                                            product={activeCategory?.products.find(p => p.id === focusedProductId)} 
                                            i={0} 
                                            isFocused={true}
                                            isSubdued={false}
                                            onFocus={setFocusedProductId}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Backdrop Overlay to close customization */}
                            <AnimatePresence>
                                {focusedProductId && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.2 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setFocusedProductId(null)}
                                        className="fixed inset-0 bg-forest z-10 cursor-pointer"
                                    />
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
        <section ref={containerRef} id="contacto" data-background="dark" className="py-32 md:py-64 bg-forest relative overflow-hidden">
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
                    <h2 className="text-5xl md:text-8xl font-serif text-cream mb-12">Entre no nosso <br /><span className="italic">Universo.</span></h2>
                    <p className="text-cream/50 text-xl font-light mb-16 leading-relaxed">
                        Deseja uma peça personalizada ou simplesmente quer saber mais sobre o nosso processo? Estamos a um ponto de distância.
                    </p>
                    
                    <div className="flex flex-col items-center gap-8">
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

                <div className="mt-32 flex flex-wrap justify-center gap-12">
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
                    <div className="relative z-10 text-center px-6">
                        <h2 className="text-cream font-serif italic text-4xl md:text-7xl leading-tight">
                            "A beleza está na alma <br /> que colocamos em cada gesto."
                        </h2>
                    </div>
                </div>

                <ContactSection />
            </div>
            
            <Footer />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
