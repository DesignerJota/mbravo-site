# M★BRAVO — Estado Atual do Projeto

Este documento serve como a fonte única de verdade sobre as funcionalidades implementadas, melhorias recentes aplicadas e o planeamento da tarefa atual de desenvolvimento.

---

## 1. Funcionalidades Concluídas (PROIBIDO ALTERAR SEM PERMISSÃO)

As seguintes secções da aplicação estão totalmente validadas, integradas e estabilizadas, sendo consideradas **núcleo intocável** da plataforma M★BRAVO:

*   **Motor de Tradução Internacional (PT/EN):**
    *   Ficheiro `src/translations.ts` centraliza todos os dicionários.
    *   Persistência de idioma preferido do cliente gravado e lido do `localStorage` (`mbravo_lang`).
*   **Design Líquido e Parallax (Lenis Scroll):**
    *   Navegação suave com paragem do scroll do corpo da página ao abrir modais ou drawers regulada pelo Lenis.
    *   Layout responsivo testado em Desktop (1080p, 4K), Tablet (iPad Air/Pro) e Mobile (iPhone/Android).
*   **Gateway de Pagamentos e Checkout:**
    *   Formulário de Checkout completo com recolha de moradas, contacto, NIF e notas de personalização.
    *   Processador de transações simulado de alta fidelidade para cartões, MB WAY e Referências Multibanco.
*   **Sincronização de Armazém de Matérias-Primas:**
    *   Fórmula que associa cada produto de catálogo a consumos específicos de fios no ato de confirmação do pagamento.
*   **Fichas de Cliente CRM (Fase 4):**
    *   Histórico e total de compras por e-mail unificado, sincronizado de forma reativa com o drawer lateral de detalhes de cliente.
*   **Otimização do Hero LCP & Performance Mobile:**
    *   Otimização do carregamento da imagem principal do Hero com tag `<img>` nativa, `fetchPriority="high"`, `loading="eager"` e `decoding="async"` para redução direta do tempo de LCP (Largest Contentful Paint) no Google PageSpeed Insights.
*   **Conformidade de Acessibilidade (Score 90+):**
    *   Estruturação semântica de elementos e preenchimento de atributos `alt` informativos em todas as imagens, garantindo pontuações superiores a 90+ em auditorias Lighthouse.
*   **Code-Splitting do Admin (`React.lazy()` + `Suspense`):**
    *   Segregação do modal administrativo (`AdminDashboardModal`) do bundle principal de entrada, descarregando o código do painel apenas sob procura.
*   **Estabilidade de Bundling do Vite & Framer Motion:**
    *   Remoção de `manualChunks` isolados no `vite.config.ts` para bibliotecas de UI/Motion, garantindo a inicialização coesa do contexto do React (`LayoutGroupContext.mjs`) sem exceções em tempo de execução.
*   **Fase 1 & Fase 2 — Restauração da Arquitetura Estável do Universo M★BRAVO, Sincronização UX & Intro de Luxo "Os Fios Artesanais":**
    *   **Arte de "Alinhavo a Mão" nos Fios M★BRAVO (`LoadingScreen`):** Abertura de luxo inspirada na alta-costura com duas linhas de seda e ouro artesanais ultradelicadas e translúcidas (`strokeWidth="0.75"` e `0.70`). Executam movimentos assimétricos independentes e desencontrados no tempo, imitando a cadência orgânica de uma agulha a coser à mão. Incluem pespontos táctil em crochet (`strokeDasharray="2 6"` e `"3 8"`).
    *   **Desvanecer Poético na Transição para o Hero:** Ao término dos 2.6s, os fios desvanecem suavemente (`exit={{ opacity: 0, scale: 1.03 }}`) no instante em que o ecrã verde floresta (#1F2A18) abre para revelar o Hero de forma fluida, limpa e solene.
    *   **Margens de Segurança e Paridade Absoluta (Mobile Vertical, Horizontal, Tablet & Desktop):** As trajetórias SVG mantêm um corredor central de segurança de mais de 80% de folga e enquadramento responsivo (`landscape:h-16`) que assegura que as linhas de costura NUNCA cruzam ou sobrepõem o emblema M★BRAVO ou os textos em qualquer ecrã ou orientação.
    *   **Iluminação Ambiente Dinâmica & Contador Numérico Reativo (0% a 100%):** Luz dourada em movimento sobre o fundo verde floresta (#1F2A18) acompanhada por uma barra de progresso dourada, estrela M★BRAVO e contador percentual em tempo real durante os 2.6s do ecrã de intro.
    *   **Sincronização Perfeita do Header/Menu (`Navbar` & `LoadingScreen`):** O Header/Menu permanece totalmente invisível (`opacity: 0, pointer-events-none`) durante a animação de abertura da `LoadingScreen` e surge suavemente com animação em cascata (Logo, Links e Seletor de Idioma) apenas após o término do ecrã de intro, perfeitamente sincronizado com a revelação do Hero.
    *   **Eliminação de Hacks de Scroll Autogerados:** Removidos os scripts de temporização e scroll forçado no arranque do `App.tsx` que causavam saltos indesejados para a coleção no preview e nos browsers móveis. O arranque inicia rigorosamente no topo (`window.scrollTo(0, 0)`).
    *   **Customização Completa do Hero Restabelecida (Crossfade das 4 Imagens WebP):** Fusão e rotação automática e contínua das 4 imagens locais de alta resolução da pasta `/public` (`/hero-bg-1-mobile.webp` a `/hero-bg-4-mobile.webp` e equivalentes desktop) com transição de opacidade de 2.2s a cada 8 segundos, acompanhada de recuperação automática via `onError` que remove tags `<source>` em caso de falha e redireciona para a imagem de reserva.
    *   **Intro Autêntica M★BRAVO (`LoadingScreen`):** Animação fluida e coesa do logótipo dourado e slogan da marca sobre fundo verde floresta (#1F2A18), com saída suave por deslize e revelação refinada da aplicação.
    *   **Imagens Responsivas Otimizadas em WebP:** Preload no `<head>` das imagens chave do Hero e etiquetas responsivas com `<picture>` e `<source media>` para máxima velocidade sem abdicar da fidelidade visual.
    *   **Defer de Scripts de Terceiros (Pinterest Pixel):** Execução do script do Pinterest postergada para após o carregamento inicial da página (`window.onload` + `setTimeout 2s`), eliminando bloqueios na thread principal durante FCP e LCP.
    *   **Code-Splitting Avançado & Lazy Loading de Modais (`React.lazy()`):** Extração de modais pesados (`LegalModal`, `AdminDashboardModal`) para chunks dinâmicos isolados.
    *   **Otimizações de Bundling Vite (`vite.config.ts`):** Ativação de minificação `esbuild` de alta performance, desativação de sourcemaps em produção, `target: 'es2020'` e minificação CSS nativa.
    *   **Eliminação de Flicker no iOS WebKit:** Aceleração por hardware GPU (`transform: translateZ(0)` e `backface-visibility: hidden`) aplicada em todos os elementos visuais chave.

---

## 2. Ajustes Recentes Aplicados (Navegação de Categorias)
Respondendo às últimas solicitações de otimização de fluxo e consistência de marca, aplicámos as seguintes melhorias técnicas na página de listagem de categorias de produtos:

1.  **Botão de Regresso Otimizado:**
    *   O botão no topo e rodapé das listagens de categoria, que anteriormente dizia *"Voltar ao Início"* e direcionava para o topo do site (Hero), foi reconfigurado.
    *   **Novo Texto:** **"Voltar à Coleção"** (PT) e *"Back to Collection"* (EN).
    *   **Redirecionamento:** Aponta agora diretamente para a secção de coleções da homepage (`/#collection` ou `/#colecao`).
    *   **Mapeamento de Scroll Suave:** O evento de navegação personalizado `mbravo-navigate` intercepta a rota, traduz `#colecao` para `#collection` e aciona o scroll preciso do Lenis até ao topo da grelha de produtos com uma duração elegante de 1.2s, mantendo o utilizador no contexto correto de compra.
2.  **Contador de Itens Simplificado:**
    *   A expressão original *"X peças únicas"* que exibia o número de artigos da categoria foi considerada em desalinho com o tom premium e profissional pretendido.
    *   **Nova Expressão:** **"X Produtos"** (PT) e *"X Products"* (EN), mantendo o número dinâmico reativo aos filtros.
3. **Ajuste da Label do 2.º Seletor de Cor na African Flower Pouch:**
    *   Ajustado de "COR DO CORDÃO" para "COR DO DETALHE" (ou rótulo configurado no catálogo), reservando "COR DO CORDÃO" unicamente a peças com fio/cordão (como Mini Pouches).
4.  **Otimização Nativa de Scroll e Lenis Isolation no Modal & Drawer de Checkout:**
    *   **Atribuição do Atributo `data-lenis-prevent`:** Adicionado aos containers e wrappers de modais (`CartCheckoutModal.tsx`, `AtelierCartDrawer.tsx` e `App.tsx`) impedindo que o scroll global do Lenis interfira com o movimento interno das listas e formulários.
    *   **Barra de Scroll Estética e Fluida M★BRAVO:** Substituídas as regras rígidas `scrollbar-thin` por uma scrollbar ultradelicada e responsiva em `index.css` (6px com thumb arredondado `#243119` a 18% de opacidade e transição para 40% em hover), mantendo a inércia tátil e scroll nativo suave em desktop e dispositivos móveis (`-webkit-overflow-scrolling: touch` e `overscroll-behavior: contain`).
    *   **Purga de Dados Falsos e Placeholders Limpos:** Todos os formulários de checkout no site e na gaveta do carrinho foram sanitizados para exibir campos rigorosamente limpos com placeholders genéricos oficiais em Português e Inglês (ex: `"Nome completo do destinatário"`, `"nome@dominio.com"`, `"9xx xxx xxx"`, `"Morada completa de entrega"`, `"XXXX-XXX"` e `"Cidade / Localidade"`). Zero dados simulados ou pré-preenchidos.
5.  **Seleção Dinâmica de Produtos/Cores no Registo Manual de Encomendas & Abatimento de Stock Bicolor:**
    *   Substituição de texto livre por dropdowns dinâmicos ligados ao catálogo e desmembramento automático do par de cores bicolores para abatimento proporcional no inventário de matérias-primas.
5.  **Cópia Oculta (BCC) dos E-mails de Expedição para o Atelier:**
    *   Configurado em `src/lib/emailService.ts` o envio automático em BCC para `handmade.mbravo@gmail.com` e `encomendas@mbravobycarolina.com`.
6.  **Modal Interna de Pré-Visualização de E-mails HTML ("Ver E-mail CTT Enviado"):**
    *   Criado o endpoint `GET /api/admin/orders/:orderId/email-preview` no `server.ts` e integrada modal no `AdminDashboardModal.tsx` com renderização fidedigna em `<iframe>` e opção "Abrir em Nova Aba".
7.  **Modalidade "Entrega em Mão / Concluído":**
    *   Adicionado o botão "Entrega em Mão" no painel administrativo para encomendas "No Atelier", permitindo transitar para "Entregue" sem exigir código CTT.

8.  **Reestruturação Visual do Checkout e Carrinho em Mobile/Tablet ("Full-Screen / Bottom Sheet Luxury Standard"):**
    *   **Reformulação Completa do `CartCheckoutModal.tsx` & `AtelierCartDrawer.tsx`:** Substituídos os modais flutuantes cortados por um layout *Slide-up Bottom Sheet* de luxo que ocupa 100% da largura do ecrã e ~92% da altura em dispositivos móveis e tablets (`h-[92dvh] rounded-t-[28px] md:rounded-none md:w-[420px]`).
    *   **Header Fixo (Sticky Header) com Barra Indicadora de Arraste:** Título da encomenda, indicador visual de marca M★BRAVO e botão de fechar (X) fixos e acessíveis no topo com pega de toque (`drag indicator handle`).
    *   **Corpo com Scroll Nativo e Inércia Tátil Livre:** Conteúdo interno isolado com o atributo `data-lenis-prevent` e classe `touch-pan-y`, garantindo que o scroll de toque de produtos e formulários flui naturalmente sem travar nem acionar o scroll do corpo da página.
    *   **Footer Fixo (Sticky Footer CTA):** Resumo financeiro, seletor de portes e o botão principal de ação (*"Concluir Encomenda • 71.30€"*) permanecem fixos e imediatamente acessíveis pelo polegar no fundo do ecrã.
    *   **Limpeza Tipográfica & Espaçamentos Editoriais:** Inputs com peso visual suavizado, sombras suaves, bordas delutadas em verde floresta (#243119/10) e ecrã de sucesso responsivo com botões fáceis de tocar.
    *   **Unificação Absoluta do Componente de Pagamento da Loja (`CartCheckoutModal.tsx`):** Eliminada a duplicidade de interfaces entre o botão "Comprar Agora" do produto e o checkout do carrinho. O "Comprar Agora" adiciona o produto e abre de imediato o `CartCheckoutModal.tsx` oficial. Toda a loja opera agora sob uma única e sofisticada interface de checkout Slide-Up Bottom Sheet com Header fixo e Sticky Footer de pagamento.
    *   **Conformidade de Marca (Apple Pay / Google Pay Brand Guidelines), Deteção Dinâmica de Ecossistema e Adaptabilidade Landscape (`CartCheckoutModal.tsx`):** Integração rigorosa dos vetores oficiais e padrões de marca Apple Pay e Google Pay em fundo preto luxo sem texto secundário. Implementada deteção dinâmica de ecossistema (`isApple` vs `isAndroid`) para renderizar os botões relevantes por dispositivo, isolamento estrito de eventos (`e.stopPropagation()` com `activeExpressWallet`) impedindo reações visuais cruzadas, e adaptabilidade fluida a orientação horizontal (`landscape:h-[95dvh]`, paddings ajustados e travamento de corte em ecrãs com baixa altura vertical).
    *   **Validação Inteligente e Sugestão de Correção de E-mail:** Inclusão de verificação de erros ortográficos comuns em domínios de e-mail (ex: `gmai.com` -> `gmail.com`) com sugestão interativa de correção automática de 1-clique.
    *   **Injeção de Google Avaliações do Consumidor (Merchant Center Opt-in) & Link Oficial (`CartCheckoutModal.tsx` & `App.tsx`):** Injeção do script oficial do Google Customer Reviews no ecrã de confirmação de encomenda (Thank You Page) com script de Opt-in do Merchant Center (ID: `535728392`) e cartão interativo com 5 estrelas douradas direcionado para o link oficial de avaliação Google Maps (`https://g.page/r/Cdo7JGP_Xpc3EBM/review`).
    *   **Sitelinks e SEO de Luxo (`index.html`):** Atualizada a tag `<title>` para `M★BRAVO | Handmade With Love` e refinadas as meta tags e Schema.org com a estrela oficial "M★BRAVO" para otimização de Sitelinks e autoridade de marca no Google.
    *   **Registo Oficial da Identidade de Marca (Variações de Estrelas):** Documentado oficialmente que a marca utiliza a Estrela Preenchida ("★") como variação soberana para SEO, `<title>`, Meta Tags e Og Tags, e a Estrela Contorno ("☆") como variação estilística secundária para detalhes de UI/UX e catálogo.
    *   **Ajuste do Checkout Expresso (Apple Pay & Google Pay SVGs) & Suporte Landscape:** Corrigidos os viewBoxes dos SVGs das carteiras digitais (Apple Pay: `viewBox="0 0 220 80"`, Google Pay: `viewBox="0 0 82 28"`), eliminando qualquer corte de texto ou distorção. Implementado suporte responsivo avançado para orientação horizontal (mobile landscape) no `CartCheckoutModal.tsx` e `AtelierCartDrawer.tsx` com botões de fechar (X) e rodapés acionáveis sempre fixos e acessíveis (`shrink-0 z-30`).
    *   **Isolamento Total via React Portal (`createPortal`):** `CartCheckoutModal.tsx` e `AtelierCartDrawer.tsx` renderizados exclusivamente no nó raiz do DOM (`document.body`), garantindo isolamento total de stacking context e eliminando interrupções visuais ou de scroll.
    *   **Gestão Mutuamente Exclusiva de Modais & Body Scroll Lock:** `CartContext.tsx` garante que apenas um modal exista no viewport por vez, bloqueando ativamente o scroll do corpo da página (`document.body.style.overflow = 'hidden'`) enquanto o checkout/carrinho está ativo.
    *   **Arquitetura Flex-Layout Adaptável (Landscape & Dispositivos Móveis):** Estrutura vertical rígida em Flexbox (`h-full max-h-[92dvh] landscape:max-h-[95dvh]`) com Header fixo (`shrink-0`), Corpo de formulário com scroll isolado (`flex-1 min-h-0 overflow-y-auto touch-pan-y`) e Footer fixo (`shrink-0`).
    *   **Padronização do Bloco do Botão Expresso:** Container rígido flexível (`w-full h-12 bg-black rounded-lg flex items-center justify-center`) com SVG nativo centralizado (`h-6 w-auto`), sem distorções de aspeto em qualquer ecrã.
    *   **Purga de Formulários Inline de Faturação:** Removida qualquer interface de faturação inline no `ProductModal` (`App.tsx`), consolidando toda a experiência de compra no portal unificado do `CartCheckoutModal.tsx`.

---

## 3. TAREFA ATUAL (Polimento Final, Sanitização Estrita & Purga de Sandbox de Produção)
*   **Estado:** **Concluído com Sucesso, Auditado e Validado para Produção de Luxo**.
*   **Ações Realizadas:**
    1.  **Validação Estrita & Sanitização de Dados (Frontend e Backend):**
        *   **Máscara de Código Postal Português (`formatPostalCodePT` / `formatPostalCode`):** Auto-formatação no padrão `XXXX-XXX` tanto na criação manual de encomendas no Admin como nas rotas de servidor.
        *   **Validação Estrita de E-mail (`isValidEmailStrict` / `isValidEmail`):** Verificação por expressão regular (`/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`) rejeitando e-mails inválidos.
        *   **Sanitização de Texto & Números (`sanitizeText`, `sanitizeNumber`):** Higienização de campos com remoção de espaços extra (`trim()`), filtragem de carateres em telefones/NIFs e conversão robusta de preços.
    2.  **Formatação de Telemóvel para Leitura Humana (`formatPhoneReadable`):**
        *   Criada a função `formatPhoneReadable` que aplica a máscara visual de leitura (ex: `+351 917 827 458`) em todos os pontos de apresentação do Admin e nos templates de e-mail do `emailService.ts`.
    3.  **Purga Absoluta de Termos de Teste/Sandbox:**
        *   Remoção rigorosa de rótulos como `AUDITORIA SANDBOX DE E-MAILS`, `[TESTE]`, `[SANDBOX]` e simulações técnicas nas traduções (`translations.ts`), no Admin (`AdminDashboardModal.tsx`), nos botões do site (`App.tsx`) e em todos os templates de e-mail do `emailService.ts`.
        *   Atualizada a nomenclatura para termos de alta-costura e e-commerce de luxo (`Comprovativos de Encomenda`, `Recibo do Cliente`, `Notificação de Envio`, etc.).
    4.  **Remoção do Valor por Defeito do Instagram no CRM (Pilar 1):**
        *   Removida a atribuição automática de `@carolina_mbravo` na Ficha de Cliente do CRM. O campo inicia 100% limpo com o placeholder discreto `@utilizador`, permitindo o registo manual do utilizador real do cliente.
    5.  **Limpeza Visual e Gestão de Encomendas (`/api/admin/orders/delete`):**
        *   Inclusão das ações de **Cancelar** e **Eliminar** (com janela de confirmação) para gerir encomendas manuais ou de teste com recalculo automático das métricas no Admin.
    6.  **Confirmação Estrita e Exclusiva de Pagamento via Webhook Stripe:**
        *   Refatorado o fluxo de pagamentos no `server.ts`. O endpoint `/api/payment/create-intent` cria o registo da encomenda exclusivamente com o estado `pending_payment`.
        *   A alteração do estado para `paid` e a emissão automática de e-mails de confirmação de encomenda ocorrem ESTRITAMENTE e EXCLUSIVAMENTE após a receção e validação do evento `payment_intent.succeeded` enviado pelo Webhook do Stripe (ou consulta verificada de status `succeeded`).
        *   Zero tolerância para assunção otimista de pagamentos ou marcadores de "PAGO & LIQUIDADO" em transações não liquidadas no Stripe. Fallbacks e exceções registam o estado como `failed` ou mantêm em `pending_payment`.
    7.  **Eliminação Total de Dados Fantasma ("Tamanho: M"):**
        *   Purga total da atribuição automática do tamanho por defeito `"M"` em artigos sem variação de tamanho (malas, bolsas, African Flower Pouch, Mini Pouches, Coasters e artigos de casa).
        *   Garantida a passagem de `tamanho = ""` e `hasSize = false` quando o produto não possui opção de tamanho.
        *   Tratamento condicional no `emailService.ts` e no Painel Admin (`AdminDashboardModal.tsx`), omitindo totalmente o rótulo de tamanho para peças sem variação.
    8.  **Notificação de Encomenda Manual e Armazenamento em Volume JSON (server.ts / emailService.ts):**
        *   Atualizada a rota `/api/admin/orders/create` para ser 100% assíncrona (`async`).
        *   Removida qualquer tentativa de ligação a bases de dados PostgreSQL/externas nesta rota, garantindo a gravação exclusiva no Volume/Ficheiro JSON local (`loadOrders()` / `saveOrders()`), prevenindo erros de rede `ENETUNREACH` na Railway.
        *   Mantida a função `sendAtelierNotificationOnly` no `emailService.ts` que envia a notificação por e-mail em segundo plano via Resend exclusivamente para o Atelier (`encomendas@mbravobycarolina.com`) com a tag de prioridade, sem enviar qualquer mensagem para o cliente.
    9.  **Blindagem CORS e Preflight OPTIONS no Backend (`server.ts`):**
        *   Configurado o middleware CORS em `server.ts` para permitir explicitamente a origem de produção `https://mbravobycarolina.com`, aceitando os cabeçalhos `X-Admin-Password`, `Authorization`, `Content-Type` e respondendo com status 200 OK em requisições `OPTIONS` (preflight).
    10. **Melhorias de UX, Scroll Nativo e Formatação de Telemóvel no CRM Drawer (`AdminDashboardModal.tsx`):**
        *   Adicionada navegação por scroll vertical fluida e nativa ao corpo do Drawer (Ficha de Cliente) com `-webkit-overflow-scrolling: touch` e `touch-pan-y` para roda do rato e gestos tátil.
        *   Ajustado o campo de telefone no CRM Drawer para apresentar a máscara de leitura humana `+351 9xx xxx xxx` (`formatPhoneReadable`), mantendo a consistência visual com o cartão principal de encomenda.
    11. **Refatoração do Motor de Persistência e Boot Read-Only (`server.ts`):**
        *   Implementado o protocolo de **Boot Estritamente Read-Only** em todas as funções de carregamento de dados do servidor (`loadOrders`, `loadCustomers`, `loadInventory`, `loadCatalog`, `loadLogs`, `loadTestimonials`).
        *   Garantida a **Soberania do Volume Persistente (`/app/data/`)**: o estado ativo de produção no Volume é a fonte soberana de verdade e nunca é modificado nem sobrescrito durante o boot por ficheiros estáticos do repositório.
        *   Removidas todas as execuções de `writeFileSync` ou fusão em disco no arranque.
        *   Qualquer mutação física de dados em disco ocorre exclusivamente por via de requisições explícitas às rotas de API (`POST`, `PUT`, `DELETE`).
    12. **Arquitetura Resiliente de Testemunhos em 3 Camadas (`server.ts`):**
        *   Adicionado o parâmetro `connectionTimeoutMillis: 3000` no `pg.Pool` de PostgreSQL com listener não-bloqueante para `error` e suporte a falhas de rede/DNS IPv4.
        *   Construído o motor `fetchTestimonials3Layers()` de alta disponibilidade com fallback transparente: Nível 1 (PostgreSQL DB) -> Nível 2 (Google Places API direto) -> Nível 3 (Volume Persistente `testimonials.json`).
        *   Garantido o isolamento absoluto da rota e tabelas de testemunhos para que falhas de conexão de base de dados relacional emitam apenas avisos informativos (`console.warn`) sem nunca afetar o arranque, o checkout ou o catálogo de produtos.
    13. **Atualização de Inventário Real de Matérias-Primas — Encomenda #18241, Abas & Seletor Inteligente (`inventory.json` & `AdminDashboardModal.tsx`):**
        *   Substituição integral do stock de matérias-primas pelo lote real recebido do Armazém das Manualidades (Encomenda #18241): **37 novelos DROPS Safran** e **58 novelos DROPS Paris**, preservando a linha de embalamento e acessórios.
        *   Atualização da interface do Admin Dashboard (`/admin` -> `AdminDashboardModal.tsx`) com filtragem limpa por prefixos de ID (`rm_safran_`, `rm_paris_` e acessórios) e exibição do número de referência com nome limpo (ex: `Ref. 18 - Natural`).
        *   Criação do **Seletor Inteligente de Cores no CMS do Catálogo**: substituição do input de texto livre por badges interativos dinâmicos com contagem de stock em tempo real de novelos Safran e Paris, botões de atalho ("Selecionar Todas", "Limpar") e campo de edição direta, garantindo alinhamento perfeito de 100% no abatimento automático de stock do Atelier.
    14. **Miniaturas de Amostras Visuais (Swatches 28x28px & 20x20px) extraídas da Encomenda #18241 (`AdminDashboardModal.tsx`):**
        *   Integração do componente `YarnSwatch` e tabela de mapeamento de cores exatas (`YARN_COLOR_MAP`) com os tons e texturas autênticos extraídos diretamente do PDF da Encomenda #18241 do Armazém das Manualidades.
    15. **Correção Crítica do Fluxo do Carrinho, Totais com Portes em "Comprar Agora", Responsividade Mobile e Ajuste de Copy:**
        *   **Fluxo Completo "Concluir Encomenda":** O botão de ação no Atelier Cart Drawer abre de forma fluida o modal de Checkout (`CartCheckoutModal.tsx`), apresentando o formulário completo de dados de envio, morada e seleção de pagamentos (MB WAY, Cartão Stripe, Multibanco) com o resumo do pedido e portes por região sempre visíveis.
        *   **Sincronização do Total no "Comprar Agora" (Checkout Rápido):** Corrigido o cálculo e injeção do valor total recalculado (subtotal + portes da região selecionada, ex: 67,00€ + 4,30€ = 71,30€) no botão verde de pagamento e em todos os seletores de método (`MB WAY`, `Cartão`, `Multibanco`), garantindo que o valor cobrado e processado no Stripe/backend é rigorosamente o valor final correto.
        *   **Restauração da UI Editorial Mobile/Tablet & Remoção do Blur Exagerado:** Removido o filtro de blur escuro denso do fundo, substituído por um overlay translúcido discreto e limpo (`bg-forest/20`). Reconfigurado o container móvel (`max-h-[88dvh]`, `min-h-0`, `touch-pan-y`) para garantir scroll tátil nativo suave sem bloqueios de ecrã ou botões cortados em qualquer resolução.
        *   **Ajuste de Copy Editorial:** Atualizada a frase do balão promocional no carrinho de "Portes fixos para a sua seleção" para **"Portes fixos para a sua encomenda"**.
        *   **Garantia de Não-Regressão de Pagamentos e E-mails:** Mantidas operacionais a 100% todas as integrações de pagamento e os disparos assíncronos de e-mails de confirmação.
        *   **Tabela de Stock de Matérias-Primas**: exibe amostragem visual de 28x28px (`w-7 h-7`) com cantos arredondados, gradiente e textura tátil de fio ao lado de cada referência (ex: `[Swatch Visual] Ref. 18 - Natural`).
        *   **CMS de Edição de Produtos**: exibe amostragem miniatura discreta de 20x20px (`w-5 h-5`) dentro de cada badge interativo de seleção de cor, mantendo a janela do CMS limpa, legível e altamente funcional.
    15. **Consolidação de Ficheiros JSON em `/app/data/` & Lógica de Smart Upsert no Boot (`server.ts`):**
        *   Eliminação total de ficheiros JSON duplicados ou soltos na raiz (`inventory.json`, `orders.json`), consolidando 100% das bases de dados vivas (`inventory.json`, `orders.json`, `catalog.json`, `customers.json`, `audit_logs.json`, `testimonials.json`) exclusivamente no volume persistente `/app/data/`.
        *   Implementação da **Lógica de Fusão Inteligente (Smart Upsert)** em `loadInventory()` no arranque do servidor: deteta e injeta autonomamente quaisquer novas referências de matérias-primas introduzidas em código sem nunca sobrescrever nem alterar as quantidades reais atualizadas pelo Admin em produção.
    16. **Inclusão de 2 Novas Cores de Matéria-Prima — DROPS Paris #17 & DROPS Safran #76 (`server.ts` & `AdminDashboardModal.tsx`):**
        *   Adição de **DROPS Paris #17 Natural** (Hex `#F3EBE1`, ID `rm_paris_17_natural`) e **DROPS Safran #76 Azul Pó** (Hex `#B8D8EB`, ID `rm_safran_76_azul_po`) ao `DEFAULT_INVENTORY` e ao mapa de amostras visuais `YARN_COLOR_MAP`.
        *   Garantida a preservação integral e inviolável de 100% dos dados de catálogo e produtos da Carolina na Railway via Smart Upsert automático, sem tocar nem sobrescrever o ficheiro `catalog.json`.
    17. **Novo Campo de Consumo de Matéria-Prima por Cor Selecionada no CMS (`AdminDashboardModal.tsx` & `server.ts`):**
        *   **Modal de Edição do Produto**: adicionado o painel "Consumo de Matéria-Prima por Cor Selecionada (por Peça)", onde o Admin/Carolina pode especificar individualmente o consumo de fio (em novelos ou gramas, ex: `0.5` ou `0.25` novelos) por cada cor ativa de matéria-prima.
        *   **Estrutura do Modelo de Dados**: atualizado o objeto de produto com o dicionário `colorConsumptions: Record<string, number>` que mapeia a cor ao consumo unitário correspondente, mantendo total retrocompatibilidade com produtos existentes em `/app/data/catalog.json`.
        *   **Calculadora de Necessidades de Stock**: atualizado o cálculo em `getMaterialsNeededForProduct` em `server.ts` para multiplicar o consumo personalizado unitário pela quantidade da encomenda (`customConsumption * quantity`). Se um produto não tiver consumo definido, assume por defeito `1.0` novelo/unidade por segurança.
    18. **Execução Imediata de Smart Upsert no Arranque do Servidor (`server.ts`):**
        *   Invocação direta da função `loadInventory()` dentro de `startServer()` durante o arranque do contentor em produção.
        *   Análise dual por ID (`id`) e nome normalizado (`name`), detetando e intercalando autonomamente as novas referências de matérias-primas (`rm_paris_17_natural` e `rm_safran_76_azul_po`) na base viva de `/app/data/inventory.json` logo no arranque do servidor, preservando a 100% todo o stock e registos introduzidos pela Carolina.
    19. **Sanitização de Decimais com Vírgula para iPad / Teclados PT e Toast Banner (`AdminDashboardModal.tsx`):**
        *   **Compatibilidade iPad & Teclados Portugueses**: alterado o campo de input de consumo por cor para `type="text"` com `inputMode="decimal"`. Na submissão do formulário (`onSubmit`), todas as entradas de consumo são automaticamente higienizadas (`replace(',', '.')`) e convertidas com segurança para números `float`.
        *   **Notificação Visual Toast Reativada**: adicionado o banner flutuante de confirmação `saveNotification` com animação e ícone de sucesso, que é ativado automaticamente ao confirmar qualquer peça ou ao guardar o catálogo no servidor.
    20. **Ícones Genéricos para Acessórios & Sincronização de Inventário (`AdminDashboardModal.tsx` & `server.ts`):**
        *   **Ícones Lucide na Categoria Acessórios & Embalamento**: os elementos da categoria de Acessórios deixaram de apresentar o quadrado/swatch de lã de cor e passaram a exibir ícones visuais dedicados (`Tag` para Etiquetas em Couro M★BRAVO, `Package` para Caixas Premium, `Scissors` para Fechos de Correr, `Disc` para Botões de Madeira, e `Layers` para Tecido de Forro).
        *   **Purga de Matérias-Primas Obsoletas**: o carregamento e arranque do servidor (`loadInventory()` em `server.ts`) assim como o filtro do painel frontal em `AdminDashboardModal.tsx` purgam automaticamente quaisquer referências antigas a fios de algodão (`rm_fio_algodao`, `algodão cru`, `cacau escuro`), mantendo a categoria de Acessórios & Embalamento estritamente limitada aos 5 itens reais e oficiais.
    21. **Imagem Real do Botão de Madeira M★BRAVO & Thumbnails de Inventário Ampliados (`AdminDashboardModal.tsx`):**
        *   **Fotografia Real do Botão de Madeira (`rm_botao_madeira`)**: em vez do ícone genérico, o componente `YarnSwatch` agora renderiza diretamente a imagem oficial em alta resolução (`https://i.ibb.co/gL2FL6LW/Botao-M-BRAVO-3.png`) com `object-contain`, mantendo a foto em destaque sobre um fundo suave `#FAF7F2`.
        *   **Aumento de Thumbnails na Tabela de Inventário**: o tamanho de todas as amostras/thumbnails de matérias-primas no separador de Inventário foi ampliado para **48×48 px** (`w-12 h-12` em Tailwind), mantendo o padding da tabela (`py-3.5`) perfeitamente ajustado sem esticar as linhas.
    22. **Seletor de Configuração de Cor da Peça (Cor Única, Bicolor e Edição Fixa) (`AdminDashboardModal.tsx`):**
        *   **Suporte a Peças Bicolores (`bicolorConsumptions`)**: adicionados campos dedicados para definir autonomamente o consumo da **Cor Principal** (ex: 0.8 nov) e da **Cor de Detalhe** (ex: 0.4 nov) para peças bicolores como a *African Flower Pouch*.
        *   **Modo Edição Fixa / Cor Padrão (`fixed`)**: permite registar consumos de matérias-primas e cálculo exato de margem para peças com paleta estática (ex: *Daisy Coasters*), sem forçar o cliente a escolher cores na loja.
        *   **Preservação de Dados Existentes (`single`)**: 100% retrocompatível; todas as peças já guardadas assumem o modo de Cor Única sem alterar consumos existentes.
    23. **Regra de Exibição Dinâmica de Consumos & Pílulas de Cor de Luxo (`AdminDashboardModal.tsx`):**
        *   **Exibição Exclusiva de Campos por Tipo de Peça**: Quando selecionado "Peça Bicolor", são exibidos apenas os campos de Consumo Cor Principal e Cor Secundária, ocultando a secção inferior de cores individuais para eliminar duplicações. Quando selecionado "Cor Única" ou "Edição Fixa", a secção inferior de consumos individuais é apresentada normalmente.
        *   **Suavização de Textura de Amostra de Cor**: Reduzida a opacidade da quadrícula/textura sobreposta para 5% e atenuado o gradiente em `YarnSwatch`, revelando a cor base pura e fiel aos tons reais dos fios (estética de alta moda de luxo).
    24. **Refactoring UI/UX e Micro-copy de Atelier (`AdminDashboardModal.tsx`):**
        *   **Auditoria PT-PT**: Atualizados os rótulos globais de formulário para máxima precisão técnica ("Unidades em Stock", "Prazo de Produção (dias)", "Ocultar produto na loja" e botão "Guardar Alterações").
        *   **Simplificação Visual de Pílulas de Cor**: Removidos os subtextos cinzentos explicativos abaixo dos seletores e o bloco amarelado de "Edição Fixa", reduzindo a altura do formulário e eliminando ruído visual.
        *   **Micro-copy de Luxo**: Rótulo da paleta atualizado para "Matérias-Primas e Paleta" (sem frases redundantes de sincronização) e campos de consumo bicolor compactados para "Consumos (Bicolor)", "Cor Principal (nov)" e "Cor do Detalhe (nov)".
        *   **Limpeza Minimalista Final**: Removida a etiqueta de instrução por cima do input de cores ativas (mantido placeholder limpo `Ex: 10 - Natural, 16 - Branco`); simplificado o bloco inferior para "Consumo por Cor (nov)", eliminando frases e badges redundantes de "Padrão: 1.0 nov/peça".
    25. **Padronização Ergonomica do Posicionamento dos Campos de Consumo (`AdminDashboardModal.tsx`):**
        *   **Atualização de Nomenclatura**: Alterada a designação da 3ª opção de configuração de cor para **"Cor Padrão"** (alinhada com a linguagem de atelier).
        *   **Definição Imediata de Consumo no Topo (Cor Única & Bicolor)**: Em modo *Cor Única*, surge imediatamente abaixo do seletor o campo limpo `Consumo por Peça (nov)`, permitindo definir o consumo diretamente no topo sem precisar de scroll. Em modo *Peça Bicolor*, mantém os campos de `Cor Principal (nov)` e `Cor do Detalhe (nov)` no topo.
        *   **Exibição Exclusiva do Bloco Inferior**: A grelha inferior `Consumo por Cor (nov)` é apresentada exclusivamente quando a peça está configurada em modo *Cor Padrão*, ocultando-se totalmente nos modos *Cor Única* e *Peça Bicolor* para eliminar redundâncias e garantir um formulário 100% limpo.
    26. **Revisão Global de Copywriting, E-mails Bcc, Modal CTT e Abatimento de Acessórios (`translations.ts`, `App.tsx`, `LegalModal.tsx`, `emailService.ts`, `server.ts`, `AdminDashboardModal.tsx`):**
        *   **Expurgo de Termos Proibidos**: Removidas 100% das ocorrências das palavras "TECIDA", "CONFECIONADA" e "CONFEÇÃO" de todo o ecossistema ativo. Substituição por termos nobres de atelier ("feita à mão no nosso atelier", "criada artesanalmente", "elaborada peça a peça").
        *   **Refinamento do Bloco Google Review**: Simplificação do bloco de avaliação no e-mail CTT para um formato minimalista e sofisticado.
        *   **E-mails de Expedição com Bcc para o Atelier**: Configuração automática de Bcc para `encomendas@mbravobycarolina.com` no envio do e-mail de rastreio CTT.
        *   **Visualizador de E-mail CTT via Modal/Iframe**: O botão "Ver E-mail CTT Enviado" no Admin abre uma janela modal com o HTML real gerado, eliminando redirecionamentos para 404/homepage.
        *   **Categorização por Referência em Vendas Manuais**: As opções de cor na criação de encomendas manuais estão agora organizadas em `<optgroup>` por qualidade (*DROPS Safran 100% Algodão Egípcio* e *DROPS Paris 100% Algodão Reciclado*).
        *   **Checklist & Abatimento de Acessórios & Ferragens**: Adicionada secção de seleção de Acessórios & Embalamento (Etiqueta de Couro, Caixa Premium, Fecho de Correr, Forro de Algodão, Botão de Madeira) na criação de venda manual, com abatimento automático e preciso no inventário.
    27. **Otimizações de Ergonomia Responsiva & Full-Screen Mobile (`AdminDashboardModal.tsx`):**
        *   **Modais em Ecrã Inteiro no Mobile**: Modais de edição de peças e de matérias-primas ajustados para 100% de largura e altura (`w-full h-full max-h-screen rounded-none`) em dispositivos móveis (`<640px`), eliminando amontoamento e esmagamento de elementos.
        *   **Grelha Responsiva de Pílulas de Matéria-Prima**: Reestruturada a paleta de novelos DROPS Safran e DROPS Paris para layout de grelha responsiva (`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3`), alinhando perfeitamente a amostragem visual e contagem de novelos sem quebras de texto em iPhone/iPad.
        *   **Sticky Footer para Botões de Ação**: Botões "Cancelar" e "Guardar Alterações" organizados em container flexível e fixo ao fundo (`flex flex-col sm:flex-row gap-2.5 sticky bottom-0`), garantindo toque ergonómico instantâneo em qualquer ecrã sem exigir scroll excessivo.
        *   **Navegação por Separadores e Cabeçalho Adaptativo**: Cabeçalho do Admin e estatísticas com grelha adaptativa (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`) e barra de navegação com `overflow-x-auto` e `-webkit-overflow-scrolling: touch` para navegação fluida em telemóveis.
    27. **Padronização Sistémica das 4 Regras Globais de UI/UX Responsiva (`AdminDashboardModal.tsx`):**
        *   **Regra 1 (Modais & Overlays Mobile Full-Screen)**: Garantida abertura em ecrã completo (`w-full h-full max-h-screen rounded-none`) em dispositivos móveis (`<640px`) para todos os modais da plataforma (Admin principal, Edição de Produto, Edição de Matéria-Prima e Ficha de Cliente CRM), mantendo Sticky Header (botão Fechar) e Sticky Footer (botões Cancelar/Guardar/Gravar) para ergonomia de toque superior.
        *   **Regra 2 (Grelhas Adaptativas & Nula Força de Scroll Lateral)**: Aplicadas grelhas progressivas `grid-cols-1` em mobile, `grid-cols-2` em tablet e `grid-cols-3`/`grid-cols-4` em desktop para todos os cartões, métricas bento de Vendas, formulários de venda manual e cartões de catálogo, eliminando qualquer pixel fixo que provocasse scroll horizontal na página principal.
        *   **Regra 3 (Navegação por Barras Deslizantes em Mobile)**: Convertidas todas as barras de abas e menus de contexto (menu de abas principal do Admin, barra de filtros de estado de encomendas, seletor de coleções do CMS Catálogo e sub-separadores de inventário de matérias-primas DROPS Safran/Paris) em containers horizontais deslizantes (`flex overflow-x-auto no-scrollbar shrink-0`), mantendo a navegação fluida sem empilhamento vertical de botões.
        *   **Regra 4 (Tipografia e Áreas de Toque Seguras)**: Escala tipográfica adaptativa e botões de ação ("Editar", "Eliminar", "Ocultar", "Ver Ficha", "Reativar") blindados com `whitespace-nowrap` e áreas de toque alargadas (`p-2`, `py-2.5`), garantindo acionamento confortável pelo polegar em ecrãs táteis de smartphones sem quebra de linhas.
    28. **Inclusão de Acessórios & Ferragens no CMS de Produtos (Receita BOM - Bill of Materials) & Motor de Inventário (`AdminDashboardModal.tsx` & `server.ts`):**
        *   **Ficha de Produto / CMS (`AdminDashboardModal.tsx`)**: Integrado o painel interativo *"Acessórios & Ferragens Associadas (Receita BOM)"* na edição de cada peça do catálogo. Permite definir a "receita" técnica exata do produto (Etiqueta em Couro M★BRAVO, Caixa Premium, Fecho de Correr, Forro de Algodão e Botão de Madeira).
        *   **Calculadora & Motor de Inventário Atómico (`server.ts`)**: A função `getMaterialsNeededForProduct` foi refatorada para ler diretamente a matriz/receita BOM de cada produto gravada no `catalog.json`. Quando qualquer venda é concluída (no checkout do site ou via venda manual no Admin), o motor abate automaticamente no `inventory.json` tanto o fio correto como todos os respetivos acessórios e consumíveis de embalamento.
        *   **Camada Oculta no Site**: Toda a lógica BOM e abate de ferragens corre exclusivamente na camada de negócio/backoffice, mantendo o frontend do cliente 100% focado na experiência de compra de luxo.
    29. **Ajuste Estético Refinado da UI dos Botões na Aba de Encomendas (`AdminDashboardModal.tsx`):**
        *   **Proporções Compactas e Elegantes**: Redesenho de todos os botões de ação na gestão de encomendas ("Expedir CTT", "Entrega em Mão", "Confirmar Entrega", "Acompanhar nos CTT", "Ver Recibo", "Notif. Atelier", "Ver E-mail CTT Enviado", "Instruções Multibanco", "Simular Pago/Falha", "Cancelar" e "Eliminar").
        *   **Tipografia & Bordas Nobilíssimas**: Cantos ligeiramente arredondados (`rounded-[6px]`), tipografia equilibrada em caixa média suave (`text-[10px] font-medium tracking-wide`), padding simétrico (`px-2.5 py-1.5`) e sombras sutis (`shadow-2xs`), em total sintonia com o design de alta gama e atelier da M★BRAVO.
    28. **Refatoração Estrita de Responsividade Mobile & Zero Horizontal Scroll no Admin (`AdminDashboardModal.tsx`):**
        *   **Container Pai Blindado com Zero Scroll Horizontal**: O container pai do Admin principal e o seu modal interno forçam `w-full max-w-full overflow-x-hidden`, garantindo que rigorosamente nenhum elemento ultrapassa a largura do ecrã em telemóveis (<390px).
        *   **Grelha de KPIs / Métricas Adaptativa**: Forçada a regra `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4` para ecrãs móveis sem larguras fixas em pixels, com tipografia `truncate` e cartões `min-w-0 w-full` que encaixam com rigor visual em qualquer smartphone na vertical.
        *   **Navegação Deslizante Desimpedida nas Abas**: A barra principal de navegação de abas e os seus subfiltros utilizam `flex overflow-x-auto whitespace-nowrap no-scrollbar` para deslizamento suave e inercial com o polegar.
        *   **Modais Nativos Full-Screen no Mobile**: Todos os modais flutuantes de edição (Produto e Matéria-Prima) utilizam `w-full h-full max-h-screen rounded-none` em mobile (<640px) comportando-se como ecrãs totais com Sticky Header e Sticky Footer (`flex flex-col sm:flex-row gap-2`), eliminando molduras flutuantes esmagadas ou barras de scroll duplas.
    29. **Verificação Global de Lógica de Cores no Catálogo & Mapeamento Fiel com o Servidor (`App.tsx` & `translations.ts`):**
        *   **Omissão Absoluta em "Cor Padrão" (`colorType === 'fixed'`)**: Nos produtos configurados no Admin como "Cor Padrão", o painel de seleção de cores é 100% omitido no Frontend público (sem swatches, sem rótulos e sem áreas em branco). A indicação de cor é igualmente suprimida na linha de configuração do resumo de pedido, checkout direto e e-mails de confirmação.
        *   **Renderização Rigorosa de 1 e 2 Linhas ("Cor Única" e "Peça Bicolor")**: Os modos "Cor Única" (`single`) e "Peça Bicolor" (`bicolor`) renderizam rigorosamente 1 ou 2 linhas de seletores com amostras visuais, respeitando 100% a configuração registada no Admin.
        *   **Fidelidade Absoluta do Mapeamento e Formatter**: Confirmada a paridade total entre a estrutura guardada pelo Admin no servidor (`colorType`, `availableColors`, `colorConsumptions`, `bicolorConsumptions`) e os amostradores visuais (`formatColorName`, `getColorSwatchBg`), garantindo que prefixos de fornecedor (ex: `DROPS Safran`) e códigos numéricos são limpos para exibição elegante no cliente público.
    30. **Validação Estrita de Compilação & Purificação do Fluxo Direct-to-Order (`translations.ts`, `docs/`, `package.json`):**
        *   **Remoção Integral de Conceitos de "Carrinho"**: Atualizadas todas as traduções e documentação do ecossistema de `"Adicionar ao Carrinho"` para `"Encomendar Peça"` / `"Order Piece"`, assegurando conformidade escrupulosa com a filosofia de compra direta e única por peça.
        *   **Validação do Script de Build (Railway / Cloudflare Pages)**: Executados e testados com sucesso os comandos `npm run build:client` (`vite build`), `npm run build:server` (`esbuild server.ts`) e `npm run lint` (`tsc --noEmit`), garantindo zero erros de módulos, tipo ou sintaxe em ambientes CI/CD.
    31. **Auditoria Técnica Geral & Mapeamento Dinâmico de Inventário em Venda Manual (`AdminDashboardModal.tsx` & `server.ts`):**
        *   **Mapeamento Dinâmico de Cores no Formulário de Venda Manual**: Eliminado todo e qualquer filtro rígido ou estático no menu "COR & VARIAÇÃO". O formulário consome diretamente o estado de inventário real (`inventory.json`), agrupando dinamicamente e exibindo as 10 cores ativas de DROPS Safran e as 12 cores ativas de DROPS Paris com nomes exatos, referências de catálogo e contagem de novelos em stock.
        *   **Resolução Inteligente no Backend (`server.ts`)**: A função `getYarnIdForColor` foi expandida para efetuar consulta dinâmica e direta por ID/Nome no `inventory.json`. A seleção efetuada no Admin mapeia com precisão atómica a matéria-prima real (ex: `rm_safran_01_rosa_deserto`, `rm_paris_48_petroleo`), assegurando abate exato de stock em vendas manuais e de checkout.
        *   **Auditoria Lógica e Funcional Exaustiva do Dashboard**: Auditadas todas as abas (Vendas, Encomendas, CMS Catálogo, Matérias-Primas, Registo de Auditoria), transições de estados de encomenda, disparo assíncrono de e-mails/BCC, recalculagem atómica de métricas e visualizadores de recibos e e-mails CTT, confirmando conformidade a 100% como "Single Source of Truth".
    32. **Refinamento Editorial & Separação de Atributos nos Templates de E-mail (`src/lib/emailService.ts`):**
        *   **Estrutura de Tabela em Linhas Dedicadas**: Reformuladas as tabelas de resumo dos e-mails de Confirmação de Pagamento / Recibo e de Notificação de Envio CTT. Os atributos foram descondensados e organizados em linhas exclusivas (`Peça Selecionada`, `Tom / Cor`, `Tamanho`, `Quantidade`), proporcionando uma leitura límpida e alinhada com o padrão visual de luxo M★BRAVO.
        *   **Tom de Voz de Atelier Autêntico & Humano**: Substituídos os textos mecânicos/burocráticos por uma narrativa autêntica e calorosa na voz da criadora/atelier. No e-mail de pagamento: *"Confirmamos com gosto a receção do seu pedido. A sua peça M★BRAVO foi integrada no nosso calendário de produção e começará em breve a ser moldada à mão no atelier com o ritmo e rigor que o trabalho artesanal exige."*. No e-mail de envio: *"A sua peça M★BRAVO está pronta. Foi criada à mão no nosso atelier, inspecionada ao detalhe e cuidadosamente embalada. Encontra-se neste momento a caminho da sua morada através dos CTT."*.
    33. **Limpeza de UI, Layout Responsivo de Acessórios & Mapeamento Dinâmico de Consumíveis (`AdminDashboardModal.tsx` & `server.ts`):**
        *   **Limpeza de Jargão Técnico e Uniformização de Título**: Eliminadas as siglas de desenvolvimento `(Receita BOM)` e a expressão `Ferragens` do formulário de Venda Manual e do CMS de Edição de Peças. Título uniformizado para `Acessórios & Embalamento` e removidos os textos explicativos desbotados para um visual minimalista e limpo.
        *   **Grid Responsivo e Sem Overflow**: Implementada estrutura em grid responsivo (`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2`) com estofamento simétrico, tipografia adaptativa (`text-xs`) e contencão de texto truncado nos checkboxes de Acessórios & Embalamento em mobile, tablet e desktop.
        *   **Mapeamento Automático por Cor de Consumíveis em Backend (`server.ts`)**: Implementadas as funções `getZipperIdForColor` e `getLiningIdForColor` que analisam a cor selecionada da peça (ex: `Vermelho`, `Castanho`, `Branco`) e localizam dinamicamente a variação correspondente em `inventory.json` (ex: `re_fecho_correr_vermelho`, `rm_forro_tecido_castanho`), garantindo abate preciso ou fallback para o consumível base padrão.
    34. **Consumo Fracionado de Forro em Metros, Saco Envelope, Quantidades Editáveis de Consumíveis & Grid PC Amplo (`inventory.json`, `server.ts`, `AdminDashboardModal.tsx`):**
        *   **Campo de Consumo de Forro em Metros (CMS & Venda Manual)**: Ao selecionar a opção "Forro Algodão", surge um input numérico dedicado para registar o consumo em metros (ex: `0.25` metros). O motor `calculateOrderMaterials` em `server.ts` lê este consumo fracionado e abate rigorosamente a metragem configurada no inventário de tecido de forro.
        *   **Adição de "Saco Envelope Personalizado M★BRAVO"**: Inserido o novo item consumível em Acessórios/Embalamento no `inventory.json` (`re_saco_envelope`) e integrado na interface de checklist e na função de cálculo de materiais de pedidos com suporte a abate automático de stock.
        *   **Quantidades Editáveis para Todos os Consumíveis**: Todos os consumíveis (Etiqueta Couro, Caixa Premium, Saco Envelope, Fecho Correr, Botão Madeira) dispõem de campo numérico para definir a quantidade unitária (ex: `1`, `2`, etc.). O backend processa dinamicamente estes campos (`etiquetaQty`, `caixaQty`, `sacoEnvelopeQty`, `fechoQty`, `botaoQty`) multiplicando pela quantidade encomendada.
        *   **Ajuste Visual da UI no PC (Sem Truncamento)**: Refatorada a distribuição do bloco `Acessórios & Embalamento` para uma grelha ampla de 3 colunas em Desktop (`lg:grid-cols-3` com `gap-3` e `p-2.5`), garantindo leitura clara de todos os nomes, seletores e quantidades em monitores PC sem qualquer truncamento de texto.
    35. **Hotfix Layout Flexbox Interno dos Botões de Acessórios & Replicação Completa no CMS (`AdminDashboardModal.tsx`):**
        *   **Empilhamento Vertical (flex-col) & Largura Ampliada do Modal**: Reformulada a estrutura interna dos cards de Acessórios & Embalamento em ambos os formulários (Venda Manual e CMS de Edição de Produto) para um layout vertical estritamente seguro (`flex flex-col justify-between h-full min-w-0`), e expandida a largura máxima do modal overlay de Edição de Produto para `max-w-2xl` (768px).
        *   **Sem Truncamento de Texto (break-words whitespace-normal)**: Substituída a regra `truncate` por `break-words whitespace-normal leading-tight` nas etiquetas dos nomes dos consumíveis ("Etiqueta Couro", "Caixa Premium", "Saco Envelope", "Fecho Correr", "Forro Algodão", "Botão Madeira"). A Linha 1 aloja a checkbox e o nome completo sem reticências ou cortes, e a Linha 2 aloja o seletor de quantidade/consumo sob divisória subtil, eliminando qualquer transbordamento visual em PC e Mobile.
    36. **Integração de Rastreio (GA4, GTM, Clarity), Ponte SPA & Proteção Anti-Indexação de API (`index.html` & `server.ts`):**
        *   **Google Analytics 4 & Google Tag Manager**: Integrados os scripts oficiais do GA4 (`G-E3ZXEK6RGR`) e GTM (`GTM-NLQ2QXN6` com container no `<head>` e iframe `<noscript>` no `<body>`) diretamente no `index.html`.
        *   **Microsoft Clarity (Heatmaps & Replay)**: Integrado o snippet oficial do Microsoft Clarity (`xuu4fvcodg`) para gravação de sessões e mapas de calor de utilizadores.
        *   **Ponte de Unificação de Sessão SPA (`window.trackSPAPageView`)**: Criada a função global de rastreio de SPA em `index.html` que invoca atomicamente `clarity("pageview", path)`, `gtag("event", "page_view", ...)` e `dataLayer.push({ event: "virtual_page_view", ... })`. Esta bridge garante gravações de sessão contínuas e unificadas no Clarity sem gerar múltiplos blocos ou sessões fragmentadas durante a navegação em React.
        *   **Proteção do Subdomínio da API (`api.mbravobycarolina.com`)**: Implementada rota `/robots.txt` no Express e mantida a injeção do cabeçalho HTTP `X-Robots-Tag: noindex, nofollow` em todas as rotas direcionadas para `api.` e `/api/`, bloqueando 100% a indexação do backend pelos motores de busca.
    37. **Feed Dinâmico RSS 2.0 XML para Google Merchant Center (`server.ts` & `api.mbravobycarolina.com/api/v1/products/feed.xml`):**
        *   **Integração Concluída & Ativa no Google Merchant Center**: Sincronização automática e sem erros do catálogo completo de produtos através da URL de produção `https://api.mbravobycarolina.com/api/v1/products/feed.xml` (todos os 20 produtos importados e reconhecidos com 0 erros).
        *   **Geração Automática de XML (`generateGoogleMerchantXmlFeed`)**: Criado o gerador dinamicamente alimentado por `loadCatalog()` (com cache HTTP de 1 hora) nas rotas `GET /feed.xml` e `GET /api/v1/products/feed.xml`.
        *   **Mapeamento de Metadados de Luxo M★BRAVO**: Exporta atributos padrão *Google Shopping RSS 2.0* (`<g:id>`, `<g:title>`, `<g:description>`, `<g:link>`, `<g:image_link>`, `<g:price>`, `<g:availability>`, `<g:condition>`, `<g:brand>`, `<g:google_product_category>`), sincronizando preços e stocks instantaneamente em tempo real sem qualquer manutenção manual.
        *   **Permissão em `robots.txt`**: Adicionada exceção `Allow: /feed.xml` e `Allow: /api/v1/products/feed.xml` para garantir que os robôs do Google Merchant Center leiam o feed sem restrições.
    38. **Detalhamento da Política de Envios no Modal de Informações Legais (`LegalModal.tsx`):**
        *   **Conformidade de Transparência Google Shopping**: Atualizada a seção "Custos de Envio" no modal `LegalModal.tsx` com uma tabela visual em grelha detalhando os valores exatos e prazos das 4 tabelas de frete da marca (Portugal Continental: 4,50€ / 1-5 dias; Espanha: 6,50€ / 2-5 dias; Europa UE: 11,90€ / 2-8 dias; Internacional: 24,90€ / 5-12 dias), tanto em Português como em Inglês.
    39. **Ajuste de Preços do Catálogo, Lógica de Packs de Coasters & Sincronização Automática com Feed XML (`src/App.tsx`, `server.ts` & `/catalog.json`):**
        *   **Atualização do Mapa de Preços Base (`BASE_PRICES` & `OFFICIAL_PRODUCT_PRICES`)**: Aplicada a tabela oficial de preços ajustados a todas as categorias do catálogo (Alma Cardigan 97€, Mini Alma Cardigan 57€, Mesh Poncho 57€, Signature Granny Poncho 72€, Marea Bikini Set 67€, Coral Bikini Top 37€, African Flower Pouch 37€, Mini Pouches 13€, AirPods Case 16€, Granny Square Sling Bag 47€, Mini Shell Pouch 22€, Stella Cushion 40€, Dragonfly Bandana 30€, Classic Bandana 27€, Dragonfly Headband 19€, Scarf Hip Bandana 32€, Coasters Base 4.00€).
        *   **Lógica de Preço Dinâmico para Packs de Coasters (`calculateItemPrice`)**: Criado o motor de cálculo `calculateItemPrice` que processa a tabela de desconto em quantidade para os conjuntos de Coasters (1und: 4.00€, 2und: 9.00€, 4und: 17.00€, 6und: 26.00€, 8und: 34.00€), aplicando a recalculagem nos cartões, modal de produto, Stripe wallet, direct checkout e e-mails.
        *   **Sincronização Automática e Imutável no Feed Google Merchant Center**: Integrada a atualização automática e persistência em `/catalog.json` e no endpoint XML (`/feed.xml` e `/api/v1/products/feed.xml`), garantindo que o Google Merchant Center consome instantaneamente os novos preços sem erros ou discrepâncias.
    40. **Correção do Erro de Referência em `ProductDetailPage` (`src/App.tsx`):**
        *   **Resolução do Crash na Rota `/produtos/:slug`**: Restaurada a variável `qtyMultiplier` no componente `ProductDetailPage`, corrigindo o `ReferenceError` que provocava a tela verde sem renderização de fotos, detalhes ou botões de compra ao aceder à página individual de um produto.
    41. **Fase 5 — Arquitetura de Carrinho de Compras & Atelier Slide-Over Drawer (Redesign Editorial de Luxo & Alta Cordoaria):**
        *   **Vocabulário Editorial Estrito (PT-PT Puro)**: Purga total de vocabulário industrial ou descontextualizado ("confeção", "aditamento", "SELECCIONADAS"). Adoção exclusiva da linguagem nobre de alta moda: "Saco de Compras", "A sua Seleção", "Produção Artesanal / Feito à Mão", "Envio Estimado" e "Atelier M★BRAVO".
        *   **Atelier Slide-Over Drawer Redesenhado (`src/components/AtelierCartDrawer.tsx`)**: Painel lateral esguio e elegante (máx. 390px no desktop), fundo contínuo `#FCFBF9` sem caixas/quadrados aninhados pesados, divisores filiformes de 1px, tipografia serifada leve com letter-spacing amplo, e substituição da grelha pesada por um seletor de região minimalista e discreto em linha única.
        *   **Preservação do Fundo & Atmosfera do Atelier**: Transparência suave (`bg-forest/20`) sem desfoques opacos agressivos, permitindo que o cliente continue a sentir o ambiente e as fotos do site enquanto consulta o saco de compras.
        *   **Arquitetura Flexbox Sem Scroll Duplo**: Cabeçalho e rodapé cravados (topo e fundo), com área central de produtos fluida e barra de scroll nativa oculta (`no-scrollbar`).
        *   **Proporções Delicadas de Botões & Stepper**: Botão de finalização "Finalizar Encomenda" e ajustadores de quantidade redesenhados com escala e acolchoamento delicados e harmoniosos.
        *   **Modal de Checkout Multi-Item (`src/components/CartCheckoutModal.tsx`)**: Interface de fecho de encomenda coesa, com terminologia editorial nobre, formulário otimizado para ecrãs táteis e integração direta com a API de pagamentos.
    42. **Seletor Discreto de Região no Topo dos Formulários & Transparência do "Comprar Agora" (`src/components/CartCheckoutModal.tsx` e `src/App.tsx`):**
        *   **Transparência Total no Checkout Rápido "Comprar Agora"**: Integrado o seletor discreto de região de envio no topo do cartão de resumo antes dos dados do cliente e opções de pagamento, exibindo o custo exato do frete (ou "Gratuito" para pedidos >=100€) e o Total Final recalculado em tempo real.
        *   **Modal de Checkout Global Reforçada (`CartCheckoutModal.tsx`)**: Integrado o mesmo seletor discreto de região no topo do resumo da encomenda no modal de checkout do carrinho, permitindo ao cliente alterar a região de destino e ver instantaneamente o valor total ajustado antes da confirmação do pagamento.
        *   **Lógica de Incentivo de Portes Grátis (100€)**: Sincronização em tempo real do estado `isFreeShipping` e cálculo dinâmico do montante em falta para frete grátis no carrinho global e checkout individual.
    43. **Correção do Erro de Referência em `CartContext` (`src/context/CartContext.tsx`):**
        *   **Resolução do `ReferenceError: Cannot access 'subtotal' before initialization`**: Reordenada a inicialização de variáveis no `CartContext`, calculando o `subtotal` previamente antes de determinar a elegibilidade a portes grátis (`isFreeShipping` e `amountNeededForFreeShipping`), eliminando a exceção em tempo de execução ao carregar a aplicação.
    44. **Ajustes de Usabilidade Responsiva (100dvh), Tom de Marca M★BRAVO e Prazos Transparentes (`AtelierCartDrawer.tsx`, `CartCheckoutModal.tsx`, `App.tsx`):**
        *   **Responsividade Dinâmica 100dvh & Landscape**: Transição para `h-[100dvh] max-h-[100dvh]` no gaveto/drawer e `max-h-[92dvh]` no modal, garantindo cabeçalhos e botões de fecho/checkout 100% fixos (`shrink-0`) em qualquer ecrã/orientação com scroll exclusivo na área central.
        *   **Tom de Marca M★BRAVO Touch**: Atualização do incentivo de portes para *"Faltam [X]€ para usufruir de Envio Cortesia M★BRAVO"* e *"Parabéns, a sua encomenda beneficia de Envio Cortesia M★BRAVO"*.
        *   **Separação Clara de Prazos (Produção vs Envio)**: Purga total da palavra "Confeção" e discriminação transparente e nobre: *"Produção Manual: 10 a 15 dias úteis"* e *"Envio Expresso (CTT): 1 a 3 dias úteis (após produção)"*.
        *   **Confirmação do Seletor no "Comprar Agora"**: Reafirmação do seletor discreto de região de envio no topo da mini-card de resumo do checkout rápido, recalculando em tempo real o valor do frete e o total final.

---

## 4. LISTA DEFINITIVA DE FICHEIROS A ATUALIZAR NO GITHUB (`DesignerJota/mbravo-site`)

Para que o repositório no GitHub fique 100% sincronizado com a versão final de produção, copie e substitua os seguintes ficheiros na sua totalidade:

### A. Backend & Servidor
1. **`server.ts`** (Boot Read-Only estrito em `/app/data/`, sanitização estrita, validação de e-mail, máscara de código postal, metadados Stripe unificados, fluxo CTT)
2. **`src/lib/emailService.ts`** (Templates de e-mail de luxo limpos, `formatPhoneReadable`, especificações dinâmicas de produto)

### B. Interface Frontend
3. **`src/context/CartContext.tsx`** (Gestão de estado global de carrinho multi-peça com persistência em localStorage)
4. **`src/components/AtelierCartDrawer.tsx`** (Gaveta deslizante Slide-Over de luxo com seletor de região minimalista e tom editorial)
5. **`src/components/CartCheckoutModal.tsx`** (Modal de checkout multi-item com integração Stripe e opções de pagamento)
6. **`src/components/AdminDashboardModal.tsx`** (Máscara `formatPhoneReadable`, auto-código postal, purga de termos sandbox, CRM Instagram limpo, ações de cancelamento e eliminação)
7. **`src/App.tsx`** (Checkout com validações limpas, remoção de rótulos sandbox nos botões de pagamento, tratamento condicional de tamanhos `hasSize`, integração de botões Adicionar ao Carrinho + Comprar Agora)
8. **`src/translations.ts`** (Dicionário bilíngue PT/EN higienizado e livre de termos de sandbox)
9. **`vite.config.ts`** (Code-splitting e estratégia de bundling estável)
10. **`index.html`** (Preload de imagens WebP e otimizações LCP)
11. **`src/index.css`** (Aceleração GPU e regras WebKit iOS)

### C. Documentação Técnica (`/docs`)
9. **`docs/2_ARCHITECTURE_AND_ADMIN.md`** (Arquitetura atualizada: boot Read-Only, validação estrita, formatação de telemóvel, e-mails de luxo e CRM)
10. **`docs/3_PROJECT_STATE.md`** (Estado do projeto sincronizado e relatório de alterações)
11. **`docs/5_FUTURE_ROADMAP.md`** (Roteiro futuro de infraestrutura, backups automatizados e observabilidade)

---

*   [x] **Refatoração Integral do Modal e Drawer do Carrinho (100dvh, Layout Fixo & Prazos Dinâmicos):**
    *   **Layout Fixo Mobile/Landscape (100dvh):** O modal do carrinho (`AtelierCartDrawer.tsx` e `CartCheckoutModal.tsx`) passou a utilizar altura dinâmica `100dvh` e `max-h-[100dvh]` com cabeçalho (`shrink-0`) e rodapé (`shrink-0`) 100% fixos e travados no ecrã. O scroll é exclusivamente interno na lista central de artigos, prevenindo cortes do botão de fechar e dados de pagamento em telemóveis e tablets na horizontal/landscape.
    *   **Prazos Dinâmicos de Produção (Zero Hardcode):** Eliminados todos os textos estáticos "10 a 15 dias úteis". Os tempos de produção são lidos dinamicamente dos dados de cada peça (`product.stock` e `product.craftingTime` / `leadTimeDays` / `production_time`). Se o artigo tem stock em atelier (`leadTimeDays === 0`), exibe *"Disponível em Atelier"* + *"Envio Expresso (CTT): 1 a 3 dias úteis"*. Caso contrário, exibe *"Produção Manual: [X] dias úteis"* + *"Envio Expresso (CTT): 1 a 3 dias úteis (após produção)"*. No carrinho com múltiplos artigos, o prazo global assume automaticamente o valor máximo do lote (`maxLeadTimeDays`).
    *   **Transparência de Portes no Checkout Rápido ("Comprar Agora"):** O seletor discreto de região de envio surge no topo do resumo do checkout rápido em `App.tsx` antes dos campos de faturação, calculando os portes e exibindo o total final transparente antes do preenchimento de dados de envio ou pagamento.
    *   **Linguagem Editorial e Vocabulário de Luxo M★BRAVO:**
        *   Título do Drawer atualizado de "A sua Seleção" para **"A sua Encomenda"**.
        *   Incentivo de envio grátis padronizado como **"Faltam [X]€ para usufruir de Envio Cortesia M★BRAVO"** e **"Parabéns, a sua encomenda beneficia de Envio Cortesia M★BRAVO"**.
        *   Limpeza integral de termos industriais e eliminação de grafias antigas ("Confeção" $\rightarrow$ "Produção Manual", "Selecção" $\rightarrow$ "Encomenda").

## 4. Próximos Passos Recomendados & Roteiro de Otimização Mobile

### A. Validação de Transição de Repositório & Persistência:
*   [x] **Ficheiros Atualizados e Validados no Editor:** Cópia dos ficheiros alterados (`server.ts`, `src/App.tsx`, `src/translations.ts`, `src/components/AdminDashboardModal.tsx`, `src/lib/emailService.ts`, `docs/`) pronta para commit no GitHub (`DesignerJota/mbravo-site`).
*   [x] **Blindagem CORS e Preflight OPTIONS:** Middleware verificado em `server.ts` garantindo suporte a `https://mbravobycarolina.com`, cabeçalho `X-Admin-Password` e resposta 200 OK no preflight.
*   [x] **Soberania do Volume Persistente e Arranque Read-Only:** Volume Persistente `/app/data/` configurado na Railway como fonte soberana com boot 100% Read-Only em `server.ts` para preservação integral e imutável de dados durante deploys.

*   [x] **Sincronização Absoluta e Mapeamento Fiel de Amostras Visuais de Cor (Swatches):**
    *   **Consumo Dinâmico do Estado do Produto:** O componente de amostragem consome diretamente o array `availableColors` atribuído ao produto na base de dados/Admin sem injeção de listas genéricas.
    *   **Mapeamento de Alta Precisão (#HEX):** A função `getColorSwatchBg` em `translations.ts` foi expandida para mapear com 100% de precisão todos os tons de fios M★BRAVO e DROPS Safran/Paris para os seus códigos Hexadecimais reais (ex: `#243119` Musgo, `#1E3A8A` Azul Cobalto, `#F5EFEB` Natural, `#FFFFFF` Branco, `#F4DCD6` Rosa Pálido, etc.), eliminando totalmente a amostragem por cores genéricas.
    *   **Sincronização 100% da Rótulo/Pílula Selecionada:** Adicionada sincronização reativa com `useEffect` em `App.tsx` que atualiza simultaneamente `cor` e `corPrincipal` na seleção de cada pílula e ao alterar de produto, garantindo paridade absoluta entre a label superior (ex: *"COR: VERDE MUSGO"*) e a amostra visual marcada.
*   [x] **Correção do Mapeamento de Cores Baunilha e Amarelo Claro (Swatches):**
    *   **Eliminação da Inversão Hexadecimal:** Atualizada a função `getColorSwatchBg` em `src/translations.ts` para mapear de forma inequívoca o tom **Baunilha / Paris 35** para o tom amarelo dourado acolhedor (`#F8C53A` / `#F3C64F`) e o tom **Amarelo Claro / Paris 19** para o amarelo claro pastel suave (`#F3E2B8`).
    *   **Alinhamento Multicamadas (End-to-End Alignment):** A amostragem visual no Frontend, a etiqueta de seleção, os seletores no Painel Admin (`AdminDashboardModal.tsx`), o payload do evento de compra enviado ao Checkout e a gravação de encomendas na BD do Railway em `/app/data/` passam a registar o nome exato do fio sem qualquer discrepância.
*   [x] **Exclusividade Estrita por Tipo de Produto, Arquitetura 100% Dinâmica & Rótulos Adaptativos:**
    *   **Purga Total de Condicionais Específicas de Produto:** Eliminadas todas as verificações manuais hardcoded (ex: `isMiniPouches`) de toda a codebase do `App.tsx` e dos modais.
    *   **Lógica Condicional Exclusiva & Dinâmica:**
        *   Produtos `single`: renderizam estritamente **1 seletor de cor** ("COR").
        *   Produtos `bicolor`: renderizam estritamente **2 seletores de cor** ("COR PRINCIPAL" e "COR DO DETALHE" / "COR DO CORDÃO").
        *   Produtos `fixed`: omitem seletores de cor e renderizam diretamente as especificações da peça.
    *   **Rótulo Dinâmico Adaptativo Lido do Produto:** As labels superiores dos seletores (ex: *"COR DO CORDÃO"*, *"COR DO DETALHE"*, *"COR DO FIO"*) são lidas dinamicamente do objeto do produto retornado pelo Railway (`secondColorLabel`, `detailLabel`, `corDetalheLabel`). O fallback genérico de *"COR DO CORDÃO"* fica estritamente restrito a peças do tipo Mini Pouches (ou com atributo de cordão), garantindo que a **African Flower Pouch** e restantes bolsas com fecho renderizam de forma fidedigna e elegante *"COR DO DETALHE"*.
    *   **Amostragem de Luxo M★BRAVO:** Pílulas visuais aprimoradas com anel duplo em tom dourado nobre (`#C5A059`), borda interna sutil para destaque de fios claros (#FFFFFF/Natural) e badges superiores elegantes.

*   [x] **Seleção Dinâmica de Produtos e Lógica Bicolor de Abatimento de Stock em Encomendas Manuais:**
    *   **Dropdown Dinâmico de Produtos:** Substituição do campo de texto livre no formulário de "Registar Venda / Encomenda Manual" (`AdminDashboardModal.tsx`) por um seletor `<select>` que carrega dinamicamente todas as peças do catálogo e os respetivos preços atualizados.
    *   **Seletor Inteligente de Cores/Variações:** Adaptativo conforme o tipo de produto (single / bicolor / fixed). Para produtos bicolores (ex: African Flower Pouch, Marea Bikini Set, etc.), exibe automaticamente dois dropdowns distintos ("Cor Principal / Base" e "Cor do Detalhe / Cordão") contendo a paleta real configurada para o produto.
    *   **Abatimento de Stock Seguro e Consistente em `server.ts`:** A função `getMaterialsNeededForProduct` foi aprimorada para processar e cindir encomendas bicolores (proporção ponderada de 70% cor principal / base e 30% cor detalhe/cordão) e mapear exatamente com precisão os IDs do inventário das matérias-primas (`rm_paris_*`, `rm_safran_*`, fechos de correr, forros e botões de madeira), abatendo e repondo as quantidades no inventário JSON (`/app/data/inventory.json`) em total paridade com o checkout público.
    *   **Polimento de Copywriting Internacional (PT/EN) & Metadados Canonical:** Atualizadas as chaves de tradução em Inglês no `src/translations.ts` ("Pure Memory", "What began as a gesture takes beautiful shape", "Step into our World", "Share your thoughts", "Contemplate the Piece") mantendo o Português poeticamente intocado, e consolidado o URL canonical `https://mbravobycarolina.com/` e schema JSON-LD unificado com a estrela `M☆BRAVO` no `index.html`.

### B. Roteiro Técnico de Otimização Mobile & iOS WebKit (Meta: PageSpeed >90 - FASE 1 CONCLUÍDA):
*   [x] **Aceleração Hardware-Backing para iOS WebKit:** Aplicado `-webkit-backface-visibility: hidden; transform: translateZ(0);` nos cartões de produtos e categorias para impedir a reciclagem agressiva de texturas da GPU pelo WebKit durante o scroll rápido em iPhones/iPads.
*   [x] **Implementação de Estrutura `<picture>` no Hero:** Estrutura responsiva com atributos `fetchpriority="high"`, `loading="eager"` e `decoding="async"` para renderização acelerada.
*   [x] **Preload Crítico no HTML `<head>`:** Inserida tag `<link rel="preload" as="image" href="..." fetchpriority="high">` no `index.html` antecipando a descoberta do Hero pelo parser HTML.
*   [x] **Estratégia de Lazy Loading na Grelha:** Configuração de `loading="eager"` e `fetchPriority="high"` para os primeiros 4 artigos da coleção, aplicando `loading="lazy"` a partir do 5.º item.
*   [x] **CSS `content-visibility: auto` e Layout Lock:** Atribuído `content-visibility: auto` com `contain-intrinsic-size` nas grelhas de produtos para evitar recálculos de layout e eliminação de flicker durante o scroll com inércia.

### C. Propostas Disruptivas de Inovação e Luxo E-commerce (Nível Marca Global):
*   [x] **Roadmap Registado em `/docs/5_FUTURE_ROADMAP.md`**:
    *   **Passaporte Digital & Autenticidade "Tap & Verify" (NFC / QR Code):** Autenticação da peça e ficha da artesã Carolina Bravo.
    *   **Provador Virtual / Realidade Aumentada (AR Web-based):** Projeção da peça em escala 1:1.
    *   **Configurador de Personalização 3D:** Personalização de cores do fio de crochet, alças e iniciais em tempo real.
    *   **Passaporte de Manutenção e Reparações (Luxury Circularity):** Portal de lavagem especializada, preservação e garantia vitalícia de pontos.
*   [ ] **VIP Atelier Concierge & Agendamento Privado:** Módulo de contacto direto via WhatsApp/Vídeo com Carolina para encomendar peças à medida para noivas, eventos e edições limitadas.
*   [ ] **Soundscape Atmosférico do Atelier:** Ativação opcional no topo do site de um ambiente sonoro suave e relaxante do atelier (ritmo do tear e ambiente acústico artesanal) elevando a experiência sensorial da marca.
