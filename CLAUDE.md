# Irina Moldovan's portfolio

Personal portfolio for Irina Moldovan (Digital Design and Development, Howest). Astro 7 + GSAP, deployed to GitHub Pages from `main`. Live at https://www.irinamoldovan.be (DNS at Combell).

## Always use the project skills

The skills in `.claude/skills/` are this project's rules. Use them on every task here. They are kept out of git, because some come from third parties with no licence, so they live on Irina's Mac and in her claude.ai account. If they are missing, follow the summary below.

- **build-awwwards-quality-sites**: the overall art direction and motion system (GSAP + ScrollTrigger, one smooth-scroll library, a complete first frame, reduced motion).
- **animate**, **emil-design-eng**: decide whether and why something moves, the easing and the duration, before writing any animation.
- **animation-performance**: transform and opacity only, no `transition: all`, smooth on a mid-range phone.
- **build-design**: build each section from the Figma file and compare the result with it.
- **better-interface** and the better-* skills (ui, typography, layout, colors, accessibility, writing): review every section after building it.
- **mobile-native**: use it when we work on the responsive version.

Do not use `landing-page-design`. Its font rules conflict with this design.

## How we work

- **One section at a time.** Irina explains each section, and the work goes in its own PR. Irina reviews it and merges it herself.
- **Animations:** Irina describes the motion. Write it up as a short motion list, and wait for her yes before coding it.
- **Mobile and responsive:** design it together with Irina, section by section. Never invent a mobile layout on your own.
- **Layers:** every visual element (tags, stars, outlines, photo, camera) is its own element with a `data-layer` name, so it can be animated separately.
- **Tags:** the `{ tag }` stickers appear only when their section comes into view, never all at once on page load.
- **Copy:** use Irina's approved copy word for word. Don't write new copy without asking.

## Design source

- **Figma file:** `XkBDu8XvKNo8hmGnVPvtln`, home page frame `289:111` ("1.0 Home page", 1440px wide).
- **Scale:** `--u` in `src/styles/global.css` is one Figma pixel, so desktop layouts keep the exact proportions. Sizes are written as `calc(N * var(--u))`.
- **Layout:** use CSS grid with named areas for sections. Overlapping collage layers sit in the same grid area or are positioned inside it.
- **Background:** the grid paper and the texture overlay cover every page from top to bottom (`body::before` and `body::after`).

## Fonts

- **Boldonse and Bona Nova:** loaded through Fontsource.
- **Akzidenz-Grotesk Next:** Irina's Adobe Fonts web project, `https://use.typekit.net/uit2fga.css`.
- **Bulletin Typewriter:** licensed for education and non-commercial use only. Keep it to this personal portfolio. A fallback font is used until the font file is added.

## Commands

```sh
npm run dev      # http://localhost:4321/
npm run build    # always run before pushing
```

After a PR is merged: `git checkout main && git pull`.

## Things to keep in mind

- **Base path:** the site is served from the root of the domain (`base: '/'`). Still build links from `import.meta.env.BASE_URL`, as `Header.astro` does.
- **Images:** keep raw Figma exports out of the repo. Resize images into `src/assets/`.
