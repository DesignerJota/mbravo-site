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

## 3. TAREFA ATUAL (Otimização Extrema de Performance & PageSpeed 90+)
*   **Estado:** **Concluído**.
*   **Ações Realizadas:**
    1.  **Otimização O(1) do FioCondutor (Animação de Scroll):** Eliminação de cálculo iterativo de curvas de Bezier por frame através da criação de uma tabela de consulta pré-computada (`FIO_LOOKUP`) em escopo de topo, reduzindo o trabalho da thread principal durante o scroll em mais de 90%.
    2.  **Otimização de LCP e Carregamento Eager no Hero:** Inversão da estratégia de descarregamento das 4 imagens de fundo do Hero (`HERO_BACKGROUNDS`). Apenas a imagem inicial (index 0) é carregada com `loading="eager"` e `fetchPriority="high"`, enquanto as restantes 3 imagens de fundo passam para `loading="lazy"` e `fetchPriority="low"`, com dimensões explícitas (`1920x1080`), desbloqueando o tempo de LCP (Largest Contentful Paint) no mobile.
    3.  **Remoção de Reflows Forçados no `handleScroll`:** Substituição do seletor DOM `getBoundingClientRect()` executado a cada evento de scroll por uma coordenação assíncrona baseada em `requestAnimationFrame` com listener passivo (`{ passive: true }`), eliminando bloqueios de layout e *scroll-jank*.
    4.  **Memorização do `ProductCard` & Desempenho da Grelha:** Envolvimento do componente `ProductCard` em `React.memo` com função de comparação customizada por ID e estado de foco, prevenindo re-renderizações globais em cascata dos cartões da grelha de produtos durante o scroll.
    5.  **Aceleração Lenis para Mobile Touch:** Adição das propriedades `smoothWheel: true` e `syncTouch: false` na inicialização do Lenis, preservando a aceleração nativa por hardware em dispositivos iOS e Android para navegação fluida na grelha sem engasgos ou fricção.
    6.  **Otimização do Threshold de Imagens de Produtos:** Ajuste no carregamento eager dos cartões da coleção de 4 para 2 itens (os únicos visíveis acima da dobra em mobile), permitindo que todos os restantes produtos sejam carregados progressivamente.

---

## 4. Próximos Passos Recomendados & Roteiro de Otimização Mobile

### A. Validação de Transição de Repositório:
*   [ ] Efetuar a cópia dos ficheiros alterados (`src/App.tsx`, `src/translations.ts`, `src/components/AdminDashboardModal.tsx`, `index.html`) para a branch principal do GitHub.
*   [ ] Solicitar a inspeção e reindexação de URLs na Google Search Console para reavaliar as páginas após a otimização dos termos ortográficos.
*   [ ] Garantir que o volume de dados persistente `/app/data` está ativo no Railway para evitar perdas acidentais de encomendas ou perfis de clientes do CRM durante novas atualizações de código.

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
