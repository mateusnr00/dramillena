import { requireUser } from '../../src/auth.js';
import { db } from '../../src/db.js';
import { json, error, readJson, sameOrigin, handleError } from '../../src/http.js';

const STATUS = ['novo', 'contatado', 'agendado', 'paciente', 'perdido'];

function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s; // evita fórmulas no Excel
  return '"' + s.replace(/"/g, '""') + '"';
}

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const q = (url.searchParams.get('q') || '').trim();
    const where = [];
    const args = [];
    if (status && STATUS.includes(status)) { where.push('status = ?'); args.push(status); }
    if (q) { where.push('(nome LIKE ? OR telefone LIKE ? OR procedimento LIKE ?)'); args.push(`%${q}%`, `%${q.replace(/\D/g, '') || q}%`, `%${q}%`); }
    const sql = `SELECT * FROM leads ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ts DESC LIMIT 1000`;
    const d = await db(env);
    const { results } = await d.prepare(sql).bind(...args).all();

    if (url.searchParams.get('format') === 'csv') {
      const cols = ['ts', 'nome', 'telefone', 'procedimento', 'status', 'source', 'medium', 'campaign', 'ref', 'notas'];
      const head = ['Data', 'Nome', 'Telefone', 'Procedimento', 'Status', 'Origem', 'Mídia', 'Campanha', 'Site de origem', 'Notas'];
      const lines = [head.map(csvCell).join(';')].concat(results.map(r => cols.map(c => {
        if (c === 'ts') return csvCell(new Date(r.ts - 3 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16));
        return csvCell(r[c]);
      }).join(';')));
      return new Response('﻿' + lines.join('\r\n'), {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
          'cache-control': 'no-store'
        }
      });
    }

    const counts = await d.prepare('SELECT status, COUNT(*) AS n FROM leads GROUP BY status').all();
    return json({ leads: results, counts: Object.fromEntries(counts.results.map(r => [r.status, r.n])) });
  } catch (err) {
    return handleError(err);
  }
}

export async function onRequestPatch({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  try {
    await requireUser(request, env);
    const { id, status, notas } = await readJson(request, 16384);
    if (!id) return error('Informe o lead');
    const d = await db(env);
    if (status !== undefined) {
      if (!STATUS.includes(status)) return error('Status inválido');
      await d.prepare('UPDATE leads SET status = ? WHERE id = ?').bind(status, id).run();
    }
    if (notas !== undefined) {
      await d.prepare('UPDATE leads SET notas = ? WHERE id = ?').bind(String(notas).slice(0, 4000), id).run();
    }
    return json({ ok: true, lead: await d.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first() });
  } catch (err) {
    return handleError(err);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  try {
    await requireUser(request, env);
    const { id } = await readJson(request, 4096);
    if (!id) return error('Informe o lead');
    await (await db(env)).prepare('DELETE FROM leads WHERE id = ?').bind(id).run();
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
