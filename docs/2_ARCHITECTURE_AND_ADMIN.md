# M★BRAVO — Arquitetura de Software e Painel Admin

Este documento detalha o ecossistema tecnológico do projeto M★BRAVO, incluindo a arquitetura full-stack, fluxo de dados de transações, gestão de stock e o módulo CRM integrado.

---

## 1. Arquitetura Geral da Aplicação

A aplicação está desenhada num modelo **Full-Stack integrado**:

```
[ Frontend: React 18 + Vite ] <--- Custom Events ---> [ Router & Layout Control ]
             |
             +--- API Requests (HTTPS/JSON) ---> [ Backend: Express Server ]
                                                        |
                                                        +---> orders.json (Railway volume)
                                                        +---> customers.json (Railway volume)
                                                        +---> inventory.json (Raw materials)
                                                        +---> emailService (Nodemailer/Transports)
```

*   **Frontend SPA:** Construído em React 18 utilizando Vite como ferramenta de compilação.
*   **Backend Server:** Express rodando em Node.js. O mesmo contentor de execução serve a SPA compilada no diretório `/dist` (em ambiente de produção) e expõe as rotas de API em `/api/*`.
*   **Porta e Host:** Vinculado à porta `3000` na interface `0.0.0.0` para conformidade com o encaminhamento de tráfego do Cloud Run e Railway.
*   **Isolamento de Subdomínio (API) & SEO:**
    *   Todas as respostas a requisições dirigidas ao subdomínio `api.` ou rotas de `/api/` recebem automaticamente o cabeçalho `X-Robots-Tag: noindex, nofollow` para impedir a sua indexação por motores de pesquisa.
    *   O endpoint `/robots.txt` responde dinamicamente com diretrizes de exclusão total se o host de origem for o subdomínio da API.

---

## 2. Persistência de Dados (JSON Database)
A aplicação adota um armazenamento baseado em ficheiros locais persistentes, otimizados para volumes persistentes na cloud:
*   **Diretório de Volumes:** Caso o servidor detete que está a correr na plataforma Railway (presença do diretório `/app/data`), ele grava automaticamente os dados na pasta `/app/data/` para garantir durabilidade persistente através de reinícios do contentor. Caso contrário, faz fallback para o diretório de execução local.
*   **Ficheiros de Banco de Dados:**
    *   `orders.json`: Armazena todas as encomendas registadas e o seu estado de pagamento.
    *   `customers.json`: Armazena fichas consolidadas do CRM e dados específicos de clientes.
    *   `inventory.json`: Armazena o inventário de matérias-primas e fio físico em armazém.

---

## 3. Painel de Administração (Admin Dashboard)
O acesso ao Painel de Administração é efetuado através da rota `/admin` e validado por uma palavra-passe robusta encriptada por sessões (Padrão: `CarolinaM26`). O Painel divide-se em 5 abas de controlo absoluto:

### A. Insights e Contabilidade (`analytics`)
*   **Métricas de Desempenho:** Apresenta o Volume de Faturação Total, Número de Transações, Ticket Médio por Cliente e um indicador específico de faturas aguardando pagamento por Referência Multibanco.
*   **Gráficos de Vendas:** Integração com a biblioteca `recharts` para desenho dinâmico de gráficos lineares de vendas semanais/mensais.
*   **Exportação Contabilística:** Funcionalidade nativa de exportação de dados financeiros para formato **CSV** (`Exportar Contabilidade`), permitindo o download direto das transações prontas a importar em softwares de contabilidade.

### B. Gestão de Encomendas & CRM (`orders`)
*   **Estado da Encomenda:** Gestão do fluxo da transação (`pendente de pagamento`, `paga`, `enviada`, `falhada`).
*   **Filtros Rápidos:** Pesquisa reativa por ID de encomenda ou nome de cliente.
*   **Atribuição de Prioridade:** Identificação de encomendas de alta prioridade (*"ALTA (Atelier Urgente)"*) vs. normais.

### C. Catálogo de Artigos / CMS (`catalog`)
*   **Edição em Tempo Real:** Permite alterar títulos, preços, descrições, imagens de catálogo e o tempo estimado de produção em dias úteis para cada um dos produtos listados no site.
*   **Criação de Artigos:** Permite introduzir novas peças em Crochet diretamente na interface do utilizador, que passam a constar imediatamente no catálogo público do e-commerce.

### D. Inventário de Matérias-Primas (`inventory`)
*   **Gestão de Fios:** Monitorização do stock físico de rolos de fio (ex: *Fio de Algodão Cru*, *Fio Algodão Terracota*, *Linha Fina Ouro*).
*   **Regra de Abatimento Automático:** Ao mudar o estado de uma encomenda para `paga` (paid), o servidor abate de forma automática as quantidades estimadas de fio necessárias para aquela peça no ficheiro `inventory.json`.
*   **Regra de Reposição Automática:** Se o estado de uma encomenda paga for alterado para `falhada` ou cancelada, o servidor devolve as quantidades correspondentes ao inventário de matérias-primas.
*   **Margens de Segurança:** Alertas visuais e de auditoria caso um fio fique abaixo do nível de stock mínimo de segurança (`minSafety`).

### E. Logs de Auditoria (`logs`)
*   **Registo de Transações:** Registo cronológico imutável de todas as ações importantes (ex: mudança de estado de encomenda, abatimento de stock, atualizações de perfis no CRM), com payload JSON do estado anterior e atual.

---

## 4. CRM — Sistema de Fichas de Cliente (Fase 4)
O sistema de Gestão de Relação com Clientes (CRM) está totalmente integrado no painel de encomendas:
1.  **Ficha do Cliente:** Ao clicar no e-mail de um comprador na tabela de encomendas, um painel deslizante (Drawer) carrega o perfil do cliente do servidor.
2.  **Métricas do Cliente:** Apresenta de forma imediata o histórico de encomendas do cliente, número de compras acumuladas, e valor total investido na marca (Lifetime Value).
3.  **Campos Personalizados (CRM):**
    *   **Nome Completo & Contacto Telefónico.**
    *   **Conta de Instagram:** Essencial para marcas de atelier acompanharem o contacto social da cliente.
    *   **Notas de Instagram:** Registo de mensagens diretas e preferências partilhadas na rede social.
    *   **Data de Nascimento:** Com cálculo reativo automático da idade atual e indicador se celebra aniversário brevemente.
    *   **Notas Internas:** Notas gerais de estilo, alergias a materiais ou instruções de envio preferenciais.

---

## 5. Serviços de Email (`src/lib/emailService.ts`)
A lógica de envio de e-mails comunica as atualizações de forma profissional:
*   **Origem:** `encomendas@mbravobycarolina.com`
*   **Destino Interno (Atelier):** `handmade.mbravo@gmail.com` (recebe cópia de alertas de stock baixo e novas encomendas pagas para produção imediata).
*   **Modelos de Email (HTML/CSS Embutido):**
    *   `generateCustomerEmailHtml`: Envia um recibo de pagamento luxuoso em tons de creme e verde floresta, com os detalhes da peça comprada, especificações de cor e tamanho, e uma mensagem personalizada que valoriza o processo de produção artesanal.
    *   `sendMultibancoEmails`: Instruções detalhadas com Entidade, Referência e Montante.
    *   `sendShippedEmails`: Confirmação de expedição com o respetivo código de registo da transportadora para rastreamento.

---

## 6. Otimização de Performance e Estratégia de Bundling (Vite & React)

*   **Code-Splitting do Painel Admin (`React.lazy()` + `Suspense`):**
    *   Para reduzir o tamanho do bundle crítico inicial e acelerar a renderização do First Contentful Paint (FCP) da homepage, o modal do painel administrativo (`AdminDashboardModal`) foi segregado utilizando carregamento diferido (`React.lazy()` e `<React.Suspense>`).
    *   O componente e as suas respetivas dependências de gestão são descarregados dinamicamente apenas quando o utilizador acede à rota `/admin` ou abre o painel administrativo.
*   **Estratégia de Bundling Unificado do Vite (`manualChunks`):**
    *   Para evitar exceções de contexto em tempo de execução (`Uncaught TypeError: Cannot read properties of undefined (reading 'createContext') at LayoutGroupContext.mjs`) provocadas pela divisão isolada de chunks de fornecedores para bibliotecas de animação (`framer-motion`), o projeto adota a estratégia de bundling padrão e coesa do Vite/Rollup sem a inclusão de `manualChunks` fragmentados para dependências do React.
    *   Esta abordagem preserva a estabilidade do contexto do React e reduz o risco de inconsistências de carregamento em ambiente de produção.

---

## 7. Roteiro Técnico de Solução iOS WebKit & Otimização Mobile (FASE 1 APLICADA)

### A. Diagnóstico & Solução de Flicker de Imagens no iOS (Safari/WebKit) — [IMPLEMENTADO]
*   **Causa Raiz no WebKit:** O motor Safari/WebKit em iOS impõe limites rigorosos de alocação de memória gráfica por aba. Durante o scroll rápido com inércia em grelhas de imagens, o WebKit descarta ativamente texturas descodificadas em memória GPU para evitar estoiros de memória (*tab crash*), resultando no efeito de piscar (*flicker*) quando as imagens voltam a ser compostas.
*   **Arquitetura de Solução Aplicada no Código:**
    1.  **Hardware-Backing CSS:** Aplicação de `-webkit-backface-visibility: hidden; backface-visibility: hidden; transform: translateZ(0);` nos invólucros dos cartões de produtos (`ProductCard`) e categorias para manter as camadas de composição ativas na GPU sem exceder limites de memória.
    2.  **Modo de Descodificação Assíncrono (`decoding="async"`):** Força o descodificador de imagem do browser a processar os pixéis fora do thread principal de UI.
    3.  **Proporção de Aspeto Rígida & Layout Lock:** Definição explícita do rácio visual (`aspect-[4/5]` e `aspect-[4/3]`) com `content-visibility: auto` e `contain-intrinsic-size: 0 420px`, prevenindo repinturas (*layout shifts*) durante o scroll acelerado.

### B. Plano de Otimização LCP Mobile (Metas: PageSpeed >90) — [IMPLEMENTADO]
1.  **Estrutura Responsiva `<picture>`:** Implementada no Hero da homepage com atributos `fetchpriority="high"`, `loading="eager"` e `decoding="async"` garantindo renderização zero-lag.
2.  **Preload Crítico no HTML `<head>`:** Declaração de `<link rel="preload" as="image" href="https://i.ibb.co/KppF2KLq/Background.png" fetchpriority="high" />` no `<head>` do `index.html` antecipando o pedido da imagem antes do carregamento dos scripts JS.
3.  **Estratégia de Carregamento Prioritário na Grelha:** As primeiras 4 imagens do catálogo carregam com `loading="eager"` e `fetchPriority="high"`, enquanto as restantes (a partir do 5.º artigo) usam `loading="lazy"`.

### C. Roteiro de Funcionalidades Disruptivas de Luxo (Padrão Global M★BRAVO)
*   **Certificado de Autenticidade Digital via Tap NFC:** Cada peça M★BRAVO inclui um chip NFC cosido na etiqueta. Ao aproximar o smartphone, a cliente abre a página de autenticação da peça com número de série, artesã que a produziu, data e instruções exclusivas de preservação.
*   **Personalizador 3D / Atelier Studio:** Módulo interativo onde a cliente escolhe fios, combinações de cores, alças e adiciona medalhas em metal gravadas com iniciais em tempo real.
*   **VIP Atelier Concierge:** Canal de agendamento privado para atendimento personalizado diretamente com o Atelier via videochamada para peças por encomenda (ex: noivas e eventos formais).
*   **Soundscape Atmosférico do Atelier:** Leitor sonoro opcional e subtil na barra superior que reproduz os sons calmos do atelier (tear e textura do fio), criando uma atmosfera envolvente e artesanal.

