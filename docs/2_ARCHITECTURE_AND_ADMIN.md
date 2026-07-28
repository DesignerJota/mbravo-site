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
*   **Isolamento de Subdomínio (API), CORS & SEO:**
    *   **Blindagem do Middleware CORS (`server.ts`):** O middleware de CORS em `server.ts` foi rigorosamente atualizado para suportar requisições do domínio de produção `https://mbravobycarolina.com`, permitindo explicitamente os métodos `GET, POST, PUT, DELETE, PATCH, OPTIONS` e os cabeçalhos `Content-Type, Authorization, Accept, X-Admin-Password, X-Requested-With`. As requisições de preflight (`OPTIONS`) respondem de forma imediata e transparente com o código de estado `200 OK`.
    *   Todas as respostas a requisições dirigidas ao subdomínio `api.` ou rotas de `/api/` recebem automaticamente o cabeçalho `X-Robots-Tag: noindex, nofollow` para impedir a sua indexação por motores de pesquisa.
    *   O endpoint `/robots.txt` responde dinamicamente com diretrizes de exclusão total se o host de origem for o subdomínio da API.

---

## 2. Persistência de Dados (JSON Database & Volume Exclusivo)
A aplicação adota um armazenamento baseado em ficheiros locais persistentes, otimizados para volumes persistentes na cloud:
*   **Diretório de Volumes e Soberania do Estado (REGRA DE OURO / Pilar 10):** O Volume Persistente na Railway montado em `/app/data/` é a fonte soberana e única de dados em produção. Todos os ficheiros de base de dados viva (`inventory.json`, `orders.json`, `catalog.json`, `customers.json`, `audit_logs.json`, `testimonials.json`) residem exclusivamente dentro de `/app/data/`, tendo sido totalmente eliminados quaisquer ficheiros JSON duplicados ou soltos na raiz do projeto.
*   **Lógica de Fusão Inteligente no Arranque (Smart Upsert de Matérias-Primas):**
    *   No boot do servidor (`server.ts`), a função `loadInventory()` lê a base de dados `/app/data/inventory.json`.
    *   **Injeção Automática de Novas Referências (Smart Upsert):** Se forem declaradas novas matérias-primas no código (`DEFAULT_INVENTORY`) que ainda não existam em `/app/data/inventory.json`, o servidor adicona-as automaticamente ao ficheiro persistente.
    *   **Preservação Soberana do Stock Existente:** Se um item já existir no `/app/data/inventory.json`, o servidor preserva a 100% a sua quantidade real e atualizada em produção pelo Admin (nunca repondo a zeros nem sobrescrevendo o stock da Carolina).
*   **Protocolo de Leitura Read-Only para Encomendas, CRM e Catálogo:**
    *   As funções `loadOrders`, `loadCustomers`, `loadCatalog`, `loadLogs` e `loadTestimonials` leem em memória os ficheiros de `/app/data/` sem sobrescrever dados no boot.
    *   **Mutação Exclusiva por API:** A escrita física em disco (`writeFileSync`) ocorre exclusivamente por via de requisições explícitas de mutação sentidas pelas rotas de API (`POST`, `PUT`, `DELETE`) no Painel Admin ou durante o Checkout.
*   **Ficheiros de Banco de Dados Persistidos em `/app/data/`:**
    *   `/app/data/inventory.json`: Armazena o inventário de matérias-primas e fios físicos em armazém (DROPS Safran, DROPS Paris #18241, acessórios e embalagens).
    *   `/app/data/orders.json`: Armazena todas as encomendas registadas e o seu estado de pagamento.
    *   `/app/data/customers.json`: Armazena fichas consolidadas do CRM e dados específicos de clientes.
    *   `/app/data/catalog.json`: Armazena alterações do catálogo de artigos do e-commerce.
    *   `/app/data/audit_logs.json`: Armazena os registos imutáveis de auditoria administrativa.
    *   `/app/data/testimonials.json`: Armazena testemunhos locais de fallback de alta disponibilidade.

---

## 3. Painel de Administração (Admin Dashboard)
*   **Acesso Discreto e Rota Segura:** O Painel de Administração pode ser acedido diretamente pela rota URL `/admin` ou mediante um clique discreto sobre a nota de copyright no rodapé da página (`© 2026 M★BRAVO`). O botão visível público foi removido para manter a estética minimalista e exclusiva da marca em ambiente de produção final. O acesso é protegido por palavra-passe encriptada por sessões (Padrão: `CarolinaM26`).
*   **Purga Total e Absoluta de Dados Mock/Seed:** As abas 'analytics', 'orders' e 'crm' carregam 100% de dados reais e dinâmicos persistidos no volume `/app/data/orders.json`. Quaisquer dados de demonstração, arrays estáticos ou sementes fictícias foram purgados do servidor (`server.ts`) e da interface (`AdminDashboardModal.tsx`), assegurando fiabilidade operacional absoluta.

### B. Padronização de Design System & Regras Globais UI/UX Responsivas
*   **Regra 1 — Overlays e Modais Mobile Full-Screen**: Todos os modais da plataforma (Admin principal, Edição de Produto, Edição de Matéria-Prima e Ficha de Cliente CRM) abrem obrigatoriamente em ecrã completo (`w-full h-full max-h-screen rounded-none`) em dispositivos móveis (`<640px`), incorporando Sticky Header (botão Fechar) e Sticky Footer (botões Cancelar/Guardar) para ergonomics de toque com uma só mão.
*   **Regra 2 — Zero Scroll Horizontal & Grelhas Adaptativas**: O container pai força `w-full max-w-full overflow-x-hidden`. As estatísticas e KPIs adaptam-se para `grid-cols-2` sem larguras fixas em pixels, e os cartões de produtos/encomendas ajustam-se progressivamente (`grid-cols-1` em mobile, `grid-cols-2` em tablet, `grid-cols-3`/`grid-cols-4` em desktop), garantindo que nenhum elemento ultrapassa a largura do ecrã.
*   **Regra 3 — Navegação Deslizante Desimpedida**: A barra principal de navegação de abas e os menus de filtro usam `flex overflow-x-auto whitespace-nowrap no-scrollbar` com scroll inercial suave.
*   **Regra 4 — Ergonomia Tátil e Tipografia de Alta Moda**: Botões e áreas de toque alargadas (`whitespace-nowrap`, `p-2.5`) preparadas para polegares em smartphones.

### C. Insights e Contabilidade (`analytics`)
*   **Purga Total e Absoluta de Dados Mock/Seed:** As abas 'analytics', 'orders' e 'crm' carregam 100% de dados reais e dinâmicos persistidos no volume `/app/data/orders.json`. Quaisquer dados de demonstração, arrays estáticos ou sementes fictícias foram purgados do servidor (`server.ts`) e da interface (`AdminDashboardModal.tsx`), assegurando fiabilidade operacional absoluta.
*   **Métricas de Desempenho:** Apresenta o Volume de Faturação Total, Número de Transações, Ticket Médio por Cliente e um indicador específico de faturas aguardando pagamento por Referência Multibanco.
*   **Gráficos de Vendas:** Desenho dinâmico de gráficos de vendas em tempo real baseados no histórico real de encomendas.
*   **Exportação Contabilística:** Funcionalidade nativa de exportação de dados financeiros para formato **CSV** (`Exportar Contabilidade`), permitindo o download direto das transações prontas a importar em softwares de contabilidade.

### B. Gestão de Encomendas & CRM (`orders`)
*   **Estado da Encomenda:** Gestão do fluxo da transação (`pendente de pagamento`, `paga`, `enviada`, `entregue`, `cancelada`).
*   **Registo de Venda / Encomenda Manual Inteligente (`/api/admin/orders/create`):**
    *   **Dropdown Dinâmico de Produtos:** A criação de vendas manuais no Admin integra um seletor dinâmico que carrega automaticamente todas as peças ativas do catálogo e preenche o preço de tabela do artigo.
    *   **Seleção Adaptativa de Cores/Variações:** Identifica se o produto é de cor única (`single`) ou bicolor (`bicolor`) e renderiza dropdowns com as cores reais configuradas no catálogo do atelier (ex: "Cor da Base" e "Cor do Detalhe").
    *   **Abatimento Dinâmico de Matérias-Primas:** Ao criar uma encomenda manual no estado "paga", o servidor invoca a função `getMaterialsNeededForProduct` em `server.ts` que abate imediatamente as bobinas de fio e acessórios do inventário (`/app/data/inventory.json`) segundo as proporções do produto (100% monocolor ou 70%/30% bicolor) e gera os devidos registos no histórico do cliente (CRM).
*   **Gestão e Apagar/Cancelar Encomendas Manuais:**
    *   **Cancelamento:** Ação rápida para cancelar qualquer encomenda (`Cancelar`), alterando o estado para `failed` (Cancelada).
    *   **Eliminação Definitiva (`/api/admin/orders/delete`):** Ação direta para apagar/eliminar registos de encomendas criadas manualmente ou por engano (`Eliminar`), removendo o registo da base de dados e recalculando instantaneamente os totais de faturação e métricas da contabilidade.
*   **Indicador de Sincronização Limpo:** Badge discreto de estado na interface (`● Sincronizado em tempo real`), livre de referências a nomes de ficheiros ou termos técnicos do servidor.
*   **Automação do Fluxo de Expedição CTT (`sendShippedEmails`):** Ao introduzir o código de rastreamento dos CTT e marcar a encomenda como "enviada" (`shipped`), o sistema executa automaticamente de forma imediata:
    1. Atualização do estado no `orders.json` e sincronização reativa no perfil CRM do cliente.
    2. Disparo imediato do e-mail de confirmação de expedição com o código CTT para a cliente (`sendShippedEmails`).
    3. Registo imutável da ação nos Logs de Auditoria (`/admin` tab 'logs') sob os eventos `ctt_label_generation` e `state_change`.
*   **Filtros Rápidos:** Pesquisa reativa por ID de encomenda ou nome de cliente.
*   **Atribuição de Prioridade:** Identificação de encomendas de alta prioridade (*"ALTA (Atelier Urgente)"*) vs. normais.
*   **Lógica Condicional de Tamanhos (`hasSize`):** Tratamento condicional para peças sem variação de tamanho (ex: malas, pouches, carteiras ou bases/coasters como Daisy Coasters), omitindo o rótulo de tamanho nas confirmações, nos e-mails e nos registos do painel.
*   **Sincronização de Histórico Real:** Registos históricos de produção/testes (ex: encomenda `MB-2026-3147` de Paulo António Lima Macedo de Queirós em 23/07/2026) encontram-se totalmente persistidos no `orders.json` com cálculo correto do volume de faturação (16,00€) e visualização limpa de especificações.

### C. Catálogo de Artigos / CMS (`catalog`)
*   **Edição em Tempo Real:** Permite alterar títulos, preços, descrições, imagens de catálogo e o tempo estimado de produção em dias úteis para cada um dos produtos listados no site.
*   **Configuração Inteligente de Cores (`colorType`)**:
    *   **Cor Padrão (`fixed`)**: Modos para peças com paleta estática artesanal (ex: *Daisy Coasters*). O painel de seleção de cores é 100% omitido no Frontend público (sem swatches, sem labels e sem áreas em branco) e a indicação de cor é omitida dos resumos de encomenda e e-mails.
    *   **Cor Única (`single`)**: Apresenta 1 linha de seletores de cor com amostragem visual baseada no inventário real do Atelier.
    *   **Peça Bicolor (`bicolor`)**: Apresenta 2 linhas independentes de seletores (Cor Principal & Cor do Detalhe) com consumos de matérias-primas diferenciados (`bicolorConsumptions`).
*   **Receita de Acessórios & Ferragens Associadas (BOM - Bill of Materials)**:
    *   Na ficha de edição do produto no CMS do Admin, a Carolina pode selecionar individualmente os acessórios e consumíveis que compõem a receita técnica da peça: **Etiqueta em Couro M★BRAVO**, **Caixa Premium**, **Fecho de Correr**, **Forro de Algodão** e **Botão de Madeira**.
    *   O motor backend de inventário em `server.ts` (`getMaterialsNeededForProduct`) lê atomaticamente esta receita no momento em que a encomenda é confirmada/paga (no site ou no Admin) e abate instantaneamente do `inventory.json` todos os itens configurados, eliminando a necessidade de seleção manual repetitiva.
*   **Criação de Artigos:** Permite introduzir novas peças em Crochet diretamente na interface do utilizador, que passam a constar imediatamente no catálogo público do e-commerce.
*   **Ergonomia Mobile Full-Screen:** Em ecrãs móveis (`<640px`), o formulário modal de edição de produtos e matérias-primas expande para 100% de largura e altura (`w-full h-full max-h-screen rounded-none`), com grelha de pílulas de cores responsivas (`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3`) e botões de ação fixos ao fundo (`sticky bottom-0 flex-col sm:flex-row gap-2.5`), garantindo utilização extremamente confortável no iPhone, iPad ou PC do Atelier.

### D. Regras Globais de UI/UX Responsiva (Design System M★BRAVO)
1. **Modais & Overlays em Mobile (`<640px`)**: Todos os modais do sistema abrem obrigatoriamente em Full-Screen (`w-full h-full max-h-screen rounded-none`), com Sticky Header (botão Fechar) e Sticky Footer (botão Cancelar / Guardar). Em Desktop/Tablet mantêm-se flutuantes centrados.
2. **Grelhas & Proporções Adaptativas**: `grid-cols-1` para listagens e cartões em mobile, `grid-cols-2` em tablet e `grid-cols-3`/`grid-cols-4` em desktop. Zero pixels fixos a forçar scroll horizontal na página.
3. **Navegação & Abas em Mobile**: Todos os menus de abas e filtros de contexto (menu principal Admin, barra de filtros de encomendas, seletor de coleções CMS e sub-abas de inventário) convertem-se automaticamente em barras horizontais deslizantes (`flex overflow-x-auto no-scrollbar shrink-0`).
4. **Tipografia & Ações Touch**: Escala adaptativa com botões de ação ("Editar", "Eliminar", "Ocultar", "Reativar") com margens de toque alargadas e `whitespace-nowrap` sem quebra de linhas.

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

## 5. Gateway Stripe, Metadados & Resiliência de Webhook
*   **Injeção de Metadados Unificada (`commonMetadata`):** Todas as transações criadas via Stripe (Cartão, MB WAY, Multibanco) injetam metadados completos (`orderId`, `productName`, `cor`, `tamanho`, `hasSize`, `quantidade`, `customerName`, `customerEmail`, `customerPhone`, `nif`) no `PaymentIntent`.
*   **Recuperação Reativa via Webhook:** Caso a encomenda original não esteja em memória/disco no momento do webhook de confirmação (ex: reinício de servidor ou transação iniciada noutro canal), o manipulador do webhook e o endpoint de verificação reconstroem reativamente a encomenda a partir dos metadados do Stripe, garantindo zero perda de dados.
*   **Ambiente de Produção vs. Teste:** Deteção automática das chaves Stripe (`sk_live` vs. `sk_test`) gravando a propriedade `isTestMode` nas encomendas para transparência nos relatórios do Admin.

---

## 6. Serviços de Email & Regra de Ouro do Disparo de Confirmações (`src/lib/emailService.ts`)
A lógica de envio de e-mails comunica as atualizações de forma profissional com uma **Regra de Ouro de Segurança**:
*   **Regra de Ouro de Blindagem de Pagamento (Exclusivo Webhook Stripe):** Nenhum e-mail de confirmação de encomenda (`generateCustomerEmailHtml`) é disparado nem qualquer processamento de venda é assumido como pago no servidor antes de o pagamento ser efetivamente verificado e confirmado pelo gateway Stripe via Webhook (`payment_intent.succeeded` / `checkout.session.completed`) ou consulta direta verificada de status `succeeded`. O endpoint `/api/payment/create-intent` regista a intenção exclusivamente com o estado `pending_payment`. Quaisquer falhas de pagamento, cancelamentos ou testes sem liquidação real no Stripe são marcados com o estado `failed` ou mantidos em `pending_payment`, sendo estritamente proibido assumir o estado `paid` em fallbacks ou simulações.
*   **Proteção Nativa no Código:** O `emailService.ts` contém uma verificação de segurança estrita em `sendTransactionEmails` que aborta imediatamente o envio de e-mail de confirmação se o estado da encomenda for diferente de `'paid'`.
*   **Purga Total de Dados Fantasma ("Tamanho: M"):** Eliminação total da injeção de valores por defeito (como `"Tamanho: M"`) em produtos do catálogo que não possuem essa variação (como a bolsa African Flower Pouch, Mini Pouches, Coasters e artigos sem opção de tamanho). Se o cliente não seleciona tamanho ou a peça não possui tamanhos (`hasSize = false`), a propriedade `selections.tamanho` é mantida vazia (`""`).
*   **Atributos Dinâmicos e Limpos (`formatOrderSpecifications`):** As especificações de produtos nos e-mails (Cor, Tamanho, Quantidade) são desenhadas dinamicamente. Atributos não aplicáveis ou ausentes (como o tamanho em malas, bolsas ou bases de copos) são omitidos de forma inteligente nos e-mails do cliente, e-mails do atelier e no Painel Admin.
*   **Instruções de Pagamento Multibanco:** No caso de pagamento por Multibanco, o sistema envia exclusivamente o e-mail de instruções com a Entidade, Referência e Montante (`sendMultibancoEmails`). O e-mail de confirmação de encomenda só é gerado no momento em que o webhook do Stripe notifica a liquidação efetiva da referência pelo cliente.
*   **Limpeza Total e Absoluta de Termos de Teste/Sandbox:** Todos os avisos de sandbox, rótulos como `AUDITORIA SANDBOX`, notas de teste e chaves de simulação foram terminantemente purgados dos templates de e-mail (`emailService.ts`), das traduções (`translations.ts`) e do Painel Admin (`AdminDashboardModal.tsx`). Os e-mails utilizam exclusivamente uma nomenclatura de produção de luxo (`Comprovativos de Encomenda`, `Recibo do Cliente`, `Notificação de Envio`, etc.), garantindo uma comunicação de marca 100% impecável e profissional no domínio de produção `mbravobycarolina.com`.
*   **Notificação Exclusiva do Atelier e Armazenamento Local em Encomendas Manuais (`sendAtelierNotificationOnly`):** A rota `/api/admin/orders/create` é 100% assíncrona (`async (req, res) => {`) e armazena o registo estritamente no Volume/Ficheiro JSON local (`loadOrders()` / `saveOrders()`), prevenindo qualquer chamada a bases de dados externas ou erros de rede (`ENETUNREACH`) em ambientes como a Railway. Dispara a notificação via Resend (ou gateway ativo) exclusivamente em segundo plano para o Atelier (`encomendas@mbravobycarolina.com`) contendo os detalhes do pedido e a tag de prioridade, sem enviar qualquer e-mail para o cliente.
*   **Origem:** `encomendas@mbravobycarolina.com`
*   **Destino Interno (Atelier):** `encomendas@mbravobycarolina.com` / `handmade.mbravo@gmail.com` (recebe cópia de alertas de stock baixo e novas encomendas para produção imediata).
*   **Modelos de Email (HTML/CSS Embutido):**
    *   `generateCustomerEmailHtml`: Envia um recibo de pagamento luxuoso em tons de creme e verde floresta, com os detalhes da peça comprada, especificações dinâmicas de cor e tamanho, formatação de telemóvel legível humana (`+351 917 827 458`) e uma mensagem personalizada que valoriza o processo de produção artesanal.
    *   `sendMultibancoEmails`: Instruções detalhadas com Entidade, Referência e Montante.
    *   `sendShippedEmails`: Confirmação de expedição com o respetivo código de registo CTT da transportadora para rastreamento.

---

## 7. Validação Estrita, Sanitização de Dados & Formatação de Leitura

Para assegurar integridade absoluta de dados e facilidade de leitura operacional no Atelier, a aplicação implementa validação estrita no Frontend e no Backend (`server.ts`):
*   **Validação Estrita de E-mail (`isValidEmailStrict` / `isValidEmail`):** Verificação por expressão regular (`/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`) exigindo rigorosamente o formato de e-mail padrão (`utilizador@dominio.com`) tanto no checkout de cliente como na criação manual de encomendas no Admin.
*   **Auto-Máscara de Código Postal Português (`formatPostalCodePT` / `formatPostalCode`):** Formatação automática no formato standard `XXXX-XXX` (ex: `1000-123`), higienizando caracteres não numéricos.
*   **Máscara de Leitura Humana para Telemóveis (`formatPhoneReadable`):** Aplicação de espaçamento visual legível em todos os números de telemóvel apresentados no Painel Admin, na Ficha de Cliente do CRM Drawer e nos e-mails de confirmação e expedição (ex: `+351 917 827 458` em vez de `+351917827458`).
*   **Acessibilidade e Scroll Nativo no Drawer de CRM (Ficha de Cliente):** O corpo do painel lateral deslizante do CRM foi otimizado com `-webkit-overflow-scrolling: touch`, `overflow-y-auto` e `touch-pan-y`, garantindo navegação por scroll vertical fluida e nativa via roda do rato (mouse wheel) e gestos tátil em dispositivos móveis/desktop.
*   **Higienização e Limpeza de Texto (`sanitizeText` & `sanitizeNumber`):** Todos os campos de formulário e criação de encomendas são processados com remoção de espaços em branco antes e depois (`trim()`), filtragem de carateres inválidos em NIF/telefones e conversão segura de valores monetários.
*   **Limpeza do Campo Instagram na Ficha de Cliente CRM (Pilar 1):** O campo "Utilizador de Instagram" no Pilar 1 da Ficha do Cliente inicia totalmente vazio por defeito (sem a sugestão estática de `@carolina_mbravo`), apresentando apenas o placeholder discreto `@utilizador` para permitir o preenchimento manual e exclusivo dos dados reais de cada cliente.

---

## 6. Otimização de Performance e Estratégia de Bundling (Vite & React)

*   **Code-Splitting do Painel Admin (`React.lazy()` + `Suspense`):**
    *   Para reduzir o tamanho do bundle crítico inicial e acelerar a renderização do First Contentful Paint (FCP) da homepage, o modal do painel administrativo (`AdminDashboardModal`) foi segregado utilizando carregamento diferido (`React.lazy()` e `<React.Suspense>`).
    *   O componente e as suas respetivas dependências de gestão são descarregados dinamicamente apenas quando o utilizador acede à rota `/admin` ou abre o painel administrativo.
*   **Estratégia de Bundling Unificado do Vite (`manualChunks`):**
    *   Para evitar exceções de contexto em tempo de execução (`Uncaught TypeError: Cannot read properties of undefined (reading 'createContext') at LayoutGroupContext.mjs`) provocadas pela divisão isolada de chunks de fornecedores para bibliotecas de animação (`framer-motion`), o projeto adota a estratégia de bundling padrão e coesa do Vite/Rollup sem a inclusão de `manualChunks` fragmentados para dependências do React.
    *   Esta abordagem preserva a estabilidade do contexto do React e reduz o risco de inconsistências de carregamento em ambiente de produção.

---

## 8. Arquitetura Resiliente de Testemunhos & Avaliações (PostgreSQL High Availability - 3 Camadas)

A gestão e apresentação de testemunhos no e-commerce adota uma arquitetura de alta disponibilidade (HA) em 3 camadas e tolerante a falhas de rede:
1. **Configuração Defensiva da Conexão PostgreSQL (`pg.Pool`):**
   * Parâmetro `connectionTimeoutMillis: 3000` em `server.ts` para garantir o *fail fast* defensivo em 3 segundos em caso de problemas de rede ou DNS IPv4/IPv6 no servidor de base de dados.
   * Event listener `dbPool.on('error', ...)` registado para capturar avisos de ligações inativas sem emitir exceções não tratadas ou interromper o processo Node.js.
2. **Padrão Fallback de Alta Disponibilidade (3 Camadas Nativas):**
   * **Nível 1 (PostgreSQL):** Tenta consultar em primeira instância os testemunhos registados na tabela `testimonials` da base de dados relacional PostgreSQL (`SELECT ... ORDER BY id DESC LIMIT 100`).
   * **Nível 2 (Google Places API Direto):** Caso o Nível 1 falhe ou a base de dados relacional esteja indisponível, o servidor realiza um *fetch* direto e assíncrono utilizando a `GOOGLE_PLACES_API_KEY` (ou `GOOGLE_API_KEY`) e o `GOOGLE_PLACE_ID` das variáveis de ambiente na API oficial do Google Places (`https://maps.googleapis.com/maps/api/place/details/json`).
   * **Nível 3 (Ficheiro de Volume Persistente `testimonials.json`):** Caso o Nível 2 falhe ou as chaves da Google API não estejam configuradas, o sistema serve de forma transparente os testemunhos armazenados no ficheiro local persistente do Volume `/app/data/testimonials.json` (`loadTestimonials()`).
3. **Garantia de Isolamento Absoluto & Não-Bloqueio:**
   * Quaisquer falhas de conexão ou erros de tabela no PostgreSQL emitem unicamente avisos informativos de aviso (`console.warn`) nos registos e **NUNCA** afetam o arranque do servidor, o processo de checkout, a atualização de stock ou a leitura do catálogo de produtos.

---

## 9. Roteiro Técnico de Solução iOS WebKit & Otimização Mobile (FASE 1 APLICADA)

### A. Diagnóstico & Solução de Flicker de Imagens no iOS (Safari/WebKit) — [IMPLEMENTADO]
*   **Causa Raiz no WebKit:** O motor Safari/WebKit em iOS impõe limites rigorosos de alocação de memória gráfica por aba. Durante o scroll rápido com inércia em grelhas de imagens, o WebKit descarta ativamente texturas descodificadas em memória GPU para evitar estoiros de memória (*tab crash*), resultando no efeito de piscar (*flicker*) quando as imagens voltam a ser compostas.
*   **Arquitetura de Solução Aplicada no Código:**
    1.  **Hardware-Backing CSS:** Aplicação de `-webkit-backface-visibility: hidden; backface-visibility: hidden; transform: translateZ(0);` nos invólucros dos cartões de produtos (`ProductCard`) e categorias para manter as camadas de composição ativas na GPU sem exceder limites de memória.
    2.  **Modo de Descodificação Assíncrono (`decoding="async"`):** Força o descodificador de imagem do browser a processar os pixéis fora do thread principal de UI.
    3.  **Proporção de Aspeto Rígida & Layout Lock:** Definição explícita do rácio visual (`aspect-[4/5]` e `aspect-[4/3]`) com `content-visibility: auto` e `contain-intrinsic-size: 0 420px`, prevenindo repinturas (*layout shifts*) durante o scroll acelerado.

### B. Plano de Otimização LCP Mobile (Metas: PageSpeed >90) — [FASE 1 & 2 IMPLEMENTADAS]
1.  **Imagens Locais Autênticas M★BRAVO em WebP:** Processamento e alojamento local na pasta `/public/` de todas as 4 imagens rotativas do Hero (geradas diretamente dos PNGs autênticos da marca M★BRAVO), eliminando dependências de servidores terceiros (ex: Unsplash / ImgBB) e reduzindo o peso do Hero mobile para 45KB (redução de 98%).
2.  **Estrutura Responsiva `<picture>` com WebP Local:** Serve `/hero-bg-1-mobile.webp` (45KB) em ecrãs de menor dimensão (`max-width: 640px`) e `/hero-bg-1-desktop.webp` (159KB) no desktop.
3.  **Preload Crítico Condicional no HTML `<head>`:** Declaração de `<link rel="preload" as="image" href="/hero-bg-1-mobile.webp" media="(max-width: 640px)" fetchpriority="high" type="image/webp" />` antecipando a descoberta da imagem local pelo parser do browser.
4.  **Defer de Scripts de Terceiros:** Execução do Pinterest Pixel diferida para 2 segundos após o evento `load` (`window.onload`), desonerando a thread principal do CPU em telemóveis durante o FCP e Speed Index.
5.  **Code-Splitting de Modais (`React.lazy()`):** Módulos pesados (`LegalModal`, `AdminDashboardModal`) isolados em bundles dinâmicos, diminuindo a carga inicial do bundle principal.
6.  **Estratégia de Carregamento Prioritário na Grelha:** As primeiras 4 imagens do catálogo carregam com `loading="eager"` e `fetchPriority="high"`, enquanto as restantes (a partir do 5.º artigo) usam `loading="lazy"`.

### C. Roteiro de Funcionalidades Disruptivas de Luxo (Padrão Global M★BRAVO)
*   **Certificado de Autenticidade Digital via Tap NFC:** Cada peça M★BRAVO inclui um chip NFC cosido na etiqueta. Ao aproximar o smartphone, a cliente abre a página de autenticação da peça com número de série, artesã que a produziu, data e instruções exclusivas de preservação.
*   **Personalizador 3D / Atelier Studio:** Módulo interativo onde a cliente escolhe fios, combinações de cores, alças e adiciona medalhas em metal gravadas com iniciais em tempo real.
*   **VIP Atelier Concierge:** Canal de agendamento privado para atendimento personalizado diretamente com o Atelier via videochamada para peças por encomenda (ex: noivas e eventos formais).
*   **Soundscape Atmosférico do Atelier:** Leitor sonoro opcional e subtil na barra superior que reproduz os sons calmos do atelier (tear e textura do fio), criando uma atmosfera envolvente e artesanal.

