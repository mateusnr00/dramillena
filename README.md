# Dra. Millena Curty · site e painel

Site de harmonização facial com painel administrativo próprio.

- **Site** (`/`): página única renderizada no servidor, rápida e otimizada para Google.
- **Painel** (`/admin`): métricas de visitas e contatos, leads do formulário, edição de todo o conteúdo e das fotos, usuários.

Tudo roda na **Cloudflare** (plano gratuito):

| Peça | Serviço | Para quê |
| --- | --- | --- |
| Site e APIs | Cloudflare Pages + Functions | Hospedagem e backend |
| Banco de dados | Cloudflare D1 (SQLite) | Conteúdo, leads, métricas, usuários |
| Imagens | Cloudflare R2 | Fotos enviadas pelo painel |

As tabelas do banco são criadas automaticamente no primeiro acesso. Não há migração para rodar.

## Estrutura

```
public/            arquivos estáticos (CSS, JS, imagens, painel)
  img/             imagens padrão do site
  admin.html       painel
functions/         rotas do servidor (Cloudflare Pages Functions)
  index.js         renderiza a página inicial
  api/             login, conteúdo, upload, rastreamento, leads, métricas, usuários
  media/           entrega as imagens do R2
src/               código compartilhado (conteúdo padrão, banco, login, template)
```

## Publicar na Cloudflare (uma vez só)

1. **Banco**: no painel da Cloudflare, vá em *Storage & Databases → D1* → **Create**, com o nome `millena`.
2. **Imagens**: vá em *R2* → **Create bucket**, com o nome `millena-media`.
3. **Site**: vá em *Workers & Pages → Create → Pages → Connect to Git*, escolha o repositório `dramillena` e configure:
   - *Production branch*: `main`
   - *Build command*: deixe vazio
   - *Build output directory*: `public`
4. No projeto criado, abra *Settings → Bindings* e adicione:
   - **D1 database**: nome `DB` → banco `millena`
   - **R2 bucket**: nome `MEDIA` → bucket `millena-media`
5. Em *Settings → Variables and Secrets*, adicione (tipo **Secret**):
   - `AUTH_SECRET`: um texto longo e aleatório (40+ caracteres)
   - `ADMIN_EMAIL`: email do primeiro acesso ao painel
   - `ADMIN_PASSWORD`: senha do primeiro acesso
6. Em *Deployments*, clique em **Retry deployment** para aplicar as configurações.
7. Acesse `/admin`, entre com o email e a senha do passo 5. A conta é criada no primeiro login. Depois troque a senha em **Usuários**.
8. (Opcional) Em *Custom domains*, ligue o domínio próprio, ex.: `millenacurty.com.br`.

A cada `git push` na branch `main`, a Cloudflare publica a nova versão sozinha.

## Rodar localmente

```bash
npm install
```

```bash
cp .dev.vars.example .dev.vars
```

```bash
npm run dev
```

O site abre em http://localhost:8788 e o painel em http://localhost:8788/admin.

## Rastreamento

O site mede, sem cookies e sem guardar IP:

- visitas e pessoas únicas;
- de onde a visita veio (Instagram, Google, anúncio, link com `utm_*`);
- cliques em WhatsApp, botões, procedimentos, dúvidas e no antes e depois;
- quem preencheu o formulário (lead), com nome, WhatsApp e interesse.

Se o Pixel da Meta ou o Google Analytics forem configurados em **Contato e marketing**, o site mostra o aviso de cookies (LGPD) e só carrega essas ferramentas depois do aceite.
