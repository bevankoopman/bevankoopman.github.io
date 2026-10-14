// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bevankoopman.github.io',
  // Keep /phd.html (not /phd/) so existing links still resolve.
  build: { format: 'preserve' },
});
