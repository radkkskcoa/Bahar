/**
 * One-shot setup: applies the schema (idempotent) and seeds demo catalog data.
 * Runs as its own compose service before the API starts.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { pool, q, waitForDatabase } from './db.js';
import { seed } from './seed.js';

const here = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await waitForDatabase();
  const schema = await readFile(path.join(here, 'schema.sql'), 'utf8');
  await q(schema);
  console.log('[migrate] schema applied');
  await seed();
  console.log('[migrate] seed complete');
  await pool.end();
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
