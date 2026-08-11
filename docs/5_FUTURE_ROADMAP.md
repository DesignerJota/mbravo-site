# M★BRAVO — Universo M★BRAVO: Roadmap de Inovação & Experiência Phygital

Este documento regista a visão estratégica de futuro para a evolução tecnológica e artesanal da M★BRAVO. O roadmap combina o rigor da alta engenharia de software com a sensibilidade e o ADN do artesanal de luxo (Slow Fashion / Crochet Autoral).

---

## 1. CRM de Memórias & Notificações (Atelier Loyalty)
*   **Conceito:** Motor de inteligência relacional e fidelização VIP desenhado para acompanhar o ciclo de vida e a ligação afetiva de cada cliente com as suas peças M★BRAVO.
*   **Experiência da Cliente:**
    *   **Aniversário da Peça ("Memory Anniversary"):** Notificação elegante a assinalar 1 ano da conclusão e entrega da peça, acompanhada de conselhos de conservação e uma oferta de cortesia exclusiva.
    *   **Curadoria de Cuidados Sazonais:** Envio de sugestões de limpeza e armazenamento adequadas à mudança de estação.
    *   **Acesso Antecipado & Peças Únicas:** Convites privados para o lançamento de novas coleções de edição limitada, baseados no histórico de compras e paletas de cor preferidas.
*   **Especificações Técnicas:**
    *   Integração no AdminDashboard (`customers.json` / PostgreSQL) com tags de perfil (*LTV*, *Peças Adquiridas*, *Paleta Preferida*, *Data do Primeiro Pedido*).
    *   Disparo assíncrono via Resend com templates de e-mail com tipografia editorial e estética de Atelier.

---

## 2. Certificado de Autenticidade Digital & Proveniência "Tap & Verify"
*   **Conceito:** Registo imutável de autenticidade e proveniência de cada peça artesanal M★BRAVO, acessível por QR Code de alta precisão ou NFC no rótulo da peça.
*   **Experiência da Cliente:** Ao aproximar o smartphone ou ler o código da etiqueta, a cliente acede à Ficha de Autenticidade Oficial da sua criação M★BRAVO.
*   **Especificações Técnicas:**
    *   **Número de Série Único:** Hash e identificador imutável associado à encomenda no Volume Persistente / DB.
    *   **Ficha do Atelier:** Nome da artesã (Carolina Bravo), número exato de horas dedicadas à confecção manual, data de selagem e origem dos fios de algodão de luxo.
    *   **Verificação Pública Instantânea:** Página de validação pública no domínio oficial (`mbravobycarolina.com/verify/:serial`).

---

## 3. Atelier Private Studio (Consultoria Privada & Encomenda Sob Medida) — [x] IMPLEMENTADO
*   **Conceito:** Ritual imersivo e interativo de co-criação digital disponível no Cartão Digital (`/card`) e no site oficial. Não se trata de um formulário estático, mas de uma experiência sensitiva de design participativo antes da sessão com a Carolina.
*   **Status de Implementação:** Totalmente operacional (Fase 1 e Fase 2 concluídas). Disponível em `/card` e no site, equipado com Configurador Visual Dinâmico em tempo real por camadas SVG (`PieceVisualizerSVG`) para todas as tipologias de peças (Malas, Cardigans, Ponchos, Decor), suporte a combinações Monocolor e Bicolor Multi-Zona, geração de Passaporte Criativo, envio pré-formatado via WhatsApp Business do Atelier, salvaguarda persistente no backend (`/api/private-studio/passports` -> `/app/data/passports.json`) e separador dedicado "Passaportes Criativos" no Painel de Administração (`AdminDashboardModal.tsx`).
*   **Experiência da Cliente:**
    *   **Simulador Tátil e Visual por Camadas:** A cliente explora e visualiza virtualmente em tempo real a troca de cores por zonas (Corpo/Base vs. Aba/Bordos/Destaque), a paleta de fios de algodão, a textura dos pontos de crochet, o tipo de fecho (botão de madeira, íman ou fecho metálico) e o estilo de alça (crochet, pele genuína ou corrente de luxo).
    *   **Estimativa em Tempo Real:** O simulador calcula dinamicamente a estimativa de horas de confecção manual e o intervalo orçamental da peça sob medida.
    *   **Agendamento da Sessão de Design:** Finalização com agendamento direto de uma reunião privada de consultoria com a Carolina Bravo (presencial no Atelier ou por videochamada privada), com envio prévio do moodboard escolhido pela cliente.
*   **Especificações Técnicas:**
    *   Engine interativa React com transições fluidas e cálculo dinâmico de horas/material.
    *   Integração direta com o WhatsApp Business do Atelier e envio de resumo da consulta em PDF/E-mail.

---

## 4. Provador Virtual & Realidade Aumentada (AR Web-Based)
*   **Conceito:** Permite à cliente visualizar as malas e peças M★BRAVO em escala real (1:1) sobre a sua indumentária ou no seu ambiente antes de concluir a encomenda.
*   **Experiência do Cliente:** Integração fluida no ecrã de detalhe do produto (`ProductDetailPage`) com botão "Projetar no seu Espaço / Provador Virtual".
*   **Especificações Técnicas:**
    *   **Engine WebXR / `<model-viewer>`:** Renderização 3D de altíssima fidelidade sem necessidade de descarregar aplicações externas.
    *   **Simulação de Textura de Fio:** Shaders PBR (Physically Based Rendering) que replicam a luz natural a incidir sobre as malhas e nós do crochet.

---

## 5. Passaporte de Manutenção e Reparações (Luxury Circularity)
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
*   [x] **Redesign Visual de Luxo (PDP & Carrinho), Pílulas de Cor Reativas ao Stock & Notas no Checkout Rápido (`App.tsx` & `AtelierCartDrawer.tsx`):** Correção da propriedade `label` e `detail` em `shippingOptions` para passar strings dinâmicas simples consoante o idioma ativo, reatividade das pílulas de cores ao inventário em tempo real (cores sem stock desativadas com risco discreto e opacidade reduzida), integração do campo de Instruções de Envio / Notas de Personalização no modal de Checkout Rápido ("Comprar Agora"), redução minimalista das amostras de cor (`w-5 h-5` mobile / `w-6 h-6` desktop) com anel de seleção ativo ultra-fino (`ring-1 ring-forest ring-offset-2`), padronização da altura e tipografia de todos os botões CTA (`max-h-[40px] / h-10`, `rounded-sm`, `text-[10px]/[11px]` em caixa alta com `tracking-[0.2em] font-medium`), barra sticky mobile ultra-fina (`py-2 px-4`) com preço total e botão "ADICIONAR", e redução global de escala (~20%) para harmonia visual e elegância de alta-costura.
*   [x] **Scroll Nativo do Admin Dashboard, Leitura Estrita do CMS de Cores & Balão Dourado de Notas (`AdminDashboardModal.tsx`, `App.tsx` & `AtelierCartDrawer.tsx`):** Pausa automática do Lenis (`lenis.stop()`) com isolamento `onWheel` no modal do Admin restaurando o scroll suave por roda do rato/touchpad; fidelidade total das pílulas de cor lidas diretamente do CMS do produto no AdminDashboard; e balão dourado de luxo (`#F6F2EA`) com ícone `<Sparkles />` para "Notas de Envio / Instruções Especial" no Checkout Rápido e na gaveta do carrinho.
*   [x] **Overhaul do Hero com Silicon Valley Spatial UX, Hierarquia Soberana do Logótipo em Landscape, Motion Design de Shrink-Fade no CTA & Escalas Adaptativas Multidispositivo (`src/App.tsx` & `src/translations.ts`):** Redesign do CTA "VER A COLEÇÃO" em etiqueta viva orgânica de vidro transparente suave (`bg-black/20 backdrop-blur-md border-[#C5A059]/40 rounded-[24px_10px_22px_12px]`) com ancoragem elevada e desvanecimento suave no scroll (`ctaY`, `scale: 1 → 0.70`, `opacity: 1 → 0`); correção da regra de escala em modo landscape (`landscape:h-[clamp(16rem,38vh,30rem)]`) devolvendo o tamanho nobre e dominante do logótipo "BRAVO" e slogans em PC, laptops e tablets horizontais; física natural dos 3 balões orgânicos ancorados à foto do Hero que descem e desvanecem no scroll, liberando o Widget Único pós-Hero (`fixed bottom-4 right-4 sm:bottom-6 sm:right-8 z-[60]`) apenas quando o Hero sai da viewport; e dimensões adaptativas ergonómicas por dispositivo.
*   [x] **Design Tokens Universais & Refinamento de UI de Alta-Costura (Grelhas de Cor, SVGs de Pagamento, CTAs Ghost & Responsividade):**
    *   **Amostras de Cor (`TextureSwatchPicker.tsx`):** Diâmetro reduzido para 20-24px (Mobile) e 24-28px (Desktop), formato circular `rounded-full`, anel de seleção `ring-1 ring-[#C5A059] ring-offset-2` mantendo a escala intacta, e mecanismo "VER TODAS" / "RECOLHER" convertido para link minimalista em texto transparente.
    *   **Seletores de Pagamento com SVGs Oficiais (`AtelierCartDrawer.tsx` & `App.tsx`):** Cartões minimalistas `h-11 sm:h-12` com SVGs oficiais centrados e proporcionais (`mbway.svg`, `multibanco.svg`, `visa.svg`, `mastercard.svg`, `applepay.svg`, `googlepay.svg`).
    *   **Hierarquia de CTAs:** Apenas 1 Botão Primário Sólido por ecrã (ex: "Adicionar ao Carrinho" / "Finalizar Encomenda"). Todos os botões secundários ("Comprar Agora", "WhatsApp") em estilo Ghost (`bg-transparent border border-forest/20 text-forest hover:bg-forest hover:text-cream`).
    *   **Garantia de Responsividade:** Margem lateral de segurança mínima e inviolável de 20px (`px-5`) em todas as secções, modais e gavetas.
*   [ ] **Telemetria de Visitantes em Tempo Real (Server-Sent Events - SSE):** Implementação de stream unidirecional leve `/api/admin/telemetry/live` para exibição de utilizadores ativos no site, peças visualizadas no momento e carrinhos em preparação no Painel Admin, com consumo ultrabaixo de recursos e zero sobrecarga de conexões persistentemente mantidas.

---

*M★BRAVO Atelier — Onde o tempo do artesanato de luxo se cruza com a engenharia do futuro.*
