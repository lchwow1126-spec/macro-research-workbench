import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Hash the exact published bytes, never a parsed/reserialized JSON object.
const bytes = await readFile(new URL('../dashboard.json', import.meta.url));
JSON.parse(bytes.toString('utf8'));
const path = new URL('../publication-manifest.json', import.meta.url);
const manifest = JSON.parse(await readFile(path, 'utf8'));
const hash = createHash('sha256').update(bytes).digest('hex');
if (process.argv.includes('--check')) {
  if (manifest.snapshot_sha256 !== hash) throw new Error('snapshot_sha256 missing or stale; run node scripts/snapshot-manifest.mjs');
} else {
  manifest.snapshot_sha256 = hash;
  await writeFile(path, JSON.stringify(manifest, null, 2) + '\n');
}
