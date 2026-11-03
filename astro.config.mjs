// @ts-check
import { defineConfig } from 'astro/config';

// Until the Combell domain is connected, the site lives at
// https://pixie-paw.github.io/portfolio/. Once the custom domain is live,
// change `site` to the domain (e.g. 'https://irinamoldovan.be') and `base` to '/'.
export default defineConfig({
  site: 'https://pixie-paw.github.io',
  base: '/portfolio',
});
