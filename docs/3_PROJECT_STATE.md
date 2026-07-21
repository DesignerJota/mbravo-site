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

---

## 4. Próximos Passos Recomendados
Para a passagem em segurança do repositório para o servidor de produção do cliente:
*   [ ] Efetuar a cópia dos ficheiros alterados (`src/App.tsx`, `src/translations.ts`, `src/components/AdminDashboardModal.tsx`, `index.html`) para a branch principal do GitHub.
*   [ ] Solicitar a inspeção e reindexação de URLs na Google Search Console para reavaliar as páginas após a otimização dos termos ortográficos.
*   [ ] Garantir que o volume de dados persistente `/app/data` está ativo no Railway para evitar perdas acidentais de encomendas ou perfis de clientes do CRM durante novas atualizações de código.
