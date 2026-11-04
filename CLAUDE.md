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
- **Commit messages:** one plain sentence that says what changed. Add a short body when the reason isn't obvious.
- **PR descriptions are detailed and pertinent.** Every one has these parts:
  - **Why:** the goal or the problem, and what was wrong or missing before.
  - **What changed:** each change, the file it's in and the reason for it. Explain the decisions and trade-offs, not just the diff.
  - **What I checked:** the build, screenshots, the widths tested, the comparison with Figma.
  - **How to check:** the steps for Irina to see it herself.
  - **Decisions for you** and **Still open:** what Irina needs to choose, and what's left for later.

  Leave out anything that doesn't help Irina review the PR.
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
- **Check every section** against Figma at 1440px, then at 1920px and 2560px.
- **Layout:** each section is a CSS grid with named areas. Overlapping collage layers sit in the same grid area and are positioned inside it.
- **Layers:** every visual element (tags, stars, outlines, photo, camera) is its own element with a `data-layer` name, so it can be animated on its own.

## Background: grid paper and texture

- **Grid paper** (`body::before`): covers every page from top to bottom, behind everything.
- **Texture** (`body::after`): covers every page and every section from top to bottom, on top of everything (z-index 100, `mix-blend-mode: lighten`, no pointer events). In Figma the texture is only on the hero. That's a mistake in the Figma file, so don't copy it.
- **Never put a background colour on `body`**, because it paints over the grid paper. The paper colour sits on `html`.

## Animation code

- GSAP with ScrollTrigger and SplitText, set up in `src/scripts/animations.ts`.
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
