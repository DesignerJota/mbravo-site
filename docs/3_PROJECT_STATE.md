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

---

## 4. LISTA DEFINITIVA DE FICHEIROS A ATUALIZAR NO GITHUB (`DesignerJota/mbravo-site`)

Para que o repositório no GitHub fique 100% sincronizado com a versão final de produção, copie e substitua os seguintes ficheiros na sua totalidade:

### A. Backend & Servidor
1. **`server.ts`** (Boot Read-Only estrito em `/app/data/`, sanitização estrita, validação de e-mail, máscara de código postal, metadados Stripe unificados, fluxo CTT)
2. **`src/lib/emailService.ts`** (Templates de e-mail de luxo limpos, `formatPhoneReadable`, especificações dinâmicas de produto)

### B. Interface Frontend
3. **`src/components/AdminDashboardModal.tsx`** (Máscara `formatPhoneReadable`, auto-código postal, purga de termos sandbox, CRM Instagram limpo, ações de cancelamento e eliminação)
4. **`src/App.tsx`** (Checkout com validações limpas, remoção de rótulos sandbox nos botões de pagamento, tratamento condicional de tamanhos `hasSize`)
5. **`src/translations.ts`** (Dicionário bilíngue PT/EN higienizado e livre de termos de sandbox)
6. **`vite.config.ts`** (Code-splitting e estratégia de bundling estável)
7. **`index.html`** (Preload de imagens WebP e otimizações LCP)
8. **`src/index.css`** (Aceleração GPU e regras WebKit iOS)

### C. Documentação Técnica (`/docs`)
9. **`docs/2_ARCHITECTURE_AND_ADMIN.md`** (Arquitetura atualizada: boot Read-Only, validação estrita, formatação de telemóvel, e-mails de luxo e CRM)
10. **`docs/3_PROJECT_STATE.md`** (Estado do projeto sincronizado e relatório de alterações)
11. **`docs/5_FUTURE_ROADMAP.md`** (Roteiro futuro de infraestrutura, backups automatizados e observabilidade)

---

## 4. Próximos Passos Recomendados & Roteiro de Otimização Mobile

### A. Validação de Transição de Repositório & Persistência:
*   [x] **Ficheiros Atualizados e Validados no Editor:** Cópia dos ficheiros alterados (`server.ts`, `src/App.tsx`, `src/translations.ts`, `src/components/AdminDashboardModal.tsx`, `src/lib/emailService.ts`, `docs/`) pronta para commit no GitHub (`DesignerJota/mbravo-site`).
*   [x] **Blindagem CORS e Preflight OPTIONS:** Middleware verificado em `server.ts` garantindo suporte a `https://mbravobycarolina.com`, cabeçalho `X-Admin-Password` e resposta 200 OK no preflight.
*   [x] **Soberania do Volume Persistente e Arranque Read-Only:** Volume Persistente `/app/data/` configurado na Railway como fonte soberana com boot 100% Read-Only em `server.ts` para preservação integral e imutável de dados durante deploys.

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
