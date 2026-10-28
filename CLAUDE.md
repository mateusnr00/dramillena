# Instruções para o Claude

## Sempre publicar depois de cada mudança

O dono do projeto pediu: **toda alteração deve ser publicada para ele ver**, sem precisar pedir.

Depois de cada mudança:

1. Rode o site localmente (`npm run dev`) e confira no navegador (desktop e celular).
2. Faça commit e `git push` na branch de trabalho.
3. Publique:
   - **Produção (Vercel, projeto `millena-curty`)**: o site está em https://millena-curty.vercel.app. Cada push gera uma prévia automática na Vercel. Para produção, crie um deployment com `target: production` a partir do commit (ferramenta `create_deployment` da Vercel) e confira as páginas e o `/api/me`.
   - Na Vercel, o banco é Postgres (`DATABASE_URL`, Neon ligado em Storage) e as fotos ficam no Vercel Blob. As fotos do site estão em `img/` no Blob e são copiadas no build por `scripts/build-img.mjs`.
   - A versão Cloudflare (`functions/`, D1 e R2) continua funcionando: `api/router.js` só reaproveita as mesmas funções.
4. Envie o link para o dono junto com o resumo do que mudou.

## Design

Direção atual: **site brasileiro premium, compacto e cinematográfico**. Base escura de cinema com momentos claros, fotografia editorial e tipografia de luxo.

- **Tudo em português.** Nada de títulos, slogans, menus ou nomes de seção em inglês. Título da abertura: "A beleza da sua essência."
- **Início com 4 seções só**: abertura (foto ou vídeo, nome, título, subtítulo, botão), a doutora (retrato, resumo, credenciais, botão para /doutora), três procedimentos em destaque (composição assimétrica, botão para /procedimentos) e agendamento (WhatsApp e dados da clínica) com rodapé compacto. Não volte a encher a página inicial.
- **Páginas internas** guardam os módulos: /doutora (perfil, filosofia, etapas, indicadores, depoimentos, resultados, perguntas, consultório), /procedimentos (lista completa, leitura facial, camadas e colágeno), /agendar (pré-reserva online), /privacidade.
- **Dados de exemplo**: o painel marca com "Exemplo" o que ainda é demonstrativo. Credenciais, números, depoimentos e resultados de exemplo não são publicados (função `real()` em `src/render.js`); depoimentos, resultados e indicadores também dependem de um botão "Publicar" no painel.
- Paleta: Obsidian #10100F, Charcoal #222321, Ivory #F5F0E7, Champagne #D5C9B5, Stone #8B8278 (só sobre obsidian), texto secundário sobre ivory #625a52.
- Tipografia: Newsreader light nos títulos (tamanho óptico fixo em 36), Manrope no texto, DM Mono só em legendas técnicas. Cormorant quebra o "ê" no Chromium.
- Movimento: títulos sobem por máscara e imagens abrem por recorte, rápido (até cerca de 1 s). Sem scroll preso, sem quique. Tudo desligado com movimento reduzido e o conteúdo aparece sem JavaScript.
- Grade de 8 px, texto em rem que aguenta letra em 200%, contraste mínimo de 4,5:1. Metas: Lighthouse acessibilidade 95+, performance 90+.
- Versões rejeitadas: Apple clara com SF/Inter, creme e bronze, mapa do rosto colorido, preto e branco com Archivo condensada, rosé com Bodoni, landing page com cara de template, versão em inglês com 10 capítulos (longa demais).
