# Portfolio

Irina Moldovan's portfolio. Built with [Astro](https://astro.build) and [GSAP](https://gsap.com), deployed to GitHub Pages on every push to `main`.

## Run it locally

Needs Node 22.23 or newer.

```sh
npm install
npm run dev      # http://localhost:4321/
npm run build    # production build into dist/
```

## After a PR is merged on GitHub

```sh
git checkout main      # go back to the main branch
git pull               # download what was merged
npm install            # only needed if package.json changed
```

## Animations

All GSAP code lives in `src/scripts/animations.ts` and runs on every page. Add these attributes to any element:

| Attribute | Effect |
| --- | --- |
| `data-split` | Text slides up letter by letter on load (SplitText) |
| `data-reveal` | Fades and slides up when scrolled into view (ScrollTrigger) |
| `data-parallax="0.2"` | Moves slower than the page while scrolling |

Visitors with "reduce motion" turned on get the content without the movement.

## Deploying

1. In the repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`. The site appears at https://www.irinamoldovan.be a minute or two later.

## The Combell domain (done)

The domain is connected. For reference, this is how it was set up:

1. **Settings → Pages → Custom domain**: enter the domain and save.
2. In Combell's DNS settings for the domain, add:
   - four `A` records on the root (`irinamoldovan.be`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - a `CNAME` record for `www` pointing to `pixie-paw.github.io`
   - and remove any existing `A`/`AAAA` records on the root that point to Combell hosting.
3. In `astro.config.mjs`, set `site` to the domain and `base` to `'/'`, then push.
4. Once GitHub shows the DNS check as passing, tick **Enforce HTTPS**.
