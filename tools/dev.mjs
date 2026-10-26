// Local backend for the /admin editor. Runs a tiny API that reads/writes
// src/app/data/*.json and starts `ng serve` alongside it. Same API as the
// deployed editor's Netlify Function (netlify/functions/content-api.mjs),
// minus auth and GitHub: here saves just change files on disk.
import express from 'express';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CONTENT_FILES as FILES, IMAGE_EXTS, pickAssetName, validateContent } from './content-validator.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'src/app/data');
const ASSETS_DIR = path.join(ROOT, 'src/assets');
const API_PORT = 3003;
const APP_PORT = 3002;

// A file's "version" is a hash of its contents, so saves made from a stale copy are refused.
const versionOf = text => createHash('sha1').update(text).digest('hex');

const app = express();
app.use(express.json({ limit: '2mb' }));

// ng serve doesn't notice images added while it runs, so serve src/assets from here
// (proxied via proxy.conf.json) to make fresh uploads show up immediately.
app.use('/assets', express.static(ASSETS_DIR));

// Save an uploaded image into src/assets and return the path the site uses for it.
app.post('/admin/api/upload', express.raw({ type: 'image/*', limit: '10mb' }), async (req, res) => {
  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'empty upload' });
  const name = await pickAssetName(req.query.name, n => exists(path.join(ASSETS_DIR, n)));
  if (!name) return res.status(400).json({ error: `use one of ${IMAGE_EXTS.join(' ')}` });
  await writeFile(path.join(ASSETS_DIR, name), req.body);
  console.log(`[admin] uploaded assets/${name}`);
  res.json({ path: `assets/${name}` });
});

app.get('/admin/api/:name', async (req, res) => {
  const file = FILES[req.params.name];
  if (!file) return res.status(404).json({ error: 'unknown file' });
  const text = await readFile(path.join(DATA_DIR, file), 'utf8');
  res.json({ items: JSON.parse(text), version: versionOf(text) });
});

app.put('/admin/api/:name', async (req, res) => {
  const file = FILES[req.params.name];
  if (!file) return res.status(404).json({ error: 'unknown file' });
  const { items, version } = req.body ?? {};

  const current = await readFile(path.join(DATA_DIR, file), 'utf8');
  if (version !== versionOf(current)) return res.status(409).json({ error: 'conflict' });

  const errors = validateContent(req.params.name, items);
  if (errors.length) return res.status(422).json({ error: 'invalid content', errors });

  const text = JSON.stringify(items, null, 2) + '\n';
  await writeFile(path.join(DATA_DIR, file), text);
  console.log(`[admin] saved ${file} (${items.length} items)`);
  res.json({ ok: true, version: versionOf(text) });
});

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

app.listen(API_PORT, '127.0.0.1', () => {
  console.log(`[admin] API on http://127.0.0.1:${API_PORT}`);
  console.log(`[admin] editor at http://localhost:${APP_PORT}/admin`);
});

const ng = spawn('npx', ['ng', 'serve', '--port', String(APP_PORT)], { cwd: ROOT, stdio: 'inherit' });
ng.on('exit', code => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { ng.kill(sig); process.exit(0); });
