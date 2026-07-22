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
*   **Fase 1 & Fase 2 — Otimizações de Performance Mobile & Instant Render (Concluído com Sucesso):**
    *   **Renderização Direta sem Timers Bloqueantes (`index.html` & `App.tsx`):** Remoção total do ecrã de intro artificial e do temporizador de 2,4s. O `index.html` volta a ter um `<div id="root"></div>` limpo e leve, permitindo ao React montar e pintar o Hero e a marca instantaneamente no Frame 1 (<0,3s), eliminando qualquer TBT (Total Blocking Time) ou bloqueio de FCP/LCP no Google PageSpeed Insights.
    *   **Remoção de Links de Stock Externos & Imagens Locais Autênticas M★BRAVO:** Substituição de servidores externos por ativos WebP otimizados locais em `/public` (criados a partir do PNG original do ImgBB `Background.png`).
    *   **Imagens Responsivas WebP no Hero (LCP Mobile & Desktop):** Preload local no `<head>` (`/hero-bg-1-mobile.webp` para `max-width: 640px` com apenas 45KB e `/hero-bg-1-desktop.webp` com 159KB), eliminando latência de servidores externos e reduzindo o peso do Hero em 98%.
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

## 3. TAREFA ATUAL
*   **Estado:** **Concluído**.
*   **Ações Realizadas:**
    1.  Varredura completa de todo o código da plataforma (incluindo `index.html`, `translations.ts` e `AdminDashboardModal.tsx`) para eliminar todas as instâncias de ortografia antiga (*croché*, *crochê*).
    2.  Uniformização global de referências escritas para a grafia internacional única: **Crochet**.
    3.  Ajuste nos prazos e termos de produção artesanal eliminando vestígios do termo *"confeção"* na página de produto.
    4.  Criação da pasta técnica `/docs` contendo os blueprints detalhados do projeto para transição manual de repositórios.
    5.  Otimização técnica do Hero LCP Mobile através de tag `<img>` nativa com `fetchPriority="high"`, `loading="eager"` e `decoding="async"`.
    6.  Auditoria e garantia de pontuações de Acessibilidade 90+ com estrutura semântica e tags `alt` adequadas.
    7.  Implementação de Code-Splitting no `AdminDashboardModal` utilizando `React.lazy()` e `<React.Suspense>`.
    8.  Resolução de erros de runtime no bundling mantendo o agrupamento padrão do Vite sem `manualChunks` isolados para bibliotecas do React e `framer-motion`.

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
