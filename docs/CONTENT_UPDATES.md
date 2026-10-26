# Updating portfolio content from another app

The portfolio is a static site. Its content lives in three JSON files in this repo, and Netlify rebuilds the site whenever `main` changes. To update the live site from another app, that app's **backend** commits new JSON to GitHub. There's no portfolio server to call.

```
your app's backend ──(GitHub Contents API)──▶ commit to main ──▶ Netlify validates + builds ──▶ live in ~1–2 min
```

## The files

| File | What it drives | Schema |
| --- | --- | --- |
| `src/app/data/projects.json` | Projects page cards (in array order) and the project count on the home page | [`projects.schema.json`](../src/app/data/schema/projects.schema.json) |
| `src/app/data/timeline.json` | Year-by-year timeline on the Experience page | [`timeline.schema.json`](../src/app/data/schema/timeline.schema.json) |
| `src/app/data/cards.json` | Detail cards on the left of the Experience page (in array order, grouped by `section`) | [`cards.schema.json`](../src/app/data/schema/cards.schema.json) |
| `src/assets/*` | Images, such as card logos | — |

Each file is a JSON **array**. The schemas are the contract. Your app can load them straight from GitHub and validate before committing (for example with [Ajv](https://ajv.js.org/)):

```
https://raw.githubusercontent.com/R1tMah/portfolio-v2/main/src/app/data/schema/projects.schema.json
https://raw.githubusercontent.com/R1tMah/portfolio-v2/main/src/app/data/schema/timeline.schema.json
https://raw.githubusercontent.com/R1tMah/portfolio-v2/main/src/app/data/schema/cards.schema.json
```

### Things the schema enforces

- **Unknown fields are rejected.** A typo like `"bulets"` fails validation instead of silently disappearing.
- **`projects[].tags`** must come from `Full-Stack`, `ML`, `Data Science`, `CV`, `NLP`. These are also the filter chips. To add a tag, change the `enum` in `projects.schema.json`, and the site picks it up automatically.
- **`timeline[].monthLabel`** must look exactly like `"Jan 2026"`: a three-letter month, one normal space, then the year. Each month can appear only once. Order in the file doesn't matter, because the site groups months by year and sorts them.
- **`cards[].logo`** must be `""` or `assets/<file>`, and the file must already exist in `src/assets/`.
- **`hidden: true`** on any item keeps it in the data but off the site. To show the item again, remove the field or set it to `false`.

### How the timeline displays

For each month the site shows **only one thing**: `employer` if it's non-empty, otherwise `courses`, otherwise `certs` and `projects` together. The year picker opens on the newest year in the data.

## One-time setup: a GitHub token

1. On GitHub, go to **Settings → Developer settings → Fine-grained personal access tokens → Generate new token**.
2. Under **Repository access**, choose **Only select repositories → `R1tMah/portfolio-v2`**.
3. Under **Repository permissions**, set **Contents: Read and write**. Leave everything else as "No access".
4. Store the token as a secret environment variable in your app's backend, e.g. `PORTFOLIO_GITHUB_TOKEN`.

> Keep the token on the server. Never send it to a browser, put it in frontend code, or commit it. Anyone holding it can push to this repo.

When the token expires, generate a new one and update the secret.

## Committing an update

Use the [Contents API](https://docs.github.com/en/rest/repos/contents): read the file to get its `sha`, then `PUT` the new content with that `sha`. If someone else committed in between, GitHub answers `409 Conflict`. In that case, re-read the file and try again. Reading fresh each time also means you never overwrite edits made in the `/admin` editor or by hand.

Node 18+ example (no dependencies):

```js
const REPO = 'R1tMah/portfolio-v2';
const BRANCH = 'main';
const API = `https://api.github.com/repos/${REPO}/contents`;
const headers = {
  Authorization: `Bearer ${process.env.PORTFOLIO_GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

/**
 * Read a JSON file from the repo, pass it to `change`, and commit the result.
 * `change` gets the current array and returns the new one.
 */
async function updateJson(path, change, message) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(`${API}/${path}?ref=${BRANCH}`, { headers });
    if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${await res.text()}`);
    const file = await res.json();
    const current = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));

    const next = change(current);
    const put = await fetch(`${API}/${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message,
        branch: BRANCH,
        sha: file.sha,
        // 2-space indent + trailing newline matches the editor, so diffs stay clean
        content: Buffer.from(JSON.stringify(next, null, 2) + '\n').toString('base64'),
      }),
    });
    if (put.ok) return put.json();
    if (put.status !== 409) throw new Error(`PUT ${path}: ${put.status} ${await put.text()}`);
    // 409: the file changed since we read it — loop and re-apply on the fresh copy
  }
  throw new Error(`PUT ${path}: kept conflicting, giving up`);
}

/** Upload a new image to src/assets/ and return the path to use in cards.json. */
async function uploadImage(fileName, bytes /* Buffer */) {
  const path = `src/assets/${fileName}`;
  const res = await fetch(`${API}/${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message: `Add ${fileName}`, branch: BRANCH, content: bytes.toString('base64') }),
  });
  // 422 here usually means the file already exists: pick another name
  if (!res.ok) throw new Error(`upload ${fileName}: ${res.status} ${await res.text()}`);
  return `assets/${fileName}`;
}
```

### Examples

Add a project at the top of the Projects page:

```js
await updateJson('src/app/data/projects.json', projects => [
  {
    title: 'My New Project',
    dateRange: 'Oct 2026 – Nov 2026',
    bullets: ['One-line summary shown on the card.', 'More detail shown in the dialog.'],
    skills: ['TypeScript', 'Postgres'],
    tags: ['Full-Stack'],
    repoUrl: 'https://github.com/R1tMah/my-new-project',
  },
  ...projects,
], 'Add My New Project');
```

Add or replace a month on the timeline:

```js
const month = { monthLabel: 'Feb 2026', employer: ['XCL SureStart Mentor'] };
await updateJson('src/app/data/timeline.json',
  timeline => [...timeline.filter(e => e.monthLabel !== month.monthLabel), month],
  `Timeline: ${month.monthLabel}`);
```

Add an experience card with a new logo. Commit the image first, because validation checks that the logo exists:

```js
const logo = await uploadImage('acme.png', pngBuffer);
await updateJson('src/app/data/cards.json', cards => [
  { section: 'experience', title: 'SWE Intern @ Acme', logo, bullets: ['What I built.'], skills: ['Go'] },
  ...cards,
], 'Add Acme card');
```

Hide a project without deleting it:

```js
await updateJson('src/app/data/projects.json',
  projects => projects.map(p => p.title === 'NBA Game Predictor' ? { ...p, hidden: true } : p),
  'Hide NBA Game Predictor');
```

## When the data is wrong

- **Netlify** runs `node tools/validate-content.mjs` before every build (see `netlify.toml`). If the data is invalid, the build fails and **the current live site stays up unchanged**. The Netlify deploy log lists each problem, e.g. `projects.json[0].tags[1]: "AI" is not one of …`.
- **GitHub Actions** (`.github/workflows/validate-content.yml`) runs the same check on every commit that touches the data, so a bad commit gets a red ✗ on GitHub.
- To fix it, commit corrected JSON. The next build goes live as normal.

You can run the same check locally with `npm run validate:content`. The `/admin` editor runs it on every save too.

## Working alongside the local editor

The `/admin` editor (`npm run dev`) edits these same files on your computer. Since your app now commits to `main` directly, run `git pull` before editing locally. Otherwise you'll hit a merge conflict when you push.
