// Fails if any URL the old static site served is missing from the build.
// Usage: node scripts/check-urls.mjs dist
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const urls = readFileSync(new URL('./legacy-urls.txt', import.meta.url), 'utf8').split('\n').filter(Boolean);
const missing = urls.filter((u) => !existsSync(join(dist, u.endsWith('/') ? `${u}index.html` : u)));
if (missing.length) {
  console.error(`Missing ${missing.length} legacy URL(s):\n${missing.join('\n')}`);
  process.exit(1);
}
console.log(`All ${urls.length} legacy URLs present in ${dist}/`);
