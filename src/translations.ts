// /src/translations.ts

import { useState, useEffect } from 'react';

export function useLanguage() {
  const [lang, setLang] = useState<'pt' | 'en'>(() => {
    const saved = localStorage.getItem('mbravo_lang');
    if (saved === 'EN' || saved === 'en') return 'en';
    return 'pt';
  });

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<'PT' | 'EN'>;
      setLang(customEvent.detail.toLowerCase() as 'pt' | 'en');
    };

    window.addEventListener('mbravo-lang-change', handleLangChange);
    return () => {
      window.removeEventListener('mbravo-lang-change', handleLangChange);
    };
  }, []);

  const t = (key: string): string => {
    let finalKey = key;
    if (key === 'story.badge') finalKey = 'story.tag';
    else if (key === 'story.title.part1') finalKey = 'story.title_1';
    else if (key === 'story.title.part2') finalKey = 'story.title_2';
    else if (key === 'story.subtitle') finalKey = 'story.subtitle_1';
    else if (key === 'story.subtitle2') finalKey = 'story.subtitle_2';
    else if (key === 'story.mantra1') finalKey = 'story.mantra_1';
    else if (key === 'story.mantra2') finalKey = 'story.mantra_2';
    else if (key === 'manifesto.choice') finalKey = 'manifesto.tag';
    else if (key === 'manifesto.title') finalKey = 'manifesto.title_1';
    else if (key === 'manifesto.subtitle') finalKey = 'manifesto.title_2';
    else if (key === 'manifesto.pillar1.num') finalKey = 'manifesto.p1_num';
    else if (key === 'manifesto.pillar1.title') finalKey = 'manifesto.p1_title';
    else if (key === 'manifesto.pillar1.p1') finalKey = 'manifesto.p1_desc_1';
    else if (key === 'manifesto.pillar1.p2') finalKey = 'manifesto.p1_desc_2';
    else if (key === 'manifesto.pillar1.p3') finalKey = 'manifesto.p1_desc_3';
    else if (key === 'manifesto.pillar2.num') finalKey = 'manifesto.p2_num';
    else if (key === 'manifesto.pillar2.title') finalKey = 'manifesto.p2_title';
    else if (key === 'manifesto.pillar2.p1') finalKey = 'manifesto.p2_desc_1';
    else if (key === 'manifesto.pillar2.p2') finalKey = 'manifesto.p2_desc_2';
    else if (key === 'manifesto.pillar2.p3') finalKey = 'manifesto.p2_desc_3';
    else if (key === 'manifesto.pillar3.num') finalKey = 'manifesto.p3_num';
    else if (key === 'manifesto.pillar3.title') finalKey = 'manifesto.p3_title';
    else if (key === 'manifesto.pillar3.p1') finalKey = 'manifesto.p3_desc_1';
    else if (key === 'manifesto.pillar3.p2') finalKey = 'manifesto.p3_desc_2';
    else if (key === 'manifesto.pillar3.p3') finalKey = 'manifesto.p3_desc_3';
    else if (key === 'manifesto.pillar4.num') finalKey = 'manifesto.p4_num';
    else if (key === 'manifesto.pillar4.title') finalKey = 'manifesto.p4_title';
    else if (key === 'manifesto.pillar4.p1') finalKey = 'manifesto.p4_desc_1';
    else if (key === 'manifesto.pillar4.p2') finalKey = 'manifesto.p4_desc_2';
    else if (key === 'manifesto.pillar4.p3') finalKey = 'manifesto.p4_desc_3';
    else if (key === 'feeling.badge') finalKey = 'feeling.tag';
    else if (key === 'feeling.title.part1') finalKey = 'feeling.title_1';
    else if (key === 'feeling.title.part2') finalKey = 'feeling.title_2';

    if (finalKey === 'feeling.p1') {
      return lang === 'pt'
        ? "Há algo especial em criar com as próprias mãos. Cada ponto nasce de um gesto simples, repetido com calma, até ganhar forma, textura e significado."
        : "There is something special about creating with your own hands. Each stitch is born from a simple gesture, repeated with calm, until it takes shape, texture, and meaning.";
    }
    if (finalKey === 'feeling.p2') {
      return lang === 'pt'
        ? "Enquanto as peças crescem, também crescem as memórias, os pensamentos e as histórias que as acompanham."
        : "As the pieces grow, so do the memories, thoughts, and stories that accompany them.";
    }
    if (finalKey === 'feeling.p3') {
      return lang === 'pt'
        ? "Talvez seja por isso que o handmade nos toca de forma diferente. Porque não transporta apenas matéria. Transporta tempo – e tudo aquilo que sentimos enquanto criamos."
        : "Perhaps that is why handmade touches us differently. Because it does not just carry material. It carries time – and everything we feel while we create.";
    }

    const dict = (translations[lang] || translations.pt) as Record<string, string>;
    return dict[finalKey] || dict[key] || key;
  };

  return { lang, t };
}

export function translateProduct(product: any, lang: 'pt' | 'en') {
  if (!product) return product;
  const pData = (translatedProductsData[lang] as Record<string, any>)?.[product.id];
  if (!pData) {
    // If id is numeric (e.g., 1, 2, 3 for PRODUCTS)
    if (product.id === 1 || product.id === '1') {
      return {
        ...product,
        desc: lang === 'pt' 
          ? 'Um volume arquitetónico que desafia a gravidade, marcado pela assinatura linear de Carolina. Cada ponto é uma coordenada num mapa de luxo sensorial.'
          : 'An architectural volume that defies gravity, marked by Carolina\'s linear signature. Each stitch is a coordinate on a map of sensory luxury.'
      };
    }
    if (product.id === 2 || product.id === '2') {
      return {
        ...product,
        desc: lang === 'pt'
          ? 'A fluidez da malha encontra o design de impacto. Uma peça que carrega o DNA autoral da marca em texturas que parecem esculpidas pela luz.'
          : 'The fluidity of knitwear meets high-impact design. A piece carrying the brand\'s authorial DNA in textures that seem sculpted by light.'
      };
    }
    if (product.id === 3 || product.id === '3') {
      return {
        ...product,
        desc: lang === 'pt'
          ? 'O equilíbrio perfeito entre o saber-fazer manual e o utilitarismo futurista. Uma declaração de exclusividade gravada em cada entrelaçar de fio.'
          : 'The perfect balance between manual craftsmanship and futuristic utilitarianism. A declaration of exclusivity engraved in every weave of thread.'
      };
    }
    return product;
  }
  
  return {
    ...product,
    name: pData.name || product.name,
    description: pData.description || product.description,
    material: pData.material || product.material,
    care: pData.care || product.care,
    details: pData.details || product.details,
    sizes: pData.sizes || product.sizes,
    dimensions: pData.dimensions || product.dimensions
  };
}

export function translateCategory(category: any, lang: 'pt' | 'en') {
  if (!category) return category;
  const match = (translatedCategories[lang] || translatedCategories.pt).find(c => c.id === category.id);
  if (!match) return category;
  return {
    ...category,
    name: match.name,
    items: match.items,
    products: (category.products || [])
      .filter((p: any) => !p.hidden)
      .map((p: any) => translateProduct(p, lang))
  };
}

export const translations = {
  pt: {
    "brand.slogan": "Cada ponto guarda uma memória.",
    "brand.subheadline": "Peças feitas com tempo, amor e memória.",
    "loading.slogan": "Peças feitas com tempo, amor e memória.",
    
    // Navigation
    "nav.home": "Início",
    "nav.story": "História",
    "nav.philosophy": "Essência",
    "nav.collection": "Coleção",
    "nav.contacts": "Contactos",
    "nav.shipping_returns": "Envios e Devoluções",
    "nav.privacy_policy": "Política de Privacidade",
    "nav.terms_of_service": "Termos de Serviço",
    "nav.exclusive": "EXCLUSIVO M★BRAVO",
    "nav.close": "Fechar",
    
    // Buttons
    "btn.add_to_cart": "Adicionar ao Carrinho",
    "btn.back_collection": "Voltar à Coleção",
    "btn.explore": "Contemplar a Matéria",
    "btn.close": "Fechar",
    "btn.discover_philosophy": "Sentir a Essência",
    
    // Story Section
    "story.tag": "MEMÓRIA CRUA",
    "story.title_1": "Tudo começou com",
    "story.title_2": "uma memória.",
    "story.subtitle_1": "Antes de existir uma marca, existia uma história.",
    "story.subtitle_2": "Uma história feita de afeto, de tempo e de momentos que permanecem mesmo quando os dias passam.",
    "story.p1": "M★Bravo nasceu desse sentimento.",
    "story.p2": "Cada peça é criada à mão, com calma e pureza, respeitando o tempo que as coisas realmente importantes merecem.",
    "story.mantra_1": "Porque algumas histórias não foram feitas para ficarem guardadas.",
    "story.mantra_2": "Foram feitas para serem sentidas.",
    "story.cta": "Contemplar a Matéria",
    
    // Made with Time Section
    "manifesto.tag": "A ESCOLHA",
    "manifesto.title_1": "Feito com Tempo.",
    "manifesto.title_2": "O ritmo calmo de tudo o que merece permanência.",
    "manifesto.quote": "Há histórias que só as mãos sabem contar.",
    "manifesto.imageQuote": "A delicadeza do tempo em cada detalhe.",
    
    "manifesto.p1_num": "01 / ARTESÃO",
    "manifesto.p1_title": "Algumas coisas precisam de tempo para nascer.",
    "manifesto.p1_desc_1": "Não acredito em apressar aquilo que realmente importa.",
    "manifesto.p1_desc_2": "Cada peça começa em silêncio, crescendo ponto a ponto, respeitando seu próprio ritmo.",
    "manifesto.p1_desc_3": "Porque as coisas mais importantes da vida não são criadas à pressa.",
    
    "manifesto.p2_num": "02 / EXCLUSIVO",
    "manifesto.p2_title": "Nenhuma memória nasce duas vezes.",
    "manifesto.p2_desc_1": "Raramente procuro recriar uma peça exatamente da mesma forma.",
    "manifesto.p2_desc_2": "Tal como as memórias, cada criação carrega o seu próprio caráter, as suas imperfeições e a sua história.",
    "manifesto.p2_desc_3": "É aí que vive a sua beleza.",
    
    "manifesto.p3_num": "03 / CONSCIENTE",
    "manifesto.p3_title": "A criação acontece no silêncio.",
    "manifesto.p3_desc_1": "Muitas ideias nascem entre fios, pensamentos e momentos de quietude.",
    "manifesto.p3_desc_2": "O processo nunca é acelerado.",
    "manifesto.p3_desc_3": "É neste ritmo mais lento que os detalhes se revelam e a inspiração encontra o seu lugar.",
    
    "manifesto.p4_num": "04 / EMOCIONAL",
    "manifesto.p4_title": "O verdadeiro valor é aquilo que permanece.",
    "manifesto.p4_desc_1": "O valor de uma peça artesanal não vive apenas nos materiais.",
    "manifesto.p4_desc_2": "Vive no cuidado, na intenção e na emoção transportada em cada ponto.",
    "manifesto.p4_desc_3": "Muito depois de o fio ser tecido, o sentimento permanece.",
    
    // Knot Section
    "feeling.tag": "Filosofia de Criação",
    "feeling.title_1": "O Ritmo do Coração",
    "feeling.title_2": "em Cada Ponto.",
    "feeling.desc": "Há algo especial em criar com as próprias mãos. Cada ponto nasce de um gesto simples, repetido com calma, até ganhar forma, textura e significado.\n\nEnquanto as peças crescem, também crescem as memórias, os pensamentos e as histórias que as acompanham.\n\nTalvez seja por isso que o handmade nos toca de forma diferente. Porque não transporta apenas matéria. Transporta tempo – e tudo aquilo que sentimos enquanto criamos.",
    "feeling.label": "Premium / Bags",
    "feeling.caption": "A trama que define o DNA Bravo.",
    "feeling.desc_2": "A trama que define o DNA Bravo.",
    
    // Collection Section
    "collection.tag": "PRODUTOS",
    "collection.subtitle": "O que começou como gesto torna-se matéria.",
    "collection.category": "Categoria:",
    
    // Contact Section
    "contact.title_1": "Entre no nosso",
    "contact.title_2": "Universo.",
    "contact.subtitle": "Deseja uma peça personalizada ou simplesmente quer saber mais sobre o nosso processo? Estamos a um ponto de distância.",
    "contact.chat_whatsapp": "Conversar via WhatsApp",
    
    // Footer
    "footer.legal_shipping": "Envios e Devoluções",
    "footer.legal_privacy": "Política de Privacidade",
    "footer.legal_terms": "Termos de Serviço",
    "footer.support": "Apoio ao Cliente",
    "footer.made_in": "© 2026 M★BRAVO | Handmade with Love \nCriado com tempo, em Portugal.",
    
    // Memory Continues
    "memory.tag": "A MEMÓRIA CONTINUA",
    "memory.title": "Há histórias que não desaparecem.",
    "memory.subtitle": "Continuam presentes nos gestos, nas memórias e nas pequenas coisas que criamos com amor.",
    "memory.mbravo_born": "M★Bravo nasceu dessa presença.",
    "memory.desc": "Cada ponto, cada textura e cada detalhe transportam um pedaço dessa história, transformando fios em peças únicas e memórias em algo que pode ser tocado.",
    "memory.quote": "\"Mais do que crochet, é uma forma de preservar aquilo que realmente importa.\"",
    
    // Interlude
    "interlude.quote": "\"A beleza está na alma que colocamos em cada gesto.\"",
    "interlude.sub": "\"Peças criadas com tempo, amor e memória.\"",
    "instagram.feed.title": "Siga-nos no Instagram",
    "instagram.feed.handle": "@mbravobycarolina",
    "instagram.feed.view_profile": "Ver Perfil",
    
    // ProductCard Details
    "product.exclusive": "EXCLUSIVO M★BRAVO",
    "product.details_title": "DETALHES DO PRODUTO",
    "product.color": "COR DA PEÇA",
    "product.yarn_color": "COR DO FIO",
    "product.size": "TAMANHO DA PEÇA",
    "product.quantity": "QUANTIDADE DE BASES",
    "product.material_label": "COMPOSIÇÃO & MATÉRIA",
    "product.care_label": "CUIDADOS & LAVAGEM",
    "product.whatsapp_cta": "ENCOMENDAR VIA WHATSAPP",
    "product.checkout_cta": "PERSONALIZAR & COMPRAR",
    "product.prev": "Produto Anterior",
    "product.next": "Próximo Produto",
    "product.close": "Fechar",
    "product.zoom": "Clique para ampliar a matéria",
    "product.custom_yarn_placeholder": "Fio de algodão certificado tecelagem manual",
    "product.final_note": "Cada peça M★BRAVO é tecida manualmente com fios certificados, garantindo exclusividade em cada detalhe.",
    "product.care.handwash": "LAVAGEM À MÃO",
    "product.care.dryflat": "SECAR HORIZONTAL",
    "product.care.notumble": "SEM SECADORA",
    "product.care.nowring": "EVITAR TORCER",
    "product.dimensions": "DIMENSÕES",
    "product.selected_config": "CONFIGURAÇÃO SELECIONADA",
    "product.secure_checkout": "COMPRA SEGURA",
    "product.instant_buy": "COMPRA IMEDIATA",
    "product.customize_design": "Personalizar o meu Design",
    "product.total_amount": "IMPORTE TOTAL",
    "product.customize_whatsapp": "Personalizar o meu Design (WhatsApp)",
    "product.care_header": "MANUTENÇÃO & CUIDADOS",
    
    // Checkout Step 1
    "checkout.shipping_title": "1. DADOS DE ENVIO & CONTATO",
    "checkout.nome": "Nome Completo",
    "checkout.email": "E-mail",
    "checkout.phone": "Telemóvel",
    "checkout.address": "Morada de Envio",
    "checkout.postal": "Código Postal",
    "checkout.city": "Cidade",
    
    // Checkout Step 2
    "checkout.payment_title": "2. MÉTODO DE PAGAMENTO",
    "checkout.mbway_label": "Telemóvel Associado ao MB WAY",
    "checkout.mbway_placeholder": "9xx xxx xxx",
    "checkout.mbway_instructions": "Irá receber uma notificação na aplicação MB WAY para autorizar o pagamento no valor de",
    "checkout.multibanco_title": "DADOS DE PAGAMENTO (ENTIDADE & REFERÊNCIA)",
    "checkout.multibanco_entity": "Entidade",
    "checkout.multibanco_ref": "Referência",
    "checkout.multibanco_amount": "Montante",
    "checkout.multibanco_instructions": "Efetue o pagamento num terminal Multibanco ou através do seu Homebanking usando a opção \"Pagamento de Serviços\".",
    "checkout.card_title": "Detalhes do Cartão",
    "checkout.card_name": "Nome no Cartão",
    "checkout.card_number": "Número do Cartão",
    "checkout.card_expiry": "MM/AA",
    "checkout.card_cvv": "CVV",
    
    // Order Receipts & Communication Hub
    "sandbox.title": "Comprovativos de Encomenda",
    "sandbox.email_sim": "Comprovativos & E-mails de Confirmação",
    "sandbox.email_desc": "Aceda aos comprovativos digitais e notificações de atelier gerados em tempo real:",
    "sandbox.view_client": "Ver Recibo do Cliente",
    "sandbox.view_admin": "Ver Notificação Atelier",
    "sandbox.ship_order": "Expedir Encomenda (CTT)",
    "sandbox.view_shipped": "Ver Notificação de Envio",
    "sandbox.mbway_fast": "Aprovação Rápida",
    "sandbox.mbway_rej": "Rejeição de MB WAY",
    "sandbox.mbway_timeout": "Expiração/Timeout",
    "sandbox.mbway_tip": "Escreve o número abaixo para simular diferentes comportamentos:",
    "sandbox.card_fail_funds": "Saldo Insuficiente",
    "sandbox.card_fail_timeout": "Tempo Limite de Gateway",
    "sandbox.card_success": "Qualquer outra numeração simula aprovação de Sucesso imediato.",
    "sandbox.multibanco_tip": "Após efetuar a encomenda, o botão de pagamento abaixo simula o recebimento do webhook em tempo real.",
    "sandbox.mbway_phone_note_fast": "Escreve 911 111 111 para simular Aprovação Rápida.",
    "sandbox.mbway_phone_note_rej": "Escreve 922 222 222 para simular Rejeição de MB WAY.",
    "sandbox.mbway_phone_note_timeout": "Escreve 933 333 333 para simular Expiração/Timeout.",
    "sandbox.card_note_funds": "Termina em 5001 para simular Saldo Insuficiente.",
    "sandbox.card_note_timeout": "Termina em 5002 para simular Tempo Limite de Gateway.",
    
    // Payment actions
    "payment.btn_webhook": "SIMULAR PAGAMENTO WEBHOOK",
    "payment.btn_multibanco": "GERAR REFERÊNCIA MULTIBANCO",
    "payment.btn_order": "EFETUAR ENCOMENDA",
    "payment.waiting_mbway": "A AGUARDAR AUTORIZAÇÃO MB WAY...",
    "payment.connecting": "CONECTANDO GATEWAY...",
    "payment.success_title": "Encomenda Recebida com Sucesso!",
    "payment.success_desc": "Obrigado pela sua encomenda na M★BRAVO.",
    "payment.success_email_note": "Foi enviado um e-mail de confirmação para o seu endereço de e-mail.",
    "payment.btn_home": "Fechar e Voltar ao Início",
    "payment.error_header": "Erro ou Falha de Pagamento",
    "payment.error_default": "Ocorreu um erro ao processar o seu pagamento.",
    "payment.error_timeout": "O tempo limite de aprovação MB WAY expirou (Simulação de Exceção/Timeout).",
    "payment.prod_note_title": "Nota de Produção:",
    "payment.prod_note_desc": "Por ser uma peça produzida inteiramente à mão, estimamos o tempo de produção e envio em 7 a 14 dias úteis.",
    
    // Testimonials
    "testimonials.tag": "TESTEMUNHOS",
    "testimonials.title": "Partilhado por Quem nos Escolhe",
    "testimonials.subtitle": "O que dizem aqueles que vestem as nossas histórias.",
    "testimonials.write_button": "Escrever comentário",
    "testimonials.modal_title": "Deixe o seu Testemunho",
    "testimonials.label_name": "O seu Nome",
    "testimonials.label_text": "O seu Comentário",
    "testimonials.label_product": "Peça Adquirida (ex: Mala Daisy)",
    "testimonials.submit_button": "Publicar Testemunho",
    "testimonials.success_message": "Muito obrigado! O seu testemunho foi adicionado com sucesso.",
    "testimonial.1.name": "Maria S.",
    "testimonial.1.text": "A mala Daisy é ainda mais bonita ao vivo... O trabalho e o detalhe das flores de crochet são admiráveis, nota-se o amor em cada linha.",
    "testimonial.1.product": "Mala Daisy",
    "testimonial.2.name": "Carolina P.",
    "testimonial.2.text": "Os coasters dão um toque único à mesa. São super delicados, mas nota-se logo a excelente qualidade do material.",
    "testimonial.2.product": "Daisy Coasters",
    "testimonial.3.name": "Emma W.",
    "testimonial.3.text": "A mala Granny Square superou todas as minhas expectativas. É lindíssima, super robusta e cabe perfeitamente tudo o que preciso no dia a dia.",
    "testimonial.3.product": "Mala Granny Square",
    "testimonial.4.name": "Joana R.",
    "testimonial.4.text": "Comprei o biquíni Marea e o caimento é impecável. A minúcia do trabalho manual e o toque do algodão orgânico são indescritíveis.",
    "testimonial.4.product": "Marea Bikini Set",
    "testimonial.5.name": "Teresa B.",
    "testimonial.5.text": "O cardigan Alma é uma peça intemporal de um conforto absoluto. Recebo elogios sempre que o uso, uma verdadeira obra de arte!",
    "testimonial.5.product": "Alma Cardigan"
  },
  en: {
    "brand.slogan": "Every stitch holds a memory.",
    "brand.subheadline": "Pieces crafted with time, love, and memory.",
    "loading.slogan": "Pieces crafted with time, love, and memory.",
    
    // Navigation
    "nav.home": "Home",
    "nav.story": "Story",
    "nav.philosophy": "Essence",
    "nav.collection": "Collection",
    "nav.contacts": "Contacts",
    "nav.shipping_returns": "Shipping & Returns",
    "nav.privacy_policy": "Privacy Policy",
    "nav.terms_of_service": "Terms of Service",
    "nav.exclusive": "M★BRAVO EXCLUSIVE",
    "nav.close": "Close",
    
    // Buttons
    "btn.add_to_cart": "Add to Cart",
    "btn.back_collection": "Back to Collection",
    "btn.explore": "Contemplate the Matter",
    "btn.close": "Close",
    "btn.discover_philosophy": "Feel the Essence",
    
    // Story Section
    "story.tag": "RAW MEMORY",
    "story.title_1": "It all started with",
    "story.title_2": "a memory.",
    "story.subtitle_1": "Before there was a brand, there was a story.",
    "story.subtitle_2": "A story made of affection, time, and moments that remain even as days pass.",
    "story.p1": "M★Bravo was born from this feeling.",
    "story.p2": "Each piece is handcrafted with calmness and purity, respecting the time that truly important things deserve.",
    "story.mantra_1": "Because some stories were not meant to be kept away.",
    "story.mantra_2": "They were meant to be felt.",
    "story.cta": "Contemplate the Matter",
    
    // Made with Time Section
    "manifesto.tag": "THE CHOICE",
    "manifesto.title_1": "Made with Time.",
    "manifesto.title_2": "The calm rhythm of everything that deserves permanence.",
    "manifesto.quote": "There are stories that only hands know how to tell.",
    "manifesto.imageQuote": "The delicateness of time in every detail.",
    
    "manifesto.p1_num": "01 / ARTISAN",
    "manifesto.p1_title": "Some things need time to be born.",
    "manifesto.p1_desc_1": "I don't believe in rushing what truly matters.",
    "manifesto.p1_desc_2": "Each piece begins in silence, growing stitch by stitch, respecting its own rhythm.",
    "manifesto.p1_desc_3": "Because the most important things in life are not created in a rush.",
    
    "manifesto.p2_num": "02 / EXCLUSIVE",
    "manifesto.p2_title": "No memory is born twice.",
    "manifesto.p2_desc_1": "I rarely seek to recreate a piece in exactly the same way.",
    "manifesto.p2_desc_2": "Just like memories, each creation carries its own character, its imperfections, and its history.",
    "manifesto.p2_desc_3": "That is where its beauty lives.",
    
    "manifesto.p3_num": "03 / CONSCIOUS",
    "manifesto.p3_title": "Creation happens in silence.",
    "manifesto.p3_desc_1": "Many ideas are born between threads, thoughts, and moments of quietude.",
    "manifesto.p3_desc_2": "The process is never rushed.",
    "manifesto.p3_desc_3": "It is in this slower rhythm that details reveal themselves and inspiration finds its place.",
    
    "manifesto.p4_num": "04 / EMOTIONAL",
    "manifesto.p4_title": "True value is what remains.",
    "manifesto.p4_desc_1": "The value of a handcrafted piece does not live in the materials alone.",
    "manifesto.p4_desc_2": "It lives in the care, intention, and emotion carried in every stitch.",
    "manifesto.p4_desc_3": "Long after the thread is woven, the feeling remains.",
    
    // Knot Section
    "feeling.tag": "Creation Philosophy",
    "feeling.title_1": "The Rhythm of the Heart",
    "feeling.title_2": "in Every Stitch.",
    "feeling.desc": "There is something special about creating with your own hands. Each stitch is born from a simple gesture, repeated with calmness, until it gains shape, texture, and meaning.\n\nAs the pieces grow, so do the memories, thoughts, and stories that accompany them.\n\nMaybe that is why handmade touches us differently. Because it does not only carry matter. It carries time – and everything we feel while we create.",
    "feeling.label": "Premium / Bags",
    "feeling.caption": "The weave that defines the Bravo DNA.",
    "feeling.desc_2": "The weave that defines the Bravo DNA.",
    
    // Collection Section
    "collection.tag": "PRODUCTS",
    "collection.subtitle": "What started as a gesture becomes matter.",
    "collection.category": "Category:",
    
    // Contact Section
    "contact.title_1": "Enter our",
    "contact.title_2": "Universe.",
    "contact.subtitle": "Do you wish for a customized piece or simply want to know more about our process? We are just a stitch away.",
    "contact.chat_whatsapp": "Chat via WhatsApp",
    
    // Footer
    "footer.legal_shipping": "Shipping & Returns",
    "footer.legal_privacy": "Privacy Policy",
    "footer.legal_terms": "Terms of Service",
    "footer.support": "Customer Support",
    "footer.made_in": "© 2026 M★BRAVO | Handmade with Love \nCreated with time, in Portugal.",
    
    // Memory Continues
    "memory.tag": "THE MEMORY CONTINUES",
    "memory.title": "There are stories that do not fade away.",
    "memory.subtitle": "They remain present in the gestures, the memories, and the small things we create with love.",
    "memory.mbravo_born": "M★Bravo was born from this presence.",
    "memory.desc": "Every stitch, every texture, and every detail carries a piece of this story, transforming threads into unique pieces and memories into something touchable.",
    "memory.quote": "\"More than crochet, it is a way to preserve what truly matters.\"",
    
    // Interlude
    "interlude.quote": "\"Beauty is in the soul we put into every gesture.\"",
    "interlude.sub": "\"Pieces created with time, love, and memory.\"",
    "instagram.feed.title": "Follow us on Instagram",
    "instagram.feed.handle": "@mbravobycarolina",
    "instagram.feed.view_profile": "View Profile",
    
    // ProductCard Details
    "product.exclusive": "M★BRAVO EXCLUSIVE",
    "product.details_title": "PRODUCT DETAILS",
    "product.color": "COLOR",
    "product.yarn_color": "YARN COLOR",
    "product.size": "SIZE",
    "product.quantity": "QUANTITY OF COASTERS",
    "product.material_label": "COMPOSITION & MATERIAL",
    "product.care_label": "CARE & WASHING",
    "product.whatsapp_cta": "ORDER VIA WHATSAPP",
    "product.checkout_cta": "CUSTOMIZE & BUY",
    "product.prev": "Previous Product",
    "product.next": "Next Product",
    "product.close": "Close",
    "product.zoom": "Click to zoom the material",
    "product.custom_yarn_placeholder": "Certified cotton yarn manual weaving",
    "product.final_note": "Each M★BRAVO piece is manually woven with certified yarns, guaranteeing exclusivity in every detail.",
    "product.care.handwash": "HAND WASH",
    "product.care.dryflat": "DRY FLAT",
    "product.care.notumble": "NO TUMBLE DRY",
    "product.care.nowring": "DO NOT WRING",
    "product.dimensions": "DIMENSIONS",
    "product.selected_config": "SELECTED CONFIGURATION",
    "product.secure_checkout": "SECURE CHECKOUT",
    "product.instant_buy": "INSTANT BUY",
    "product.customize_design": "Customize my Design",
    "product.total_amount": "TOTAL AMOUNT",
    "product.customize_whatsapp": "Customize my Design (WhatsApp)",
    "product.care_header": "CARE & MAINTENANCE",
    
    // Checkout Step 1
    "checkout.shipping_title": "1. SHIPPING & CONTACT INFO",
    "checkout.nome": "Full Name",
    "checkout.email": "Email",
    "checkout.phone": "Phone",
    "checkout.address": "Shipping Address",
    "checkout.postal": "Postal Code",
    "checkout.city": "City",
    
    // Checkout Step 2
    "checkout.payment_title": "2. PAYMENT METHOD",
    "checkout.mbway_label": "Phone Associated with MB WAY",
    "checkout.mbway_placeholder": "9xx xxx xxx",
    "checkout.mbway_instructions": "You will receive a notification in the MB WAY app to authorize the payment of",
    "checkout.multibanco_title": "PAYMENT DETAILS (ENTITY & REFERENCE)",
    "checkout.multibanco_entity": "Entity",
    "checkout.multibanco_ref": "Reference",
    "checkout.multibanco_amount": "Amount",
    "checkout.multibanco_instructions": "Make the payment at a Multibanco terminal or through your Homebanking using the \"Payment of Services\" option.",
    "checkout.card_title": "Card Details",
    "checkout.card_name": "Name on Card",
    "checkout.card_number": "Card Number",
    "checkout.card_expiry": "MM/YY",
    "checkout.card_cvv": "CVV",
    
    // Order Receipts & Communication Hub
    "sandbox.title": "Order Confirmation Hub",
    "sandbox.email_sim": "Order Receipts & Notifications",
    "sandbox.email_desc": "Access the digital receipts and workshop notifications generated in real-time:",
    "sandbox.view_client": "View Customer Receipt",
    "sandbox.view_admin": "View Workshop Notification",
    "sandbox.ship_order": "Dispatch Order (CTT)",
    "sandbox.view_shipped": "View Dispatch Notification",
    "sandbox.mbway_fast": "Fast Approval",
    "sandbox.mbway_rej": "MB WAY Rejection",
    "sandbox.mbway_timeout": "Expiration/Timeout",
    "sandbox.mbway_tip": "Write the number below to simulate different behaviors:",
    "sandbox.card_fail_funds": "Insufficient Funds",
    "sandbox.card_fail_timeout": "Gateway Timeout",
    "sandbox.card_success": "Any other number simulates immediate Success approval.",
    "sandbox.multibanco_tip": "After placing the order, the payment button below simulates the webhook receipt in real-time.",
    "sandbox.mbway_phone_note_fast": "Write 911 111 111 to simulate Fast Approval.",
    "sandbox.mbway_phone_note_rej": "Write 922 222 222 to simulate MB WAY Rejection.",
    "sandbox.mbway_phone_note_timeout": "Write 933 333 333 to simulate Expiration/Timeout.",
    "sandbox.card_note_funds": "Ends in 5001 to simulate Insufficient Funds.",
    "sandbox.card_note_timeout": "Ends in 5002 to simulate Gateway Timeout.",
    
    // Payment actions
    "payment.btn_webhook": "SIMULATE WEBHOOK PAYMENT",
    "payment.btn_multibanco": "GENERATE MULTIBANCO REFERENCE",
    "payment.btn_order": "PLACE ORDER",
    "payment.waiting_mbway": "AWAITING MB WAY AUTHORIZATION...",
    "payment.connecting": "CONNECTING GATEWAY...",
    "payment.success_title": "Order Placed Successfully!",
    "payment.success_desc": "Thank you for your order at M★BRAVO.",
    "payment.success_email_note": "A confirmation email has been sent to your email address.",
    "payment.btn_home": "Close and Return Home",
    "payment.error_header": "Payment Error or Failure",
    "payment.error_default": "An error occurred while processing your payment.",
    "payment.error_timeout": "The MB WAY approval timeout has expired (Exception/Timeout Simulation).",
    "payment.prod_note_title": "Production Note:",
    "payment.prod_note_desc": "Since each piece is produced entirely by hand, we estimate production and shipping to take 7 to 14 business days.",
    
    // Testimonials
    "testimonials.tag": "TESTIMONIALS",
    "testimonials.title": "Shared by Those Who Choose Us",
    "testimonials.subtitle": "What those who wear our stories have to say.",
    "testimonials.write_button": "Write comment",
    "testimonials.modal_title": "Leave Your Testimonial",
    "testimonials.label_name": "Your Name",
    "testimonials.label_text": "Your Comment",
    "testimonials.label_product": "Purchased Piece (e.g. Mala Daisy)",
    "testimonials.submit_button": "Publish Testimonial",
    "testimonials.success_message": "Thank you very much! Your testimonial was successfully added.",
    "testimonial.1.name": "Maria S.",
    "testimonial.1.text": "The Daisy bag is even more beautiful in person... The craftsmanship and detail of the crochet flowers are admirable, you can feel the love in every thread.",
    "testimonial.1.product": "Mala Daisy",
    "testimonial.2.name": "Carolina P.",
    "testimonial.2.text": "The coasters add a unique touch to the table. They are super delicate, but you can immediately feel the excellent quality of the material.",
    "testimonial.2.product": "Daisy Coasters",
    "testimonial.3.name": "Emma W.",
    "testimonial.3.text": "The Granny Square bag exceeded all my expectations. It's gorgeous, super robust, and perfectly fits everything I need for daily life.",
    "testimonial.3.product": "Mala Granny Square",
    "testimonial.4.name": "Joana R.",
    "testimonial.4.text": "I bought the Marea bikini and the fit is impeccable. The detail of the handcrafting and the soft touch of organic cotton are indescribable.",
    "testimonial.4.product": "Marea Bikini Set",
    "testimonial.5.name": "Teresa B.",
    "testimonial.5.text": "The Alma cardigan is a timeless piece of absolute comfort. I get compliments every time I wear it, a true work of art!",
    "testimonial.5.product": "Alma Cardigan"
  }
};

export const colorTranslations: Record<string, string> = {
  // Dual colors
  'Azul Água & Branco': 'Aqua Blue & White',
  'Amarelo & Branco': 'Yellow & White',
  'Rosa & Branco': 'Pink & White',
  'Verde & Branco': 'Green & White',
  'Vermelho & Branco': 'Red & White',
  // Mini pouches colors
  'Verde Musgo': 'Moss Green',
  'Azul Noite': 'Midnight Blue',
  'Amarelo Baunilha': 'Vanilla Yellow',
  'Terracota': 'Terracotta',
  'Branco Creme': 'Cream White',
  'Rosa Quartzo Subtil': 'Subtle Quartz Pink',
  // Standard colors
  'Hortelã-Pimenta': 'Peppermint',
  'Petróleo': 'Petrol Blue',
  'Azul Glaciar': 'Glacier Blue',
  'Sorvete Limão': 'Lemon Sorbet',
  'Creme': 'Cream',
  'Bege Claro': 'Light Beige',
  'Rosa Ternura': 'Tender Pink',
  'Castanho': 'Brown',
  'Branco': 'White',
  // Yarn colors
  'Algodão Cru': 'Raw Cotton',
  'Cacau Escuro': 'Dark Cocoa',
  'Oliva Suave': 'Soft Olive',
  // Specials
  'Padrão': 'Default',
  'Não aplicável': 'Not applicable',
  'Branco Creme ': 'Cream White'
};

export function translateColor(name: string, lang: 'pt' | 'en'): string {
  if (lang === 'pt') return name;
  return colorTranslations[name.trim()] || name;
}

export function translateSize(size: string, lang: 'pt' | 'en'): string {
  if (lang === 'pt') return size;
  if (size === '2 anos') return '2 years';
  if (size === '4 anos') return '4 years';
  if (size === '6 anos') return '6 years';
  return size;
}

export function translateQuantity(qty: any, lang: 'pt' | 'en'): string {
  if (!qty) return '';
  const str = String(qty);
  if (lang === 'pt') return str;
  return str.replace('und.', ' pcs');
}

export const translatedCategories = {
  pt: [
    {
      id: 'home',
      name: 'Casa',
      items: 'Bases de Copos, Almofadas',
      img: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'bags',
      name: 'Malas',
      items: 'Mini Pouches, AirPods Case',
      img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'vestuario',
      name: 'Vestuário',
      items: 'Bikini, Ponchos, Cardigans',
      img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'premium',
      name: 'Acessórios',
      items: 'Bandanas, Headbands',
      img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800',
    }
  ],
  en: [
    {
      id: 'home',
      name: 'Home',
      items: 'Coasters, Cushions',
      img: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'bags',
      name: 'Bags',
      items: 'Mini Pouches, AirPods Case',
      img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'vestuario',
      name: 'Clothing',
      items: 'Bikini, Ponchos, Cardigans',
      img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'premium',
      name: 'Accessories',
      items: 'Bandanas, Headbands',
      img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800',
    }
  ]
};

export const translatedProductsData = {
  pt: {
    // HOME items
    'h1': {
      name: 'Daisy Coasters',
      description: 'Bases em crochet inspiradas na delicadeza das margaridas e nos tons suaves da natureza. Um conjunto handmade pensado para trazer um toque cozy e acolhedor ao teu espaço.',
      material: '- Material: 100% algodão',
      care: '- Lavagem delicada\n- Secar na horizontal'
    },
    'h1c': {
      name: 'Sunflower Coasters',
      description: 'Bases em crochet inspiradas na beleza dos girassóis e nos seus tons quentes e acolhedores. Um conjunto handmade pensado para trazer um toque cozy e luminoso ao teu espaço.',
      material: '- Material: 100% algodão',
      care: '- Lavagem delicada\n- Secar na horizontal'
    },
    'h1f': {
      name: 'Coraline Coasters',
      description: 'Bases em crochet inspiradas no design Coraline, tecidas à mão com todo o carinho para trazer um toque aconchegante, elegante e especial ao teu espaço.',
      material: '- Material: 100% algodão',
      care: '- Lavagem delicada\n- Secar na horizontal'
    },
    'h1_classic': {
      name: 'Classic Coasters',
      description: 'Bases em crochet com um design floral clássico e delicado, pensadas para trazer um toque cozy e elegante ao teu espaço. Disponíveis em várias cores, mantendo sempre as pétalas brancas para um acabamento suave e delicado.',
      material: '- Material: 100% algodão',
      care: '- Lavagem delicada\n- Secar na horizontal'
    },
    'h2b': {
      name: 'Stella Cushion',
      description: 'Almofada decorativa em forma de estrela, feita à mão em crochet para dar um toque delicado e cozy a qualquer espaço. Perfeita para decorar camas, sofás, cadeiras, quartos infantis ou qualquer cantinho especial. Disponível em várias cores para combinar com diferentes estilos de decoração.',
      material: '- Material: 100% poliéster (Fio macio e estruturado, ideal para peças decorativas)',
      care: '- Limpeza delicada à mão\n- Secar na horizontal em superfície plana\n- Evitar torcer a peça'
    },
    // BAGS items
    'b1': {
      name: 'African Flower Pouch',
      description: 'Pouch em crochet com padrão African Flower, cuidadosamente feito à mão e forrado no interior para maior estrutura e proteção. Finalizado com fecho, é perfeito para guardar os teus essenciais do dia a dia com um toque cozy e handmade.',
      material: '- Material: 100% algodão\n- Detalhe: Forro interior em tecido',
      care: '- Lavagem delicada à mão\n- Secar na horizontal\n- Evitar máquina de secar',
      dimensions: '25 cm (largura) × 14 cm (altura)'
    },
    'b1b': {
      name: 'Mini Pouches',
      description: 'Mini pouch em crochet feito à mão, criado com um design simples e intemporal para guardar pequenos essenciais do dia a dia. Com fecho ajustável em cordão e um acabamento delicado handmade, é perfeito para moedas, cartões, joias, lip products ou pequenos tesouros do dia a dia.',
      material: '- Fecho ajustável com cordão\n- Ideal para moedas, cartões, joias ou pequenos acessórios\n- Disponível em várias cores\n- Composição: 100% algodão',
      care: '- Lavagem delicada à mão\n- Secar na horizontal em superfície plana'
    },
    'b1_airpods': {
      name: 'AirPods Case',
      description: 'Capa para AirPods em crochet feita à mão, criada para proteger os teus auriculares com charme, style e um toque cozy especial. Prática, delicada e perfeita para o dia a dia.',
      material: '- Design minimalista e intemporal\n- Ajuste seguro à caixa dos AirPods\n- Disponível em várias combinações de cores\n- Composição: 100% algodão',
      care: '- Lavagem delicada à mão\n- Secar na horizontal em superfície plana'
    },
    'b2_sling': {
      name: 'Granny Square Sling Bag',
      description: 'Mala em crochet com padrão Granny Square floral, cuidadosamente feita à mão e forrada no interior para maior estrutura e durabilidade. Com alça ajustável e fecho de correr, pode ser usada à cintura, a tiracolo ou ao ombro, adaptando-se facilmente ao teu estilo e às tuas necessidades do dia a dia.\nDimensões aproximadas: 26 cm (largura) × 11 cm (altura)',
      material: '- Material: 100% algodão de alta qualidade\n- Detalhe: Forro interno macio para maior segurança e estrutura',
      care: '- Lavagem delicada à mão\n- Secar na horizontal\n- Não utilizar máquina de secar'
    },
    'b2_shell': {
      name: 'Mini shell Pouch',
      description: 'Mini pouch em crochet com design inspirado em conchas, cuidadosamente feita à mão. Compacta e prática, fecha com um botão de madeira com estrela, um detalhe especial que reflete a identidade da marca, sendo perfeita para guardar os teus essenciais do dia a dia com um toque cozy e handmade.',
      material: '- Detalhes: Ideal para moedas, auriculares/AirPods, anéis e pequenos tesouros do dia a dia\n- Dimensões: 8,5 cm (largura) × 7,5 cm (altura)\n- Composição: 100% algodão\n- Material: Botão em madeira',
      care: '- Lavagem delicada\n- Secar na horizontal'
    },
    // VESTUARIO items
    'v1': {
      name: 'Marea Bikini Set',
      description: 'Biquíni em crochet feito à mão, pensado para os dias de verão e momentos à beira-mar. O Marea Bikini combina um design de riscas delicadas com um ajuste confortável, criando um look handmade, minimalista e cozy. Disponível em várias combinações de cores.',
      material: '- Material: 100% algodão',
      care: '- Lavar à mão\n- Secar à sombra'
    },
    'v1b': {
      name: 'Coral Bikini Top',
      description: 'Bikini top em crochet feito à mão, com um design triangular clássico e detalhes delicados. Ajustável no pescoço e nas costas para um ajuste confortável e personalizado. Disponível em várias combinações de cores, foi criado para acompanhar os dias de verão com um toque artesanal.',
      material: '- Material: 100% algodão',
      care: '- Lavar à mão\n- Secar à sombra'
    },
    'v2b': {
      name: 'Mesh Poncho',
      description: 'Poncho em crochet leve e delicado, feito à mão com um design de malha aberta para um look effortless e cozy. Perfeito para sobrepor a tops, vestidos ou biquínis, criando um toque elegante e descontraído ao outfit. Disponível em várias cores.',
      material: '- Material: 100% algodão',
      care: '- Lavagem delicada à mão\n- Secar na horizontal\n- Evitar máquina de secar'
    },
    'v2c': {
      name: 'Signature Granny Poncho',
      description: 'Poncho em crochet feito à mão, criado com um clássico padrão granny stitch e combinação de duas cores para um look cozy e intemporal. Com um ajuste confortável e textura aconchegante, é perfeito para sobrepor a diferentes looks e acrescentar um toque handmade e effortless ao visual.',
      material: '- Composição: 100% algodão egípcio de alta qualidade ou mistura de algodão e lã macia (Consulte para opções)',
      care: '- Lavagem delicada à mão com sabão neutro\n- Secar na horizontal em superfície plana\n- Evitar máquina de secar',
      details: '• Ideal para layering em diferentes looks\n• Disponível em várias combinações de cores'
    },
    'alma_cardigan': {
      name: 'Alma Cardigan',
      description: 'Cardigan em crochet feito à mão com granny squares clássicos e um design cozy e intemporal. Uma peça confortável e delicada, perfeita para dias frescos de verão, outono ou para criar um look mais acolhedor e effortless. Disponível em várias combinações de cores e materiais.',
      material: '- Opção 1: 100% algodão (Leve, respirável e ideal para dias mais amenos ou meia-estação)\n- Opção 2: 50% algodão / 50% lã (Mais quente, macio e aconchegante, ideal para dias mais frios)',
      care: '- Lavagem delicada à mão\n- Secar na horizontal em superfície plana\n- Evitar torcer a peça',
      details: '- Modelo de manga comprida\n- Fecho em laço frontal'
    },
    'mini_alma_cardigan': {
      name: 'Mini Alma Cardigan',
      description: 'Versão mini do Alma Cardigan, feita à mão em crochet com granny squares clássicos e um design cozy e intemporal. Pensado para os mais pequenos, combina conforto, delicadeza e um toque handmade especial. Disponível em várias combinações de cores e materiais.',
      material: '- Opção Leve: 100% algodão\n- Opção Cozy: 50% algodão, 50% lã',
      care: '- Lavagem delicada à mão\n- Secar na horizontal em superfície plana\n- Evitar máquina de secar',
      details: '- Modelo de manga comprida\n- Fecho em laço frontal',
      sizes: ['2 anos', '4 anos', '6 anos']
    },
    // PREMIUM items
    'v3': {
      name: 'Dragonfly Bandana',
      description: 'Bandana em crochet com delicado padrão de libelinhas, feita à mão para dar um toque cozy e especial ao teu look. Leve, confortável e versátil, perfeita para usar no dia a dia. Disponível em várias cores e em duas opções de material.',
      material: '- Opção 1: 100% algodão (opção leve)\n- Opção 2: 50% algodão, 50% lã (opção mais cozy)',
      care: '- Lavagem delicada\n- Secar na horizontal'
    },
    'v3b': {
      name: 'Classic Bandana',
      description: 'Bandana em crochet feita à mão, com um design clássico em granny stitch. Leve, versátil e ajustável através de fitas, foi criada para complementar qualquer look com um toque artesanal e intemporal. Disponível em várias cores.',
      material: '- Opção 1: 100% algodão (opção leve)\n- Opção 2: 50% algodão, 50% lã (opção mais cozy)',
      care: '- Lavagem delicada\n- Secar na horizontal'
    },
    'h3': {
      name: 'Dragonfly Headband',
      description: 'Headband em crochet com delicado padrão de libelinhas, feita à mão para um toque leve e especial no dia a dia. Confortável, versátil e perfeita para complementar qualquer look com um detalhe handmade e cozy. Disponível em várias cores.',
      material: '- Material: 100% algodão',
      care: '- Lavagem delicada à mão\n- Secar na horizontal\n- Evitar máquina de secar'
    },
    'v3c': {
      name: 'Scarf Hip Bandana',
      description: 'Peça em crochet leve e versátil, cuidadosamente feita à mão. Pode ser usada como hip scarf ou bandana, adicionando um toque boho e handmade a qualquer look. Perfeita para os dias mais quentes ou para complementar o teu estilo de forma única e delicada.',
      material: '- Material: 100% algodão premium leve e fresco\n- Acabamento: Detalhe de franjas artesanais na extremidade',
      care: '- Lavagem delicada à mão com sabão neutro\n- Secar horizontalmente à sombra para preservar as franjas\n- Não utilizar máquina de secar'
    }
  },
  en: {
    // HOME items
    'h1': {
      name: 'Daisy Coasters',
      description: 'Crochet coasters inspired by the delicacy of daisies and the soft tones of nature. A handmade set designed to bring a cozy and welcoming touch to your space.',
      material: '- Material: 100% Cotton',
      care: '- Delicate wash\n- Air dry'
    },
    'h1c': {
      name: 'Sunflower Coasters',
      description: 'Crochet coasters inspired by the beauty of sunflowers and their warm, welcoming tones. A handmade set designed to bring a cozy and bright touch to your space.',
      material: '- Material: 100% Cotton',
      care: '- Delicate wash\n- Air dry'
    },
    'h1f': {
      name: 'Coraline Coasters',
      description: 'Crochet coasters inspired by the Coraline design, lovingly hand-woven to bring a cozy, elegant, and special touch to your space.',
      material: '- Material: 100% Cotton',
      care: '- Delicate wash\n- Air dry'
    },
    'h1_classic': {
      name: 'Classic Coasters',
      description: 'Crochet coasters with a classic and delicate floral design, designed to bring a cozy and elegant touch to your space. Available in various colors, always keeping white petals for a soft and delicate finish.',
      material: '- Material: 100% Cotton',
      care: '- Delicate wash\n- Air dry'
    },
    'h2b': {
      name: 'Stella Cushion',
      description: 'Decorative star-shaped cushion, handmade in crochet to add a delicate and cozy touch to any space. Perfect for decorating beds, sofas, chairs, kids\' rooms, or any special corner. Available in several colors to match different styles of decor.',
      material: '- Material: 100% polyester (Soft and structured yarn, ideal for decorative pieces)',
      care: '- Gentle hand cleaning\n- Air dry flat\n- Avoid twisting the piece'
    },
    // BAGS items
    'b1': {
      name: 'African Flower Pouch',
      description: 'Crochet pouch with African Flower pattern, carefully handmade and lined on the inside for extra structure and protection. Finished with a zipper, it is perfect to hold your daily essentials with a cozy, handmade touch.',
      material: '- Material: 100% Cotton\n- Detail: Interior fabric lining',
      care: '- Delicate hand wash\n- Air dry\n- Avoid tumble dryer',
      dimensions: '25 cm (width) × 14 cm (height)'
    },
    'b1b': {
      name: 'Mini Pouches',
      description: 'Handmade crochet mini pouch, created with a simple and timeless design to store small daily essentials. Featuring an adjustable drawstring closure and a delicate handmade finish, it is perfect for coins, cards, jewelry, lip products, or small daily treasures.',
      material: '- Adjustable drawstring closure\n- Ideal for coins, cards, jewelry, or small accessories\n- Available in multiple colors\n- Composition: 100% Cotton',
      care: '- Gentle hand wash\n- Air dry flat'
    },
    'b1_airpods': {
      name: 'AirPods Case',
      description: 'Handmade crochet AirPods case, crafted to protect your earphones with charm, style, and a special cozy touch. Practical, delicate, and perfect for everyday use.',
      material: '- Minimalist and timeless design\n- Secure fit to the AirPods case\n- Available in multiple color combinations\n- Composition: 100% Cotton',
      care: '- Gentle hand wash\n- Air dry flat'
    },
    'b2_sling': {
      name: 'Granny Square Sling Bag',
      description: 'Crochet bag with a floral Granny Square pattern, carefully handmade and lined on the inside for greater structure and durability. With an adjustable strap and a zipper closure, it can be worn around the waist, crossbody, or on the shoulder, easily adapting to your style and everyday needs.\nApproximate dimensions: 26 cm (width) × 11 cm (height)',
      material: '- Material: 100% High-quality Cotton\n- Detail: Soft interior lining for extra safety and structure',
      care: '- Delicate hand wash\n- Air dry horizontally\n- Do not tumble dry'
    },
    'b2_shell': {
      name: 'Mini shell Pouch',
      description: 'Crochet mini pouch with a shell-inspired design, carefully handmade. Compact and practical, it closes with a wooden star button, a special detail reflecting the brand\'s identity, making it perfect for storing your daily essentials with a cozy and handmade touch.',
      material: '- Details: Ideal for coins, earphones/AirPods, rings, and small daily treasures\n- Dimensions: 8.5 cm (width) × 7.5 cm (height)\n- Composition: 100% Cotton\n- Material: Wooden button',
      care: '- Delicate wash\n- Air dry'
    },
    // VESTUARIO items
    'v1': {
      name: 'Marea Bikini Set',
      description: 'Handcrafted crochet bikini, designed for summer days and moments by the sea. The Marea Bikini combines a delicate striped design with a comfortable fit, creating a handmade, minimalist, and cozy look. Available in several color combinations.',
      material: '- Material: 100% Cotton',
      care: '- Hand wash\n- Dry in the shade'
    },
    'v1b': {
      name: 'Coral Bikini Top',
      description: 'Handmade crochet bikini top with a classic triangle design and delicate details. Adjustable at the neck and back for a comfortable, customized fit. Available in multiple color combinations, it is created to accompany summer days with an electronic touch.',
      material: '- Material: 100% Cotton',
      care: '- Hand wash\n- Dry in the shade'
    },
    'v2b': {
      name: 'Mesh Poncho',
      description: 'Lightweight and delicate crochet poncho, handmade with an open mesh design for an effortless and cozy look. Perfect for layering over tops, dresses, or bikinis, adding an elegant and laid-back touch to your outfit. Available in various colors.',
      material: '- Material: 100% Cotton',
      care: '- Delicate hand wash\n- Air dry\n- Avoid tumble dryer'
    },
    'v2c': {
      name: 'Signature Granny Poncho',
      description: 'Handmade crochet poncho, crafted with a classic granny stitch pattern and a two-color combination for a cozy and timeless look. Featuring a comfortable fit and warm texture, it is perfect for layering and adding an effortless, handmade touch to your outfit.',
      material: '- Composition: 100% High-quality Egyptian Cotton or a soft cotton and wool blend (Inquire for options)',
      care: '- Delicate hand wash with neutral soap\n- Air dry flat\n- Avoid tumble dryer',
      details: '• Ideal for layering in different looks\n• Available in multiple color combinations'
    },
    'alma_cardigan': {
      name: 'Alma Cardigan',
      description: 'Handmade crochet cardigan with classic granny squares and a cozy, timeless design. A comfortable and delicate piece, perfect for cool summer days, autumn, or to create a warmer, effortless look. Available in several color and material combinations.',
      material: '- Option 1: 100% Cotton (Light, breathable, and ideal for milder days or mid-season)\n- Option 2: 50% Cotton / 50% Wool (Warmer, soft, and cozy, ideal for colder days)',
      care: '- Delicate hand wash\n- Air dry flat\n- Avoid twisting the piece',
      details: '- Long sleeve model\n- Front tie bow closure'
    },
    'mini_alma_cardigan': {
      name: 'Mini Alma Cardigan',
      description: 'Mini version of the Alma Cardigan, handmade in crochet with classic granny squares and a cozy, timeless design. Designed for the little ones, it combines comfort, delicacy, and a special handmade touch. Available in multiple color and material combinations.',
      material: '- Light Option: 100% Cotton\n- Cozy Option: 50% Cotton, 50% Wool',
      care: '- Delicate hand wash\n- Air dry flat\n- Avoid tumble dryer',
      details: '- Long sleeve model\n- Front tie bow closure',
      sizes: ['2 years', '4 years', '6 years']
    },
    // PREMIUM items
    'v3': {
      name: 'Dragonfly Bandana',
      description: 'Crochet bandana with a delicate dragonfly pattern, handmade to add a cozy and special touch to your look. Light, comfortable, and versatile, perfect for everyday wear. Available in multiple colors and two material options.',
      material: '- Option 1: 100% Cotton (light option)\n- Option 2: 50% Cotton, 50% Wool (cozy option)',
      care: '- Delicate wash\n- Air dry'
    },
    'v3b': {
      name: 'Classic Bandana',
      description: 'Handmade crochet bandana with a classic granny stitch design. Light, versatile, and adjustable via ties, it was created to complement any look with an artisanal and timeless touch. Available in multiple colors.',
      material: '- Option 1: 100% Cotton (light option)\n- Option 2: 50% Cotton, 50% Wool (cozy option)',
      care: '- Delicate wash\n- Air dry'
    },
    'h3': {
      name: 'Dragonfly Headband',
      description: 'Crochet headband with a delicate dragonfly pattern, handmade for a lightweight and special everyday touch. Comfortable, versatile, and perfect to complement any look with a cozy, handmade detail. Available in multiple colors.',
      material: '- Material: 100% Cotton',
      care: '- Delicate hand wash\n- Air dry\n- Avoid tumble dryer'
    },
    'v3c': {
      name: 'Scarf Hip Bandana',
      description: 'Lightweight and versatile crochet piece, carefully handmade. It can be worn as a hip scarf or bandana, adding a boho and handmade touch to any look. Perfect for warmer days or to complement your style in a unique, delicate way.',
      material: '- Material: 100% Premium lightweight and fresh Cotton\n- Finish: Handcrafted fringe details at the ends',
      care: '- Delicate hand wash with neutral soap\n- Dry flat in the shade to preserve fringes\n- Do not tumble dry'
    }
  }
};

export const translatedFeaturedProducts = {
  pt: [
    {
      id: 'v2c',
      title: 'Signature Granny Poncho',
      desc: 'Crochet autoral premium e intemporal',
      img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'alma_cardigan',
      title: 'Alma Cardigan',
      desc: 'Clássico design em granny squares',
      img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'b1',
      title: 'African Flower Pouch',
      desc: 'Mala artesanal com forro e fecho premium',
      img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800'
    }
  ],
  en: [
    {
      id: 'v2c',
      title: 'Signature Granny Poncho',
      desc: 'Premium and timeless authorial crochet',
      img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'alma_cardigan',
      title: 'Alma Cardigan',
      desc: 'Classic design in granny squares',
      img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'b1',
      title: 'African Flower Pouch',
      desc: 'Artisanal bag with premium lining and zipper',
      img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800'
    }
  ]
};

export function translateBackendError(msg: string, lang: 'pt' | 'en'): string {
  if (!msg) return '';
  if (lang === 'en') return msg; // Already in English

  const lower = msg.toLowerCase();
  if (lower.includes('5001') || lower.includes('insufficient funds')) {
    return 'Recusado pela gateway de cartão de crédito (Erro de Simulação 5001 - Saldo Insuficiente)';
  }
  if (lower.includes('5002') || lower.includes('timeout/expired')) {
    return 'Tempo limite da transação de cartão de crédito esgotado/expirado (Erro de Simulação 5002)';
  }
  if (lower.includes('rejected the push') || lower.includes('user rejected')) {
    return 'O utilizador do MB WAY rejeitou o pedido de autorização push.';
  }
  if (lower.includes('payment expired') || lower.includes('confirmation window elapsed')) {
    return 'O pagamento por MB WAY expirou. A janela de confirmação de 5 minutos terminou.';
  }
  if (lower.includes('simulated administrative cancellation') || lower.includes('administrative cancellation')) {
    return 'Cancelamento administrativo simulado / Recusado pela gateway.';
  }

  return msg;
}

