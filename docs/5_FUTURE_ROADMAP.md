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
*   [x] **Integração de Rastreio (GA4 `G-E3ZXEK6RGR`, GTM `GTM-TBNWW6L2`, Clarity `xuul4vcodg`):** Coleta de tráfego, funis de conversão, mapas de calor e gravações de sessão ativas no frontend.
*   [x] **Proteção de Subdomínio & Bloqueio de Indexação da API (`api.mbravobycarolina.com`):** Implementação de `robots.txt` estrito e cabeçalhos `X-Robots-Tag: noindex, nofollow` no servidor Express.
*   [ ] **Telemetria de Visitantes em Tempo Real (Server-Sent Events - SSE):** Implementação de stream unidirecional leve `/api/admin/telemetry/live` para exibição de utilizadores ativos no site, peças visualizadas no momento e carrinhos em preparação no Painel Admin, com consumo ultrabaixo de recursos e zero sobrecarga de conexões persistentemente mantidas.

---

*M★BRAVO Atelier — Onde o tempo do artesanato de luxo se cruza com a engenharia do futuro.*
