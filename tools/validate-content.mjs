// CLI: node tools/validate-content.mjs
// Exits non-zero when src/app/data/*.json is invalid, which stops the Netlify
// build so the last good deploy stays live.
import { validateAll } from './content-validator.mjs';

const errors = validateAll();
if (errors.length) {
  console.error(`Content validation failed (${errors.length} problem${errors.length === 1 ? '' : 's'}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Content OK: projects.json, timeline.json, cards.json');
