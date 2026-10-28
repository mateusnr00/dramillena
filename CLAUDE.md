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

Direção atual, pedida pelo dono: **estilo Apple/Nike**. Preto e branco, títulos gigantes em caixa alta (Archivo condensada), texto em Inter, imagens de borda a borda, pouco texto por tela e um único momento de movimento na rolagem.

- Grade de 8 px: espaçamentos, alturas de linha, controles e raios em múltiplos de 8.
- Tamanhos de texto em rem; o site precisa aguentar letra em 200% sem vazar.
- Contraste mínimo de 4,5:1 em texto comum.
- Versões rejeitadas: Apple clara com SF/Inter, creme e bronze original, creme e bronze refinada com arco, mapa do rosto. Não volte a elas sem pedido.
