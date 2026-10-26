// Validates src/app/data/*.json against the schemas in src/app/data/schema/.
// Implements just the JSON Schema keywords those schemas use, so it runs with
// plain Node (no npm install) in CI, in the Netlify build, and in the dev editor.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = path.join(ROOT, 'src/app/data');
const ASSETS_DIR = path.join(ROOT, 'src/assets');

export const CONTENT_FILES = {
  projects: 'projects.json',
  timeline: 'timeline.json',
  cards:    'cards.json',
};

const schemaFor = name =>
  JSON.parse(readFileSync(path.join(DATA_DIR, 'schema', `${name}.schema.json`), 'utf8'));

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function check(schema, value, at, errors) {
  if (schema.type && typeOf(value) !== schema.type) {
    errors.push(`${at}: expected ${schema.type}, got ${typeOf(value)}`);
    return;
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${at}: ${JSON.stringify(value)} is not one of ${schema.enum.map(v => JSON.stringify(v)).join(', ')}`);
  }
  if (typeof value === 'string') {
    if (schema.minLength && value.trim().length < schema.minLength) errors.push(`${at}: must not be empty`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${at}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, i) => check(schema.items, item, `${at}[${i}]`, errors));
  }
  if (typeOf(value) === 'object') {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errors.push(`${at}: missing required "${key}"`);
    }
    for (const [key, v] of Object.entries(value)) {
      const sub = schema.properties?.[key];
      if (sub) check(sub, v, `${at}.${key}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${at}: unknown field "${key}"`);
    }
  }
}

// Rules a schema can't express.
function extraChecks(name, data, file, errors) {
  if (!Array.isArray(data)) return;
  if (name === 'timeline') {
    const seen = new Set();
    data.forEach((e, i) => {
      if (seen.has(e?.monthLabel)) errors.push(`${file}[${i}].monthLabel: duplicate month ${JSON.stringify(e.monthLabel)}`);
      seen.add(e?.monthLabel);
    });
  }
  if (name === 'cards') {
    data.forEach((c, i) => {
      if (typeof c?.logo === 'string' && c.logo && !existsSync(path.join(ASSETS_DIR, c.logo.slice('assets/'.length)))) {
        errors.push(`${file}[${i}].logo: src/${c.logo} does not exist (commit the image first)`);
      }
    });
  }
}

/** Validate already-parsed data for one content file. Returns a list of error strings. */
export function validateContent(name, data) {
  const file = CONTENT_FILES[name];
  if (!file) return [`unknown content file "${name}"`];
  const errors = [];
  check(schemaFor(name), data, file, errors);
  extraChecks(name, data, file, errors);
  return errors;
}

/** Read and validate every content file on disk. */
export function validateAll() {
  const errors = [];
  for (const [name, file] of Object.entries(CONTENT_FILES)) {
    let data;
    try {
      data = JSON.parse(readFileSync(path.join(DATA_DIR, file), 'utf8'));
    } catch (err) {
      errors.push(`${file}: not valid JSON (${err.message})`);
      continue;
    }
    errors.push(...validateContent(name, data));
  }
  return errors;
}
