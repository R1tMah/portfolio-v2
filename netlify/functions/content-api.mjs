// Backend for the deployed /admin editor. Netlify serves it at /admin/api/*
// (see netlify.toml). Same API as the local editor server in tools/dev.mjs,
// but reads and commits the JSON in GitHub, which triggers a Netlify rebuild.
//
//   GET  /admin/api/:name          → { items, version }    name = projects | timeline | cards
//   PUT  /admin/api/:name          ← { items, version }    → { ok, version }  (409 if changed since version)
//   POST /admin/api/upload?name=…  ← raw image bytes      → { path }
//
// Env vars (Netlify → Site configuration → Environment variables):
//   ADMIN_USERNAME, ADMIN_PASSWORD  basic auth for the editor
//   GITHUB_TOKEN                    fine-grained token, Contents: read & write on this repo
//   GITHUB_REPO   (optional)        default R1tMah/portfolio-v2
//   GITHUB_BRANCH (optional)        default main
import { CONTENT_FILES, validateContent, pickAssetName, IMAGE_EXTS } from '../../tools/content-validator.mjs';

const env = name => process.env[name] ?? '';
const REPO   = () => env('GITHUB_REPO') || 'R1tMah/portfolio-v2';
const BRANCH = () => env('GITHUB_BRANCH') || 'main';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Basic auth. Fails closed when the password isn't configured.
export function isAuthorized(header, username = env('ADMIN_USERNAME'), password = env('ADMIN_PASSWORD')) {
  if (!username || !password || !header?.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const i = decoded.indexOf(':');
  return i >= 0 && decoded.slice(0, i) === username && decoded.slice(i + 1) === password;
}

async function github(path, init = {}) {
  return fetch(`https://api.github.com/repos/${REPO()}/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env('GITHUB_TOKEN')}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...init.headers,
    },
  });
}

async function readFile(path) {
  const res = await github(`${path}?ref=${BRANCH()}`);
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status} ${await res.text()}`);
  const file = await res.json();
  return { text: Buffer.from(file.content, 'base64').toString('utf8'), sha: file.sha };
}

async function writeFile(path, base64, message, sha) {
  return github(path, {
    method: 'PUT',
    body: JSON.stringify({ message, branch: BRANCH(), content: base64, ...(sha ? { sha } : {}) }),
  });
}

async function assetNames() {
  const res = await github(`src/assets?ref=${BRANCH()}`);
  if (!res.ok) throw new Error(`GitHub GET src/assets: ${res.status} ${await res.text()}`);
  return new Set((await res.json()).map(f => f.name));
}

export default async function handler(req) {
  if (!isAuthorized(req.headers.get('authorization'))) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Portfolio editor", charset="UTF-8"' },
    });
  }
  if (!env('GITHUB_TOKEN')) return json({ error: 'GITHUB_TOKEN is not set in Netlify' }, 500);

  const url = new URL(req.url);
  const name = url.pathname.split('/').filter(Boolean).pop();

  try {
    if (name === 'upload' && req.method === 'POST') {
      const bytes = Buffer.from(await req.arrayBuffer());
      if (!bytes.length) return json({ error: 'empty upload' }, 400);
      const existing = await assetNames();
      const fileName = await pickAssetName(url.searchParams.get('name'), n => existing.has(n));
      if (!fileName) return json({ error: `use one of ${IMAGE_EXTS.join(' ')}` }, 400);
      const res = await writeFile(`src/assets/${fileName}`, bytes.toString('base64'), `Admin: upload ${fileName}`);
      if (!res.ok) return json({ error: `GitHub: ${res.status} ${await res.text()}` }, 502);
      return json({ path: `assets/${fileName}`, pending: true });
    }

    const file = CONTENT_FILES[name];
    if (!file) return json({ error: 'unknown file' }, 404);
    const path = `src/app/data/${file}`;

    if (req.method === 'GET') {
      const { text, sha } = await readFile(path);
      return json({ items: JSON.parse(text), version: sha });
    }

    if (req.method === 'PUT') {
      const { items, version } = await req.json();
      const existing = name === 'cards' ? await assetNames() : null;
      const errors = validateContent(name, items, existing ? { assetExists: n => existing.has(n) } : undefined);
      if (errors.length) return json({ error: 'invalid content', errors }, 422);

      const body = Buffer.from(JSON.stringify(items, null, 2) + '\n').toString('base64');
      const res = await writeFile(path, body, `Admin: update ${file}`, version);
      // GitHub answers 409 when `version` (the sha we loaded) is no longer the latest
      if (res.status === 409) return json({ error: 'conflict' }, 409);
      if (!res.ok) return json({ error: `GitHub: ${res.status} ${await res.text()}` }, 502);
      return json({ ok: true, version: (await res.json()).content.sha });
    }

    return json({ error: 'method not allowed' }, 405);
  } catch (err) {
    return json({ error: String(err.message ?? err) }, 502);
  }
}
