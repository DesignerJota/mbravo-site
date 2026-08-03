# M★BRAVO — Universo M★BRAVO: Roadmap de Inovação & Experiência Phygital

Este documento regista a visão estratégica de futuro para a evolução tecnológica e artesanal da M★BRAVO. O roadmap combina o rigor da alta engenharia de software com a sensibilidade e o ADN do artesanal de luxo (Slow Fashion / Crochet Autoral).

---

## 1. Passaporte Digital & Autenticidade "Tap & Verify" (NFC / QR Code)
*   **Conceito:** Cada criação autoral M★BRAVO inclui um microchip NFC embutido de forma impercetível na etiqueta artesanal (ou QR Code de alta precisão).
*   **Experiência do Cliente:** Ao aproximar o smartphone da etiqueta da mala ou peça de crochet, o cliente é instantaneamente direcionado para o Passaporte Digital de Autenticidade da sua peça.
*   **Especificações Técnicas:**
    *   **Certificado de Autenticidade Imutável:** Número de série único gravado em registo criptográfico ou base de dados segura.
    *   **Ficha da Artesã & História:** Nome da artesã responsável pelo tecer da peça, número de horas dedicadas à confeção e data de conclusão no Atelier Carolina Bravo.
    *   **Origem dos Materiais:** Rastreabilidade dos fios de algodão de luxo e ferragens.

---

## 2. Provador Virtual & Realidade Aumentada (AR Web-Based)
*   **Conceito:** Permite à cliente visualizar as malas e peças M★BRAVO em escala real (1:1) sobre a sua indumentária ou no seu ambiente antes de concluir a encomenda.
*   **Experiência do Cliente:** Integração fluida no ecrã de detalhe do produto (`ProductDetailPage`) com botão "Projetar no seu Espaço / Provador Virtual".
*   **Especificações Técnicas:**
    *   **Engine WebXR / `<model-viewer>`:** Renderização 3D de altíssima fidelidade sem necessidade de descarregar aplicações externas.
    *   **Simulação de Textura de Fio:** Shaders PBR (Physically Based Rendering) que replicam a luz natural a incidir sobre as malhas e nós do crochet.

---

## 3. Configurador de Personalização 3D em Tempo Real
*   **Conceito:** Atelier Digital de Co-Criação onde a cliente pode personalizar a sua peça M★BRAVO sob encomenda.
*   **Experiência do Cliente:** Módulo interativo com rotação 360° da peça, permitindo selecionar combinações de cores e acabamentos antes de encomendar.
*   **Opções de Personalização:**
    *   **Paleta de Cores do Fio de Crochet:** Escolha entre tons sazonais e clássicos do Atelier.
    *   **Alças & Acessórios:** Opção entre alça em crochet, pele genuína ou corrente metálica.
    *   **Monograma Personalizado:** Gravação de iniciais em placa metálica ou etiqueta de couro artesanal.

---

## 4. Passaporte de Manutenção e Reparações (Luxury Circularity)
*   **Conceito:** Garantia de longevidade e economia circular de luxo. A M★BRAVO compromete-se com a durabilidade eterna das suas criações.
*   **Experiência do Cliente:** Área do cliente e portal do passaporte onde é possível solicitar serviços de restauro e preservação.
*   **Funcionalidades:**
    *   **Guia de Cuidados Especializados:** Instruções interativas para lavagem, secagem e armazenamento de peças em crochet de alta gama.
    *   **Agendamento de Reparação no Atelier:** Submissão de pedidos de ajuste, substituição de alças ou restauro de malhas diretamente com a equipa de artesãs Carolina Bravo.
    *   **Histórico de Manutenções:** Registo de todas as intervenções efetuadas na peça ao longo dos anos.

---

## 5. Infraestrutura Técnica & Escalabilidade Backend (Railway & Persistent Data)
*   **Conceito:** Aumentar a resiliência e a capacidade de observabilidade do servidor em ambiente de produção contínua.
*   **Especificações Técnicas:**
    *   **Snapshots de Backup Automáticos (`/app/data/backups/`):** Rotina diária/semanal automatizada que gera cópias de segurança comprimidas e rotativas de `orders.json`, `customers.json`, `inventory.json` e `catalog.json` na pasta `/app/data/backups/` antes de cada escrita atómica no Volume Persistente da Railway.
    *   **Monitorização de Erros & Observabilidade (Sentry / Logtail / Winston):** Captura e alerta automático de exceções não tratadas em rotas críticas (como Webhooks do Stripe, emissão de e-mails via Resend e falhas de sincronização do Volume) com relatórios no Telegram/Email do Atelier.
    *   **Migração Transparente para Base de Dados Relacional (PostgreSQL / SQLite na Railway):** Transição arquitetural do armazenamento baseado em ficheiros `.json` para uma instância PostgreSQL dedicada na Railway assim que o volume diário de vendas e acessos simultâneos assim o exigir, mantendo os modelos de dados e schemas unificados.

---

## 6. Telemetria, Rastreio & BI Preditivo no Painel Admin (Atelier Intelligence)
*   [x] **Integração de Rastreio (GA4 `G-E3ZXEK6RGR`, GTM `GTM-NLQ2QXN6`, Clarity `xuu4fvcodg`):** Coleta de tráfego, funis de conversão, mapas de calor e gravações de sessão ativas no frontend.
*   [x] **Proteção de Subdomínio & Bloqueio de Indexação da API (`api.mbravobycarolina.com`):** Implementação de `robots.txt` estrito e cabeçalhos `X-Robots-Tag: noindex, nofollow` no servidor Express.
*   [x] **Feed Dinâmico Google Merchant Center (RSS 2.0 XML):** Endpoint `/feed.xml` e `/api/v1/products/feed.xml` com geração em tempo real alimentada diretamente por `loadCatalog()` no volume persistente.
*   [x] **Conformidade de Envios Google Shopping (`LegalModal.tsx`):** Exibição transparente das 4 tabelas de frete (Portugal, Espanha, Europa UE e Internacional) e prazos de entrega no modal de Informações Legais.
*   [x] **Ajuste do Catálogo de Preços & Feed XML Sincronizado (`src/App.tsx`, `server.ts` & `/catalog.json`):** Atualização dos preços base no catálogo e em `BASE_PRICES`, implementação da lógica de cálculo para conjuntos de Coasters (1und: 4€ até 8und: 34€ via `calculateItemPrice`) e propagação atómica para o feed RSS 2.0 XML do Google Merchant Center.
*   [x] **Interface Mobile Nativa e Prazos Dinâmicos de Produção (`AtelierCartDrawer.tsx`, `CartCheckoutModal.tsx` & `App.tsx`):** Implementada estrutura de altura dinâmica `100dvh` com cabeçalho/base cravados para suporte total a orientação landscape, leitor automático do `craftingTime` / `leadTimeDays` de cada produto (Zero Hardcode) e cálculo de portes prévio no Checkout Rápido "Comprar Agora".
*   [x] **Carrinho de Compras Multipeça, Atelier Slide-Over Drawer, Responsividade 100dvh & Prazos Transparentes (`CartContext.tsx`, `AtelierCartDrawer.tsx`, `CartCheckoutModal.tsx`, `App.tsx`):** Implementação da arquitetura de carrinho com gaveta deslizante de luxo esguia (máx. 390px), altura dinâmica `100dvh` com áreas de cabeçalho e rodapé 100% fixas (scroll exclusivo central em mobile/landscape), tom de marca refinado ("Envio Cortesia M★BRAVO"), distinção transparente de prazos ("Produção Manual: 10 a 15 dias úteis" e "Envio Expresso (CTT): 1 a 3 dias úteis"), e seletor discreto de região no topo de todos os formulários com recálculo instantâneo de portes e total final.
*   [x] **Sincronização Completa de Checkouts, Single-Flow Checkout Unificado & Deteção Dinâmica de Ecossistema:** Unificação absoluta do fluxo de carrinho e pagamento no painel `AtelierCartDrawer.tsx`, eliminação do segundo modal sobreposto, transição fluida entre seleção (Passo 1/2) e formulário de dados/pagamento (Passo 2/2), sanfona recolhível de resumo em mobile, botão fixo de confirmação ("Confirmar e Pagar") e correção do Stripe com `automatic_payment_methods: { enabled: true }`.
*   [x] **Injeção do Google Avaliações do Consumidor (Merchant Center Opt-in), Avaliações Google Maps, SEO Sitelinks, Correção SVG Express Checkout & Suporte Landscape (`CartCheckoutModal.tsx`, `AtelierCartDrawer.tsx`, `App.tsx`, `index.html`):** Injeção do Opt-In do Merchant Center (ID: `535728392`), cartão interativo de 5 estrelas com link para `https://g.page/r/Cdo7JGP_Xpc3EBM/review`, tag `<title>M★BRAVO | Handmade With Love</title>`, registo formal do uso da Estrela Preenchida ("★") para SEO e Estrela Contorno ("☆") para UI, e ajuste dos viewBoxes SVG de Apple Pay e Google Pay com navegação tátil e fixação de cabeçalhos/rodapés em orientação horizontal landscape.
*   [x] **Isolamento de Modais via React Portal (`createPortal`), Gestão Mutuamente Exclusiva & Padronização do Botão Expresso (`CartCheckoutModal.tsx`, `AtelierCartDrawer.tsx`, `CartContext.tsx` & `App.tsx`):** Renderização de modais no nó raiz (`document.body`), fluxo mutuamente exclusivo de abertura com bloqueio automático do scroll da página (`body.style.overflow = 'hidden'`), arquitetura Flexbox vertical rígida para mobile/landscape, container rígido padronizado para o botão de Pagamento Expresso (`w-full h-12 bg-black rounded-lg flex items-center justify-center`) com SVG centralizado (`h-6 w-auto`) e purga completa de formulários inline residuais.
*   [x] **Refinamentos Elegantes de UI/UX, Animação de Barra Dourada & Restauração da Estratégia Comercial (`AtelierCartDrawer.tsx` & `index.css`):** Restauração dos DOIS balões de incentivo comercial (Balão 1: Progresso para Envio Cortesia de 100€ com barra em gradiente animado `animate-gold-shimmer` e ícone de Estrela M★BRAVO `★` a deslizar na ponta guia; Balão 2: Dica de Envio Atelier informando que até 3 peças têm o mesmo valor fixo de portes), eliminação total do botão "VER DETALHES" (artigos sempre expandidos em todas as resoluções), atualização obrigatória de nomenclatura ("A sua Encomenda", "M★BRAVO" e "O seu carrinho está vazio"), discriminação financeira ultra-transparente de Subtotal + Portes + Total, e Modal Flutuante Compacto de 2 Colunas em Tablet/Desktop sem áreas em branco.
*   [x] **Redesign Visual de Luxo (PDP & Carrinho) e Suporte Bilingue Stripe API (`App.tsx` & `AtelierCartDrawer.tsx`):** Correção da propriedade `label` e `detail` em `shippingOptions` para passar strings dinâmicas simples consoante o idioma ativo, redução minimalista das amostras de cor (`w-5 h-5` mobile / `w-6 h-6` desktop) com anel de seleção ativo ultra-fino (`ring-1 ring-forest ring-offset-2`), padronização da altura e tipografia de todos os botões CTA (`max-h-[40px] / h-10`, `rounded-sm`, `text-[10px]/[11px]` em caixa alta com `tracking-[0.2em] font-medium`), barra sticky mobile ultra-fina (`py-2 px-4`) com preço total e botão "ADICIONAR", e redução global de escala (~20%) para harmonia visual e elegância de alta-costura.
*   [ ] **Telemetria de Visitantes em Tempo Real (Server-Sent Events - SSE):** Implementação de stream unidirecional leve `/api/admin/telemetry/live` para exibição de utilizadores ativos no site, peças visualizadas no momento e carrinhos em preparação no Painel Admin, com consumo ultrabaixo de recursos e zero sobrecarga de conexões persistentemente mantidas.

---

*M★BRAVO Atelier — Onde o tempo do artesanato de luxo se cruza com a engenharia do futuro.*
