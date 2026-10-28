import { DEFAULT_CONFIG, mergeConfig } from './defaults.js';

// O schema é criado sob demanda: não é preciso rodar migração na Cloudflare.
// Cada isolate executa o batch uma vez só.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS kv (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL,
     updated_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     salt TEXT NOT NULL,
     hash TEXT NOT NULL,
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS events (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     ts INTEGER NOT NULL,
     day TEXT NOT NULL,
     type TEXT NOT NULL,
     label TEXT,
     visitor TEXT,
     session TEXT,
     path TEXT,
     ref TEXT,
     source TEXT,
     medium TEXT,
     campaign TEXT,
     device TEXT,
     country TEXT,
     city TEXT
   )`,
  `CREATE INDEX IF NOT EXISTS events_day ON events(day)`,
  `CREATE INDEX IF NOT EXISTS events_ts ON events(ts)`,
  `CREATE TABLE IF NOT EXISTS leads (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     ts INTEGER NOT NULL,
     nome TEXT NOT NULL,
     telefone TEXT NOT NULL,
     procedimento TEXT,
     source TEXT,
     medium TEXT,
     campaign TEXT,
     ref TEXT,
     status TEXT NOT NULL DEFAULT 'novo',
     notas TEXT,
     visitor TEXT,
     session TEXT
   )`,
  `CREATE INDEX IF NOT EXISTS leads_ts ON leads(ts)`,
  `CREATE TABLE IF NOT EXISTS bookings (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     created_at INTEGER NOT NULL,
     date TEXT NOT NULL,
     time TEXT NOT NULL,
     nome TEXT NOT NULL,
     telefone TEXT NOT NULL,
     interesse TEXT,
     status TEXT NOT NULL DEFAULT 'pendente',
     lead_id INTEGER
   )`,
  `CREATE INDEX IF NOT EXISTS bookings_date ON bookings(date)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot ON bookings(date, time) WHERE status <> 'cancelado'`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
     key TEXT PRIMARY KEY,
     count INTEGER NOT NULL,
     first_ts INTEGER NOT NULL
   )`
];

let schemaReady = null;

export function hasDb(env) {
  return Boolean(env && env.DB);
}

export async function db(env) {
  if (!hasDb(env)) throw new Error('Banco de dados D1 não configurado (binding DB).');
  if (!schemaReady) {
    schemaReady = env.DB.batch(SCHEMA.map(sql => env.DB.prepare(sql))).catch(err => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
  return env.DB;
}

export async function loadConfig(env) {
  if (!hasDb(env)) return structuredClone(DEFAULT_CONFIG);
  try {
    const d = await db(env);
    const row = await d.prepare('SELECT value FROM kv WHERE key = ?').bind('config').first();
    return mergeConfig(DEFAULT_CONFIG, row ? JSON.parse(row.value) : null);
  } catch (err) {
    console.error('loadConfig', err);
    return structuredClone(DEFAULT_CONFIG);
  }
}

export async function saveConfig(env, cfg) {
  const d = await db(env);
  await d.prepare(
    `INSERT INTO kv (key, value, updated_at) VALUES ('config', ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(JSON.stringify(cfg), Date.now()).run();
}
