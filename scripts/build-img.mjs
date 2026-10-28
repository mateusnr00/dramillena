// Etapa de build na Vercel: as fotos do site ficam guardadas no Vercel Blob
// (pasta img/) e são copiadas para public/img a cada publicação.
// Se uma foto ainda não estiver no Blob e IMG_SEED_URL estiver definida, ela é
// baixada desse endereço uma única vez e guardada no Blob.
import fs from 'node:fs/promises';
import path from 'node:path';

const FILES = ['millena.webp', 'antes1.webp', 'depois1.webp'];
const OUT = path.join(process.cwd(), 'public', 'img');
const token = process.env.BLOB_READ_WRITE_TOKEN;
const seed = (process.env.IMG_SEED_URL || '').replace(/\/+$/, '');

async function main() {
  if (!token) { console.log('img: sem BLOB_READ_WRITE_TOKEN, nada a copiar'); return; }
  const { head, put } = await import('@vercel/blob');
  await fs.mkdir(OUT, { recursive: true });
  for (const name of FILES) {
    const dest = path.join(OUT, name);
    try {
      let url = null;
      try { url = (await head('img/' + name, { token })).url; } catch { url = null; }
      if (!url && seed) {
        const r = await fetch(seed + '/img/' + name);
        const type = r.headers.get('content-type') || '';
        if (!r.ok || !type.startsWith('image/')) throw new Error('semente indisponível (' + r.status + ')');
        const buf = Buffer.from(await r.arrayBuffer());
        url = (await put('img/' + name, buf, { access: 'public', contentType: type, addRandomSuffix: false, allowOverwrite: true, token })).url;
        console.log('img: ' + name + ' guardada no Blob');
      }
      if (!url) { console.log('img: ' + name + ' não encontrada'); continue; }
      const r = await fetch(url);
      if (!r.ok) throw new Error('download ' + r.status);
      await fs.writeFile(dest, Buffer.from(await r.arrayBuffer()));
      console.log('img: ' + name + ' ok');
    } catch (err) {
      console.log('img: ' + name + ' falhou: ' + err.message);
    }
  }
}

main();
