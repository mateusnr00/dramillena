// Fotos e vídeos do painel no Vercel Blob, com a interface do R2 que o código
// já usa (put). O endereço público é consultado por url() para a rota /media.

export function blobBucket(token) {
  return {
    async put(key, data, opts = {}) {
      const { put } = await import('@vercel/blob');
      const type = opts.httpMetadata && opts.httpMetadata.contentType;
      await put(key, Buffer.from(data), {
        access: 'public',
        contentType: type,
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 31536000,
        token
      });
    },
    async url(key) {
      const { head } = await import('@vercel/blob');
      try {
        return (await head(key, { token })).url;
      } catch {
        return null;
      }
    }
  };
}
