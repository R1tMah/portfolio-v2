// Local content editor backend for the /admin page.
// Runs a tiny API that reads/writes src/app/data/*.json and starts `ng serve`
// alongside it. Dev only: nothing here ships with the site.
import express from 'express';
import { spawn } from 'node:child_process';
import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CONTENT_FILES as FILES, validateContent } from './content-validator.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'src/app/data');
const ASSETS_DIR = path.join(ROOT, 'src/assets');
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const API_PORT = 3003;
const APP_PORT = 3002;

const app = express();
app.use(express.json({ limit: '2mb' }));
// ng serve doesn't notice images added while it runs, so serve src/assets from here
// (proxied via proxy.conf.json) to make fresh uploads show up immediately.
app.use('/assets', express.static(ASSETS_DIR));

app.get('/dev-admin/:name', async (req, res) => {
  const file = FILES[req.params.name];
  if (!file) return res.status(404).json({ error: 'unknown file' });
  res.type('json').send(await readFile(path.join(DATA_DIR, file), 'utf8'));
});

app.put('/dev-admin/:name', async (req, res) => {
  const file = FILES[req.params.name];
  if (!file) return res.status(404).json({ error: 'unknown file' });
  const errors = validateContent(req.params.name, req.body);
  if (errors.length) return res.status(422).json({ error: 'invalid content', errors });
  await writeFile(path.join(DATA_DIR, file), JSON.stringify(req.body, null, 2) + '\n');
  console.log(`[dev-admin] saved ${file} (${req.body.length} items)`);
  res.json({ ok: true });
});

// Save an uploaded image into src/assets and return the path the site uses for it.
app.post('/dev-admin/upload', express.raw({ type: 'image/*', limit: '10mb' }), async (req, res) => {
  const original = path.basename(String(req.query.name ?? '')).toLowerCase();
  const ext = path.extname(original);
  if (!IMAGE_EXTS.includes(ext)) return res.status(400).json({ error: `use one of ${IMAGE_EXTS.join(' ')}` });
  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'empty upload' });

  const base = path.basename(original, ext).replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'image';
  let name = base + ext;
  for (let n = 1; await exists(path.join(ASSETS_DIR, name)); n++) name = `${base}-${n}${ext}`;

  await writeFile(path.join(ASSETS_DIR, name), req.body);
  console.log(`[dev-admin] uploaded assets/${name}`);
  res.json({ path: `assets/${name}` });
});

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

app.listen(API_PORT, '127.0.0.1', () => {
  console.log(`[dev-admin] API on http://127.0.0.1:${API_PORT}`);
  console.log(`[dev-admin] editor at http://localhost:${APP_PORT}/admin`);
});

const ng = spawn('npx', ['ng', 'serve', '--port', String(APP_PORT)], { cwd: ROOT, stdio: 'inherit' });
ng.on('exit', code => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { ng.kill(sig); process.exit(0); });
