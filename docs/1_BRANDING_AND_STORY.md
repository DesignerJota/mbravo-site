# M★BRAVO — Branding & Story Blueprint

Este documento mapeia a identidade visual, o tom de voz, os elementos gráficos e o conceito da marca **M★BRAVO** com base na implementação atual do código, estilos e componentes.

---

## 1. Conceito e Identidade de Marca
A **M★BRAVO** (by Carolina) é uma marca portuguesa de **design autoral e crochet premium**. Sob o mote *"Handmade with Love"*, a marca posiciona-se no segmento de luxo artesanal, valorizando a lentidão, a atenção meticulosa ao detalhe, a qualidade e a pureza de cada ponto de linha de algodão.

*   **Mantra Principal:** *"Mais do que crochet, é uma forma de preservar aquilo que realmente importa."*
*   **Filosofia:** Cada peça transporta tempo e afeto, transformando fios em peças únicas e memórias em objetos tangíveis.
*   **Abordagem:** Peças tecidas especialmente sob encomenda, respeitando o ritmo orgânico das matérias-primas e a herança familiar do artesanato nacional.

---

## 2. Paleta de Cores (Tailwind CSS)
A paleta de cores reflete um ambiente acolhedor, natural, sofisticado e intemporal. Definida no arquivo global `src/index.css`:

| Nome da Cor | Valor Hexadecimal | Aplicação Principal no Código |
| :--- | :--- | :--- |
| **Forest Green** (`forest`) | `#243119` | Cor de fundo principal de botões, logótipos, texto base e botões primários. |
| **Cream** (`cream`) | `#F5F2ED` | Fundo principal da página (off-white) e texto alternativo de alto contraste. |
| **Brand Green Light** | `#B7BAA2` | Tons secundários de botões, tags e acentuações ecológicas/artesanais. |
| **Gold Accent** | `#C5A059` | Destaques decorativos, cabeçalhos das secções de termos legais e detalhes finos. |

---

## 3. Tipografia Oficial
A tipografia estabelece o ritmo entre o luxo editorial clássico e a legibilidade moderna:

*   **Display (Títulos e Serifas):** `"Playfair Display"` combinado com `"Cormorant Garamond"` (serif). Usado em títulos de cabeçalhos, frases em destaque e citações da marca para evocar uma presença editorial de moda sofisticada.
*   **Texto Geral (Sem Serifa):** `"Inter"` (sans-serif). Utilizado para menus, descrições de produtos, painéis do Admin e todo o texto operacional, garantindo clareza técnica e legibilidade impecável em qualquer ecrã.

---

## 4. Tom de Voz e Comunicação
A linguagem adotada pela marca segue diretrizes estritas de sofisticação:
*   **Terminologia Proibida:** O termo *"confeção"* foi completamente banido da comunicação do produto para evitar conotações fabris ou industriais.
*   **Terminologia Adotada:** Emprega-se estritamente o termo **"produção artesanal"** ou **"preparação"** para descrever o trabalho à mão.
*   **Ortografia Unificada:** Todas as variações antigas (*croché*, *crochê*) foram limpas e uniformizadas com a grafia internacional **"Crochet"** com "t", reforçando o posicionamento premium e a coesão de leitura para marcas globais.
*   **Apoio à Narrativa:** O tom é poético mas profissional, tratando cada produto como uma obra de arte única sob encomenda.

---

## 5. Elementos Gráficos e Detalhes Visuais
O site distingue-se por vários acabamentos visuais ricos que evocam o toque físico das peças:

1.  **Textura de Ruído (Noise Overlay):**
    *   Classe `.noise-overlay` aplicada de forma fixa em todo o viewport (opacidade de 4%). Introduz um grão orgânico que quebra a frieza digital e simula a textura de papel de alta gramagem ou linho.
2.  **Selo Físico de Cera (Wax Seal):**
    *   Classe `.colors-patch`. Recria o aspeto tridimensional de um selo de cera derretida com rotação orgânica de `-3deg`, relevos de sombra internos e bordas imperfeitas, finalizado por uma linha de costura dourada tracejada (`.colors-patch::after`).
3.  **Etiqueta de Couro (Leather Patch):**
    *   Classe `.brand-patch`. Uma textura de etiqueta física costurada em tom verde floresta com sobreposição de malha trançada, usada para destacar produtos e variações de catálogo.
4.  **Animações de Transição de Ecrã:**
    *   Utilização da biblioteca `motion` (de `motion/react`) para criar micro-interações elegantes.
    *   Classe `.transition-svg` para transições suaves de 1000ms com curvas cubic-bezier ao alterar estados de cor ou logótipos.
    *   Transições de suavização de scroll controladas pelo motor **Lenis Scroll** (`(window as any).lenis`) para garantir uma navegação fluida em desktop e mobile.
