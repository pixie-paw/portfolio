// @ts-check
import { defineConfig } from 'astro/config';

// The site is served from the custom domain set in GitHub Pages settings.
export default defineConfig({
  site: 'https://www.irinamoldovan.be',
  base: '/',
  // npm run dev also listens on the Wi-Fi network, so a phone or tablet on the same network can
  // open the Network address it prints. Only the dev server: the built site doesn't change.
  // https://docs.astro.build/en/reference/configuration-reference/#serverhost
  server: { host: true },
});
