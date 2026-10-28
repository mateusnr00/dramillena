// Banco D1 (SQLite) sobre Postgres: a mesma interface que o código já usa
// (prepare, bind, first, all, run, batch), para o site rodar na Vercel com
// um banco Postgres (Neon) sem reescrever as consultas.
//
// O driver é uma função de consulta { q(sql, args), tx(fn) }; veja pgDriver()
// para o Postgres de verdade. Nos testes locais entra um Postgres em memória.

const AUTO_ID = /^\s*INSERT\s+INTO\s+(events|leads|bookings)\b/i;

// Traduz o SQL do SQLite para o Postgres. Só cobre o que este projeto usa.
export function translate(sql) {
  let n = 0;
  let out = sql.replace(/\?/g, () => '$' + (++n));
  out = out
    .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'BIGSERIAL PRIMARY KEY')
    .replace(/\bINTEGER\b/g, 'BIGINT') // datas em milissegundos não cabem em INTEGER
    .replace(/\bLIKE\b/g, 'ILIKE'); // LIKE do SQLite ignora maiúsculas
  // O SQLite informa o id criado em meta.last_row_id; no Postgres, pedimos de volta.
  if (AUTO_ID.test(out) && !/\bRETURNING\b/i.test(out)) out += ' RETURNING id';
  return out;
}

function meta(rows) {
  const id = rows && rows[0] && rows[0].id != null ? Number(rows[0].id) : undefined;
  return { last_row_id: id, changes: rows && rows.count != null ? rows.count : (rows ? rows.length : 0) };
}

class Statement {
  constructor(db, sql, args = []) {
    this.db = db;
    this.sql = sql;
    this.args = args;
  }
  bind(...args) {
    return new Statement(this.db, this.sql, args);
  }
  async all() {
    const rows = await this.db.driver.q(this.sql, this.args);
    return { success: true, results: Array.from(rows), meta: meta(rows) };
  }
  async first(col) {
    const rows = await this.db.driver.q(this.sql, this.args);
    const row = rows[0];
    if (row === undefined) return null;
    return col ? row[col] : row;
  }
  async run() {
    const rows = await this.db.driver.q(this.sql, this.args);
    return { success: true, results: Array.from(rows), meta: meta(rows) };
  }
}

export class PgD1 {
  constructor(driver) {
    this.driver = driver;
  }
  prepare(sql) {
    return new Statement(this, translate(sql));
  }
  // Várias instruções numa transação só, como o batch do D1.
  async batch(statements) {
    const schema = statements.length && statements.every(s => /^\s*CREATE\b/i.test(s.sql));
    return this.driver.tx(async q => {
      // Duas funções frias criando as tabelas ao mesmo tempo: uma espera a outra.
      if (schema) await q('SELECT pg_advisory_xact_lock(7311)', []);
      const out = [];
      for (const s of statements) {
        const rows = await q(s.sql, s.args);
        out.push({ success: true, results: Array.from(rows), meta: meta(rows) });
      }
      return out;
    });
  }
}

// Driver para o Postgres de verdade (Neon na Vercel), usando o pacote postgres.
export async function pgDriver(url) {
  const { default: postgres } = await import('postgres');
  const sql = postgres(url, {
    prepare: false, // o pooler do Neon não guarda prepared statements
    max: 3,
    idle_timeout: 20,
    onnotice: () => {},
    // COUNT e colunas BIGINT voltam como número, igual ao SQLite.
    types: { bigint: { to: 20, from: [20], serialize: x => String(x), parse: x => Number(x) } }
  });
  return {
    q: (text, args) => sql.unsafe(text, args),
    tx: fn => sql.begin(t => fn((text, args) => t.unsafe(text, args)))
  };
}
