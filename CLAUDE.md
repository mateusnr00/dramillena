# Instruções para o Claude

## Sempre publicar depois de cada mudança

O dono do projeto pediu: **toda alteração deve ser publicada para ele ver**, sem precisar pedir.

Depois de cada mudança:

1. Rode o site localmente (`npm run dev`) e confira no navegador (desktop e celular).
2. Faça commit e `git push` na branch de trabalho.
3. Publique:
   - **Produção (Cloudflare Pages)**: quando o projeto estiver ligado ao GitHub, o push na `main` já publica sozinho. Se a mudança estiver em outra branch, a Cloudflare gera uma prévia automática dessa branch; mande o link.
   - **Enquanto a Cloudflare não estiver configurada**: suba uma prévia num sandbox da Vercel (projeto `millena-curty`, porta 8788) rodando `wrangler pages dev public --d1 DB --r2 MEDIA --ip 0.0.0.0 --port 8788`, com as imagens em `public/img/` e um `.dev.vars` com `AUTH_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Mande o link e lembre que a prévia dura cerca de 5 horas.
4. Envie o link para o dono junto com o resumo do que mudou.

## Design

Direção atual, pedida pelo dono no briefing **"The Art of the Face"**: luxury editorial + scientific futurism + cinematic minimalism. Base escura de cinema com capítulos claros para respiro.

- Paleta: Obsidian #10100F, Deep Charcoal #222321, Warm Ivory #F5F0E7, Champagne #D5C9B5, Muted Stone #8B8278 (só sobre obsidian), Soft White #FAF8F4. Texto secundário sobre ivory: #625a52. Nada de dourado chamativo, rosa clichê ou neon.
- Tipografia: Newsreader light nos títulos (tamanho óptico fixo em 36 para os traços finos não sumirem), Manrope no texto, DM Mono só em legendas técnicas. Cormorant quebra o "ê" no Chromium, não usar.
- Página em capítulos (01 a 10): abertura com retrato e luz lateral, filosofia, a profissional, Face Explorer (desenho de proporções em SVG, não 3D), tratamentos (índice que abre), ciência (camadas, colágeno, etapas), confiança, o espaço, agendamento, rodapé.
- Movimento: só títulos sobem por máscara e imagens abrem por recorte; texto corrido fica parado. Sem scroll hijacking, sem quique, sem partículas. Tudo desligado com movimento reduzido e o conteúdo aparece sem JavaScript.
- Conteúdo: não inventar credenciais, resultados ou depoimentos. Antes e depois só com consentimento e aviso. O Explorer não mostra pontos de aplicação nem prevê resultado.
- Grade de 8 px para espaços, controles e raios. Texto em rem, aguenta letra em 200%. Contraste mínimo de 4,5:1.
- Metas: Lighthouse acessibilidade 95+, performance 90+, LCP até 2,5 s, CLS até 0,1.
- Versões rejeitadas: Apple clara com SF/Inter, creme e bronze original, creme e bronze refinada com arco, mapa do rosto colorido, preto e branco com Archivo condensada, rosé com Bodoni, layout de landing page com cara de template. Não volte a elas sem pedido.
