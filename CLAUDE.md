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

O dono gosta do visual original do site (fundo creme, bronze, Fraunces + Outfit, topo escuro com antes e depois). **Melhore sem trocar o design.** Não redesenhe o site sem pedido explícito.
