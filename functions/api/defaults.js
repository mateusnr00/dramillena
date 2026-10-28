import { DEFAULT_CONFIG } from '../../src/defaults.js';
import { json } from '../../src/http.js';

// Conteúdo de exemplo, para o painel marcar o que ainda não foi substituído.
export function onRequestGet() {
  return json(DEFAULT_CONFIG);
}
