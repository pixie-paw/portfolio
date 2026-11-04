# Irina Moldovan's portfolio

Personal portfolio for Irina Moldovan (Digital Design and Development, Howest). Astro 7 + GSAP, deployed to GitHub Pages from `main`. Live at https://www.irinamoldovan.be (DNS at Combell, HTTPS enforced).

These are the project rules. Follow them on every task in this repo. When Irina gives a new rule or changes one, update this file in the same PR.

## How we work

- **One section at a time.** Irina explains each section before it's built. Build it from Figma, then do its animations, then move on to the next section.
- **Animations, element by element.** For every element in the section (every `data-layer`), ask Irina what animation she wants. Don't suggest directions or choose for her. Write her answers up as a short motion list, and code it only after her yes.
- **Desktop first.** Finish the desktop version of every section first. Mobile and responsive come after that, designed together with Irina section by section. Never invent a mobile layout.
- **Old mobile styles:** the `@media (max-width: 899px)` blocks in `Header.astro` and `Hero.astro` are a first try that Irina rejected. Don't build on them. Replace them once the mobile design is agreed.
- **Copy:** use Irina's approved copy word for word. Don't write new copy without asking.

## Git and GitHub

- **Branches:** always work on a `feature/...` branch made from the latest `main`, named after the work (`feature/hero-animations`, `feature/about-section`). Never commit to `main`. Cloud sessions start on an auto-named `claude/...` branch: don't use it, create the feature branch.
- **One topic per PR.** Irina reviews and merges every PR herself. Never merge a PR.
- **Before pushing:** `npm run build` must pass. There's no CI on PRs. The only workflow is the deploy on `main`.
- **No browser checks:** don't open the site in the browser pane or take screenshots of it, because that uses a lot of tokens. Build it, then Irina checks it in her own browser and reports back.
- **Commit messages:** one plain sentence that says what changed. Add a short body when the reason isn't obvious.
- **PR descriptions are detailed and pertinent.** Every one has these parts:
  - **Why:** the goal or the problem, and what was wrong or missing before.
  - **What changed:** each change, the file it's in and the reason for it. Explain the decisions and trade-offs, not just the diff.
  - **What I checked:** the build, and the values compared with Figma (colours, sizes, positions).
  - **How to check:** the steps for Irina to see it herself, with the widths to look at.
  - **Decisions for you** and **Still open:** what Irina needs to choose, and what's left for later.

  Leave out anything that doesn't help Irina review the PR.
- **After opening a PR:** give Irina three command blocks in chat:
  1. **Try it:** `git fetch`, `git checkout <branch>`, `npm install` (only if the dependencies changed), `npm run dev`.
  2. **Merge:** the link to the PR. Irina merges it on GitHub.
  3. **Pull:** `git checkout main`, `git pull`.
- **After a PR is merged:** `git checkout main && git pull`.

## Writing style

For PR descriptions, commit messages, docs and code comments:

- Plain words and short sentences.
- British spelling: licence, colour, centre.
- List items start with a bold label and a colon. Use tables for reference info.
- No emoji, no hype and no em dashes.

## Design source

- **Figma file:** `XkBDu8XvKNo8hmGnVPvtln`, home page frame `289:111` ("1.0 Home page", 1440px wide).
- **Scale:** `--u` in `src/styles/global.css` is one Figma pixel, so desktop layouts keep the exact proportions. Sizes are written as `calc(N * var(--u))`.
- **Wide screens:** above 1440px the design looks exactly as it does at 1440, centred. `--u` stops growing at 1440. Each section's content sits in the 1440 frame, with a `1fr` column on each side of its grid, as in `Hero.astro`. Only the parts that run edge to edge in Figma (bands, marquees, backgrounds) keep running edge to edge.
- **Check every section** against Figma at 1440px, then at 1920px and 2560px. Irina does this in her own browser. Claude compares the values in the code with Figma.
- **Layout:** each section is a CSS grid with named areas (`grid-template-areas`). Overlapping collage layers sit in the same grid area and are positioned inside it.
- **Placement by area, never by number:** place every element by its named area (`grid-area: title`). When an element has to overlap another area, use that area's lines (`grid-row: title-start / tag-end`). Never use column or row numbers like `grid-column: 2 / 3`, because they break as soon as a column or row is added.
- **Layers:** every visual element (tags, stars, outlines, photo, camera) is its own element with a `data-layer` name, so it can be animated on its own.

## Background: grid paper and texture

Both are one layer the size of the screen, fixed in place (`position: fixed` in `src/styles/global.css`). The page scrolls over the grid paper and under the texture, so they cover every page and every section from top to bottom, however long the page gets. Don't add them again per section.

- **Grid paper** (`body::before`): fixed behind everything, rotated -2.22deg, 100px bigger than the screen on every side so the rotation never shows its corners.
- **Texture** (`body::after`): fixed on top of everything (z-index 100, `mix-blend-mode: lighten`, no pointer events). In Figma the texture is only on the hero. That's a mistake in the Figma file, so don't copy it.
- **Use `position: fixed`, not `background-attachment: fixed`**, which iPhones ignore. Heights use `100lvh`, so no gap shows when the phone's toolbar slides away.
- **Never put a background colour on `body`**, because it paints over the grid paper. The paper colour sits on `html`.

## Code conventions

The same rules as Irina's earlier projects, so every file reads the same way.

| What | Rule | Example |
| --- | --- | --- |
| CSS class names | BEM: block, `__element`, `--modifier` | `.site-header__link`, `.tag--lg`, `.tag__corner--tl` |
| Variables and functions | camelCase | `initAnimations`, `titleChars` |
| Constants | UPPER_SNAKE_CASE | `MAX_TILT` |
| HTML elements selected in JS | `$` in front of the name | `const $title = document.querySelector('[data-layer="title"]');` |
| Functions | arrow functions assigned to `const` | `export const initAnimations = () => { ... };` |
| Formatting | 2 spaces, semicolons, single quotes | |

- **JS hooks:** select elements through `data-*` attributes (`data-layer`, `data-split`), never through their classes. Classes are for styling only.

## Official docs first

Write the code from the official documentation for the versions this project uses, not from memory or older tutorials. Check the version in `package.json` first, because APIs change between versions. Link the page you used in the PR, and in a code comment where it helps.

| Library | Version | Docs |
| --- | --- | --- |
| Astro | 7.4.5 | https://docs.astro.build/ |
| GSAP, ScrollTrigger, SplitText | 3.15.0 | https://gsap.com/docs/v3/ |
| Lenis (smooth scrolling, the only one) | 1.3.27 | https://github.com/darkroomengineering/lenis |

When a version in `package.json` goes up, update this table too.

## Animation code

- GSAP with ScrollTrigger and SplitText, set up in `src/scripts/animations.ts`.
- Lenis is the only smooth-scroll library. It drives ScrollTrigger and is off for reduced motion. Never add a second one.
- Animate transform and opacity only. Never use `transition: all`.
- Everything goes inside the `gsap.matchMedia` reduced motion check, so visitors who ask for less motion get the content without the movement.

## Fonts

- **Boldonse and Bona Nova:** loaded through Fontsource.
- **Akzidenz-Grotesk Next and Bulletin Typewriter MN:** from Irina's Adobe Fonts kit, `https://use.typekit.net/uit2fga.css`. Regular (400) and Medium (500) Akzidenz are under the family name `akzidenz-grotesk-next-pro`.
- **Bulletin Typewriter licence:** education and non-commercial use only. Keep it to this personal portfolio.

## Project skills

The skills live on Irina's Mac in `~/Documents/portfolio/.claude/skills/`. Some come from third parties with no licence, so `.claude/skills/` is in `.gitignore` and they never go to GitHub. A cloud session clones the repo from GitHub, so it only has them if Irina uploads them to her claude.ai account. When they're missing, follow this summary:

- **build-awwwards-quality-sites:** the overall art direction and motion system (GSAP + ScrollTrigger, one smooth-scroll library, a complete first frame, reduced motion).
- **animate**, **emil-design-eng:** the easing and the duration, once Irina has said what moves.
- **animation-performance:** transform and opacity only, no `transition: all`, smooth on a mid-range phone.
- **build-design:** build each section from the Figma file and compare the result with it.
- **better-interface** and the better-* skills (ui, typography, layout, colors, accessibility, writing): review every section after building it.
- **mobile-native:** for the responsive version, once desktop is finished.

Don't use `landing-page-design`. Its font rules conflict with this design.

## Commands

```sh
npm install
npm run dev      # http://localhost:4321/
npm run build    # always run before pushing
```

## Things to keep in mind

- **Node:** 22.23.4 or newer, locally and in `.github/workflows/deploy.yml`, which pins `22.23.4`. When Astro raises its minimum, raise the pin too. A failed deploy that says "Node.js ... is not supported" is the sign.
- **Base path:** the site is served from the root of the domain (`base: '/'`). Still build links from `import.meta.env.BASE_URL`, as `Header.astro` does.
- **Images:** keep raw Figma exports out of the repo. Resize images into `src/assets/`.
