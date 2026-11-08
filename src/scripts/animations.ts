import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

/**
 * Site animations, written from the official docs:
 * - GSAP matchMedia (reduced motion): https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
 * - GSAP timelines: https://gsap.com/docs/v3/GSAP/Timeline
 * - GSAP keyframes: https://gsap.com/resources/keyframes
 * - GSAP quickTo: https://gsap.com/docs/v3/GSAP/gsap.quickTo()
 * - SplitText: https://gsap.com/docs/v3/Plugins/SplitText/
 * - ScrambleText: https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin/
 * - ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
 * - Lenis with ScrollTrigger: https://github.com/darkroomengineering/lenis#gsap-scrolltrigger
 *
 * The idea: the hero is a print coming into register. Colour layers start out of
 * place and slide onto each other, and the tape and stickers are pressed down by hand.
 *
 * Elements are found through data-* attributes, never through classes.
 * Transform and opacity are used where they do the job, other properties where the effect needs them.
 *
 * Layers that are placed with the CSS `translate` / `rotate` properties are never
 * animated themselves: GSAP would fold those into its own transform and lose the
 * Figma position. It moves an inner layer instead (the tag body, the star SVG, the
 * plate paper, the camera image).
 */

// Header
const LOGO_TURN_S = 12;
const LOGO_HOVER_SCALE = 1.1;
const NAV_LABEL_REST_OPACITY = 0.684; // ink at this opacity on the paper = --c-ink-soft
const NAV_DURATION_S = 0.4;
const CTA_ROLL_Y = 140; // % of a letter's height: far enough to clear the window's padding
const CTA_DURATION_S = 0.4;
const CTA_STAGGER_S = 0.03;

// The flower that follows the cursor
const CURSOR_FLOWER_OFFSET_PX = 22; // it trails just below and to the right of the pointer
const CURSOR_FLOWER_LAG_S = 0.6;

// Hero load sequence
const BAND_S = 1.6; // the band and the plate wipe in at the pace of the text that lands on them
const PLATE_S = 1.4;
const TITLE_AT_S = 0.5; // the letters follow the plate's wipe from left to right
const TITLE_STAND_S = 0.9; // each title letter stands up from flat
const TITLE_STAGGER_S = 0.05;
const SUBTITLE_OPEN_AT_S = 0.9; // the subtitle's < > appear together, rest a moment, then open
const SUBTITLE_OPEN_S = 1.4;
const SUBTITLE_EASE = 'sine.inOut'; // starts and stops gently, like the tag is pulled open by hand
const SUBTITLE_TYPE_S = 0.045; // then the text is typed between them, letter by letter
const ABOUT_TITLE_AT_S = 2.6; // the About title peeking in below the hero is typed last, as a hint to scroll
const ABOUT_TITLE_TYPE_S = 0.045;
const INTERNSHIP_AT_S = 2.3;
const SIGN_DROP_S = 0.55; // the sign flips down from its top edge
const SIGN_DECODE_S = 1.2; // then its text decodes from random letters
const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz';

// Hero, once everything has arrived
const FLOAT_Y_PX = 4;
const FLOAT_TILT_DEG = 1;
const FLOAT_MIN_S = 3;
const FLOAT_MAX_S = 5;
const TAG_DEPTH_PX = 8; // the other layers set their depth with data-depth

// About section
const MARKER_S = 0.6; // each yellow highlighter bar is drawn in this long
const TYPE_CHAR_S = 0.025; // time between two typed letters on the skills paper
const TYPE_HEADING_CHAR_S = 0.06; // headings are typed a little slower
const TYPE_HEADING_PAUSE_S = 0.35; // and the typist pauses after each one
const PAPER_FEED_S = 0.28; // the paper moves up one line
const WAVE_DRAW_S = 2.2;
const WAVE_FLOW_PX_S = 40; // the wave text's normal speed along the curve
const WAVE_SCROLL_BOOST = 15; // extra px/s for each px/frame of scroll speed
const WAVE_SEPARATOR = '   ·   ';

// Work section
const WORK_CARD_TILT_DEG = -6.2; // the card's tilt in Figma, where it settles when the mouse stops
// The card sits up and to the right of the cursor, so the project name stays readable
const WORK_CARD_OFFSET = { x: 150, y: -30 };
const WORK_ARROW_NUDGE_PX = 4;
// The card is shown smaller than in Figma and see-through, so the rows stay in view
const WORK_CARD_SCALE = 0.7;
const WORK_CARD_OPACITY = 0.75;
const WORK_CARD_FOLLOW = 9; // how quickly the card catches up with the cursor (higher = snappier)
const WORK_CARD_LEAN = 0.012; // degrees of extra tilt per px/s of sideways speed
const WORK_CARD_MAX_LEAN_DEG = 9;
const WORK_CARD_DEPTH = 0.006; // px the image moves against the card per px/s of speed
const WORK_CARD_MAX_DEPTH_PX = 8;
const WORK_CARD_SWITCH_S = 0.6; // the reel rolls and the card changes shape in this long

// Film strip
const FILM_ENTER_S = 1.2; // the strip slides in from the right
const FILM_FLOW_PX_S = 40; // then the images inside scroll right to left at this pace
const FILM_FLOW_DIRECTION = -1; // -1 = right to left, 1 = left to right

// "Let's work together" marquee
const MARQUEE_FLOW_PX_S = 50; // its normal speed, right to left
const MARQUEE_SCROLL_BOOST = 12; // extra px/s for each px/frame of scroll speed, up or down
const MARQUEE_LINE_DRAW_S = 1.6;

// Footer
const FOOTER_ARROW_NUDGE_EVERY_S = 3; // the arrows nudge towards "CV" this often
const FOOTER_ARROW_NUDGE_PX = 6;

// About me page, section 1
const INTRO_TITLE_AT_S = 0.3; // the title's letters stand up one after another, like HI, I'M IRINA.
const INTRO_FLOWER_AT_S = 1; // the first stem starts growing
const INTRO_FLOWER_GAP_S = 0.5; // and the next ones follow this far apart
const INTRO_STEM_S = 2.2; // a slow, calm grow
const INTRO_HAT_DROP_AT_S = 1.4;
const INTRO_FLOAT_PX = 7; // the open flowers float up and down this much
const INTRO_PHONE_STRETCH = 0.06; // the phone bobs as its cord stretches this much
const INTRO_PHONE_SWAY_DEG = 3;
const COLLAGE_DRIFT_SCALE = 0.35; // the collage's scroll drift, as a share of the directions below
const HAT_NUDGE_EVERY_S = 5; // until someone tips the hat, it tips a little by itself this often

// About me page, section 2
const HOW_STEM_AFTER_S = 0.3; // the stem starts growing this long after section 1's text is in
const HOW_STEM_S = 3.2; // longer than section 1's stems, so it grows as slowly

// Project pages, hero
const PROJECT_BAND_AT_S = 0.2; // the band starts wiping in
const PROJECT_BAND_S = 0.8;
const PROJECT_MOCKUP_S = 1.4; // the laptop and phone slide in from the right edge
const PROJECT_MOCKUP_DRIFT_PX = 90; // as you scroll past the hero, they lag this far behind the page

// Project pages, story
const STORY_OPEN_S = 0.9; // a chapter's or a part's text slides open (its words fade in as it opens)
const STORY_CLOSE_S = 0.7; // and folds back up (its words fade out first)

// Project pages, facts
const FACTS_TYPE_S = 0.04; // each letter of a fact's value is typed this long after the one before

// About me page, section 3
const GOING_BRANCH_S = 1.2; // the short branch down to the blue flower
const GOING_BUBBLE_GROW = 0.12; // the bubble gum grows this much bigger, and never smaller than in Figma
const GOING_BUBBLE_S = 1.8; // one grow (and the same again to shrink back)

// If someone scrolls while the hero is still loading, the rest of the load plays this much faster
const INTRO_HURRY_SPEED = 4;

// Don't keep the page hidden for long if a web font is slow
const FONT_WAIT_MS = 1500;

type Cleanup = () => void;

/*
  The About section's animations wait for this: it resolves once the About title has been
  typed at the end of the hero load (or straight away when there's no load sequence).
  So the yellow bars, the card, the wave line and the paper never play before their title.
*/
let markAboutTitleTyped: () => void = () => {};
const aboutTitleTyped = new Promise<void>((resolve) => {
  markAboutTitleTyped = resolve;
});

/*
  On the About me page: resolves once section 1's card text is in. Section 2's stem waits for it,
  then grows down from that card to lead the eye down the page.
*/
let markIntroTextShown: () => void = () => {};
const introTextShown = new Promise<void>((resolve) => {
  markIntroTextShown = resolve;
});

/*
  On a project page the sections come in in order: the hero, then the facts, then the story.
  projectHeroShown resolves once the hero is in, projectFactsShown once the facts are in.
*/
let markProjectHeroShown: () => void = () => {};
const projectHeroShown = new Promise<void>((resolve) => {
  markProjectHeroShown = resolve;
});
let markProjectFactsShown: () => void = () => {};
const projectFactsShown = new Promise<void>((resolve) => {
  markProjectFactsShown = resolve;
});

/*
  Scrolling while a project page is still coming in: everything still arrives in order, just
  faster, like the home page's hero. Each load animation is registered here; once the page has
  scrolled, the ones still playing (and the ones that start later) run INTRO_HURRY_SPEED times faster.
*/
const projectIntros: gsap.core.Animation[] = [];
let isProjectHurried = false;
const trackProjectIntro = <T extends gsap.core.Animation>(animation: T): T => {
  if (isProjectHurried) animation.timeScale(INTRO_HURRY_SPEED);
  else projectIntros.push(animation);
  return animation;
};
const hurryProjectIntros = () => {
  if (isProjectHurried) return;
  isProjectHurried = true;
  projectIntros
    .filter((animation) => animation.progress() < 1)
    .forEach((animation) => gsap.to(animation, { timeScale: INTRO_HURRY_SPEED, duration: 0.3, ease: 'power1.in' }));
};

// The same for section 2's card text: section 3's long stem waits for it
let markHowTextShown: () => void = () => {};
const howTextShown = new Promise<void>((resolve) => {
  markHowTextShown = resolve;
});

const getLayer = <T extends Element = HTMLElement>(name: string, $root: ParentNode = document) =>
  $root.querySelector<T>(`[data-layer="${name}"]`);

const getLayers = <T extends Element = HTMLElement>(names: string[]) =>
  names.map((name) => getLayer<T>(name)).filter(($el): $el is T => $el !== null);

const getAll = <T extends Element = HTMLElement>(selector: string, $root: ParentNode = document) =>
  Array.from($root.querySelectorAll<T>(selector));

const waitForFonts = () =>
  Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS))]);

/** Runs enter/leave on mouse hover and on keyboard focus. Returns a function that removes the listeners. */
const onHover = ($el: HTMLElement, enter: () => void, leave: () => void): Cleanup => {
  const events: [string, () => void][] = [
    ['mouseenter', enter],
    ['mouseleave', leave],
    ['focus', enter],
    ['blur', leave],
  ];
  events.forEach(([type, handler]) => $el.addEventListener(type, handler));
  return () => events.forEach(([type, handler]) => $el.removeEventListener(type, handler));
};

/* ---------- 1. Flower logo: always spinning, grows a bit on hover ---------- */
const createLogo = (): Cleanup | undefined => {
  const $logo = getLayer('logo');
  const $flower = $logo && getLayer<SVGElement>('logo-flower', $logo);
  if (!$logo || !$flower) return;

  gsap.to($flower, { rotation: 360, duration: LOGO_TURN_S, ease: 'none', repeat: -1 });

  return onHover(
    $logo,
    () => gsap.to($flower, { scale: LOGO_HOVER_SCALE, duration: 0.3, ease: 'power2.out' }),
    () => gsap.to($flower, { scale: 1, duration: 0.3, ease: 'power2.out' }),
  );
};

/* ---------- Project pages: the back arrow grows a bit on hover, like the flower logo ---------- */
const createBackArrow = (): Cleanup | undefined => {
  const $back = getLayer('back');
  const $arrow = $back && getLayer<SVGElement>('back-arrow', $back);
  if (!$back || !$arrow) return;

  return onHover(
    $back,
    () => gsap.to($arrow, { scale: LOGO_HOVER_SCALE, duration: 0.3, ease: 'power2.out' }),
    () => gsap.to($arrow, { scale: 1, duration: 0.3, ease: 'power2.out' }),
  );
};

/* ---------- Footer: the big CV grows a bit on hover, like the flower logo, to show it's a link ---------- */
const createCvHover = (): Cleanup | undefined => {
  const $cv = getLayer('footer-cv');
  // Only once the PDF is there: then DOWNLOAD CV is a link (see Footer.astro)
  if (!($cv instanceof HTMLAnchorElement)) return;
  // The letters and their yellow bar grow together, so the bar stays behind them
  const $grow = [getLayer('footer-cv-letters', $cv), getLayer('footer-cv-marker', $cv)].filter(
    ($el): $el is HTMLElement => $el !== null,
  );

  return onHover(
    $cv,
    () => gsap.to($grow, { scale: LOGO_HOVER_SCALE, duration: 0.3, ease: 'power2.out' }),
    () => gsap.to($grow, { scale: 1, duration: 0.3, ease: 'power2.out' }),
  );
};

/* ---------- The yellow flower follows the cursor across the whole site (mouse only, no spin) ---------- */
const createCursorFlower = (): Cleanup | undefined => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const $flower = getLayer('cursor-flower');
  if (!$flower) return;

  // Centred on its point (the flower has no CSS translate, so GSAP can own its transform)
  gsap.set($flower, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 1 });

  const moveX = gsap.quickTo($flower, 'x', { duration: CURSOR_FLOWER_LAG_S, ease: 'power3.out' });
  const moveY = gsap.quickTo($flower, 'y', { duration: CURSOR_FLOWER_LAG_S, ease: 'power3.out' });
  let isShown = false;

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const x = event.clientX + CURSOR_FLOWER_OFFSET_PX;
    const y = event.clientY + CURSOR_FLOWER_OFFSET_PX;
    if (!isShown) {
      // First move (or back in the window): start right at the cursor, then pop in
      isShown = true;
      gsap.set($flower, { x, y });
      gsap.to($flower, { scale: 1, duration: 0.4, ease: 'back.out(2)', overwrite: 'auto' });
    }
    moveX(x);
    moveY(y);
  };

  const hide = () => {
    isShown = false;
    gsap.to($flower, { scale: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto' });
  };

  window.addEventListener('pointermove', onMove);
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);

  return () => {
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', hide);
    window.removeEventListener('blur', hide);
  };
};

/* ---------- 2, 3, 4. Nav links: dark text, underline in and out from left to right ---------- */
const createNavLinks = (reduceMotion: boolean): Cleanup[] => {
  const duration = reduceMotion ? 0 : NAV_DURATION_S;

  return getAll('[data-nav-link]').map(($link) => {
    const $label = getLayer('nav-label', $link);
    const $line = getLayer<SVGElement>('nav-underline', $link);
    // The active link already looks hovered, so hover changes nothing on it
    const isActive = () => $link.hasAttribute('aria-current');

    return onHover(
      $link,
      () => {
        if (isActive()) return;
        gsap.to($label, { opacity: 1, duration, ease: 'power2.out', overwrite: true });
        gsap.set($line, { transformOrigin: 'left center' });
        gsap.to($line, { scaleX: 1, duration, ease: 'power3.out', overwrite: true });
      },
      () => {
        if (isActive()) return;
        gsap.to($label, { opacity: NAV_LABEL_REST_OPACITY, duration, ease: 'power2.out', overwrite: true });
        // The left end goes first, so the line also leaves towards the right
        gsap.set($line, { transformOrigin: 'right center' });
        gsap.to($line, { scaleX: 0, duration, ease: 'power3.inOut', overwrite: true });
      },
    );
  });
};

/*
  ---------- Letter roll ----------
  Two copies of a text sit in a window. On hover each letter of the top copy rolls up
  and out while the same letter of the second copy rolls in from below, one after another.
  Used by the green buttons and the project names. `extra` rolls along as one more "letter".
*/
const createLetterRoll = (
  $text: HTMLElement,
  $textHover: HTMLElement,
  reduceMotion: boolean,
  extra?: [Element, Element],
) => {
  const textSplit = SplitText.create($text, { type: 'chars' });
  const hoverSplit = SplitText.create($textHover, { type: 'chars', aria: 'none' });
  const $tops = [...textSplit.chars, ...(extra ? [extra[0]] : [])];
  const $bottoms = [...hoverSplit.chars, ...(extra ? [extra[1]] : [])];

  gsap.set($bottoms, { yPercent: CTA_ROLL_Y });
  gsap.set([$textHover, ...(extra ? [extra[1]] : [])], { visibility: 'visible' });

  const roll = (topY: number, bottomY: number) => {
    const settings = {
      duration: reduceMotion ? 0 : CTA_DURATION_S,
      stagger: reduceMotion ? 0 : CTA_STAGGER_S,
      ease: 'power2.inOut',
      overwrite: true,
    };
    gsap.to($tops, { yPercent: topY, ...settings });
    gsap.to($bottoms, { yPercent: bottomY, ...settings });
  };

  return { enter: () => roll(-CTA_ROLL_Y, 0), leave: () => roll(0, CTA_ROLL_Y) };
};

/* ---------- 5. Green buttons (Get in touch, About me): letters and arrow roll up into the light copy ---------- */
const createRollButton = ($button: HTMLElement, reduceMotion: boolean): Cleanup | undefined => {
  const $text = getLayer('button-text', $button);
  const $textHover = getLayer('button-text-hover', $button);
  const $arrow = getLayer<SVGElement>('button-arrow', $button);
  const $arrowHover = getLayer<SVGElement>('button-arrow-hover', $button);
  if (!$text || !$textHover || !$arrow || !$arrowHover) return;

  // The arrow rolls as the last "letter"
  const roll = createLetterRoll($text, $textHover, reduceMotion, [$arrow, $arrowHover]);
  return onHover($button, roll.enter, roll.leave);
};

/* ---------- Smooth scrolling (Lenis) and the hero drifting apart on scroll ---------- */
let smoothScroll: Lenis | null = null;

const createSmoothScroll = (): Cleanup => {
  const lenis = new Lenis({ anchors: true });
  smoothScroll = lenis;
  const tick = (time: number) => lenis.raf(time * 1000);

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
    smoothScroll = null;
  };
};

const createScrollDrift = () => {
  const $hero = document.querySelector('[data-section="hero"]');
  if (!$hero) return;

  // Each part moves up by its data-drift (px) while the hero scrolls away, so they separate
  getAll('[data-drift]').forEach(($part) => {
    gsap.to($part, {
      y: Number($part.dataset.drift),
      ease: 'none',
      scrollTrigger: { trigger: $hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  });
};

/* ---------- Mouse depth: layers move against the cursor, the nearer ones more ---------- */
const createDepth = ($tags: HTMLElement[]): Cleanup | undefined => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const settings = { duration: 0.8, ease: 'power3.out' };
  const movers = getAll('[data-depth]').map(($layer) => {
    const depth = Number($layer.dataset.depth);
    const moveX = gsap.quickTo($layer, 'x', settings);
    const moveY = gsap.quickTo($layer, 'y', settings);
    return (nx: number, ny: number) => {
      moveX(-nx * depth);
      moveY(-ny * depth);
    };
  });

  // Tags already float on y, so their depth goes through xPercent / yPercent instead
  $tags.forEach(($tag) => {
    const moveX = gsap.quickTo($tag, 'xPercent', settings);
    const moveY = gsap.quickTo($tag, 'yPercent', settings);
    movers.push((nx, ny) => {
      moveX(((-nx * TAG_DEPTH_PX) / $tag.offsetWidth) * 100);
      moveY(((-ny * TAG_DEPTH_PX) / $tag.offsetHeight) * 100);
    });
  });

  const moveAll = (nx: number, ny: number) => movers.forEach((move) => move(nx, ny));
  // -1 at the left / top edge of the window, 1 at the right / bottom edge
  const onMove = (event: PointerEvent) =>
    moveAll((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
  const onLeave = () => moveAll(0, 0);

  window.addEventListener('pointermove', onMove);
  document.documentElement.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);

  return () => {
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('blur', onLeave);
  };
};

/* ---------- Hero tags: a slow float once they've arrived ---------- */
const startFloat = ($tag: Element) => {
  gsap.to($tag, {
    y: -FLOAT_Y_PX,
    rotation: gsap.utils.random([-1, 1]) * FLOAT_TILT_DEG,
    duration: gsap.utils.random(FLOAT_MIN_S, FLOAT_MAX_S),
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });
};

/* ---------- Internship tag: a sign hanging from a nail, it swings on hover ---------- */

// Side to side from its top centre, each swing smaller than the last
const SIGN_SWING_DEG = [0, 7, -4.5, 2.5, -1, 0];
const SIGN_HOVER_SWING_DEG = [0, 5, -3, 1.5, 0];

const createInternshipSwing = ($body: HTMLElement): Cleanup => {
  const swing = gsap.timeline({ paused: true }).to($body, {
    keyframes: { rotation: SIGN_HOVER_SWING_DEG, easeEach: 'sine.inOut' },
    duration: 1.2,
  });

  const play = () => swing.restart();
  $body.addEventListener('mouseenter', play);
  return () => $body.removeEventListener('mouseenter', play);
};

/* ---------- About: the wave text flows along the curve forever ---------- */
const startWaveFlow = ($section: Element, waveLayer = 'wave'): Cleanup | undefined => {
  const $wave = getLayer<SVGSVGElement>(waveLayer, $section);
  const $text = getLayer<SVGTextElement>('wave-text', $section);
  const $textPath = getLayer<SVGTextPathElement>('wave-text-path', $section);
  const curveId = $textPath?.getAttribute('href') ?? '';
  const $curve = curveId ? $section.querySelector<SVGPathElement>(curveId) : null;
  if (!$wave || !$text || !$textPath || !$curve) return;

  const originalText = $textPath.textContent ?? '';
  const originalOffset = $textPath.getAttribute('startOffset') ?? '0';

  // Measure one round of the words, then repeat it until it covers the whole curve plus
  // one more round, so moving it by one round at a time never shows a gap
  const phrase = originalText + WAVE_SEPARATOR;
  $textPath.textContent = phrase;
  $textPath.setAttribute('startOffset', '0');
  const round = $text.getComputedTextLength();
  if (!round) {
    $textPath.textContent = originalText;
    $textPath.setAttribute('startOffset', originalOffset);
    return;
  }
  $textPath.textContent = phrase.repeat(Math.ceil($curve.getTotalLength() / round) + 2);

  let offset = -round;
  let speed = WAVE_FLOW_PX_S;

  const tick = (_time: number, deltaMs: number) => {
    // Scrolling down speeds it up, scrolling up turns it right to left, then it eases back
    const scrollSpeed = smoothScroll?.velocity ?? 0;
    const target = WAVE_FLOW_PX_S + scrollSpeed * WAVE_SCROLL_BOOST;
    speed += (target - speed) * 0.08;
    offset += (speed * deltaMs) / 1000;
    if (offset > 0) offset -= round;
    if (offset < -round) offset += round;
    $textPath.setAttribute('startOffset', offset.toFixed(2));
  };

  // Only runs while the wave is on screen
  const trigger = ScrollTrigger.create({
    trigger: $wave,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
  });

  return () => {
    gsap.ticker.remove(tick);
    trigger.kill();
    $textPath.textContent = originalText;
    $textPath.setAttribute('startOffset', originalOffset);
  };
};

/* ---------- About section ---------- */
const createAboutAnimations = (context: gsap.Context, addCleanup: (cleanup?: Cleanup) => void) => {
  const $about = document.querySelector('[data-section="about"]');
  if (!$about) return;

  const getSvgs = (names: string[]) =>
    getLayers(names)
      .map(($layer) => $layer.querySelector<SVGElement>('svg'))
      .filter(($svg): $svg is SVGElement => $svg !== null);

  // Title: the text itself is left alone here. On the first scroll the yellow bars are drawn
  // in from left to right like a highlighter, and the stars pop in.
  const $markers = getAll('[data-layer="title-marker"]', $about);
  const starNames = ['about-sparkle-big', 'about-sparkle-small', 'about-star-low', 'about-star-high'];
  const $stars = getSvgs(starNames);
  const $starOutlines = getSvgs(starNames.map((name) => `${name}-outline`));

  gsap.set($markers, { clipPath: 'inset(0% 100% 0% 0%)' });
  gsap.set($stars, { scale: 0, autoAlpha: 0 });
  gsap.set($starOutlines, { x: (i: number) => (i % 2 ? 6 : -6), y: (i: number) => (i % 2 ? -6 : 6), autoAlpha: 0 });

  const firstScroll = gsap
    .timeline({ paused: true })
    .to($markers, { clipPath: 'inset(0% 0% 0% 0%)', duration: MARKER_S, ease: 'power2.inOut', stagger: MARKER_S * 0.9 })
    .to($stars, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.1 }, 0.2)
    .to($starOutlines, { x: 0, y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.1 }, 0.3);

  // start: 1 = as soon as the page has scrolled 1px
  ScrollTrigger.create({ start: 1, once: true, onEnter: () => aboutTitleTyped.then(() => firstScroll.play()) });

  // Text card: the white card wipes in from left to right (like the hero's plate), the corners
  // clamp in, the text appears line by line, then the About me button pops in like a sticker
  const $card = getLayer('about-card', $about);
  const $cardText = getLayer('about-text', $about);
  const $corners = getAll('[data-layer="about-corner"]', $about);
  const $aboutButton = getLayer('about-button', $about);
  // A little wider than the card, so the corners aren't cut while they clamp in from outside
  const CARD_SHOWN = 'inset(-5% -5% -5% -5%)';
  if ($card && $cardText) {
    gsap.set($card, { clipPath: 'inset(-5% 105% -5% -5%)' });
    gsap.set($cardText, { autoAlpha: 0 });
    gsap.set($corners, { x: (i: number) => (i % 2 ? 8 : -8), y: (i: number) => (i < 2 ? -8 : 8), autoAlpha: 0 });
    if ($aboutButton) gsap.set($aboutButton, { scale: 0.8, autoAlpha: 0 });

    ScrollTrigger.create({
      trigger: $card,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        aboutTitleTyped.then(() =>
          context.add(() => {
          // Split into lines only now, once the fonts are in, so the lines are right
          const lines = SplitText.create($cardText, { type: 'lines' }).lines;
          gsap.set($cardText, { autoAlpha: 1 });
          const card = gsap
            .timeline()
            .to($card, { clipPath: CARD_SHOWN, duration: 0.8, ease: 'power3.inOut', clearProps: 'clipPath' })
            .to($corners, { x: 0, y: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.05 }, '-=0.1')
            .fromTo(
              lines,
              { y: 12, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 },
              '<0.2',
            );
          if ($aboutButton) {
            card.to($aboutButton, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' }, '-=0.2');
          }
          }),
        ),
    });
  }

  // Wave line: draws itself in from left to right, once
  const $wave = getLayer('wave', $about);
  const $waveLine = getLayer<SVGPathElement>('wave-line', $about);
  if ($wave && $waveLine) {
    const length = $waveLine.getTotalLength();
    gsap.set($waveLine, { strokeDasharray: length, strokeDashoffset: length });
    const draw = gsap.to($waveLine, { strokeDashoffset: 0, duration: WAVE_DRAW_S, ease: 'power2.inOut', paused: true });
    ScrollTrigger.create({
      trigger: $wave,
      start: 'top 75%',
      once: true,
      onEnter: () => aboutTitleTyped.then(() => draw.play()),
    });
  }

  // Skills paper: typed letter by letter while it feeds up out of the typewriter
  const $paper = getLayer('skills-paper', $about);
  const $sheet = getLayer('skills-sheet', $about);
  const $typewriter = getLayer('typewriter', $about);
  if ($paper && $sheet && $typewriter) {
    const $rows = getAll('[data-layer="skills-heading"], [data-layer="skills-line"]', $sheet);
    const rowChars = $rows.map(($row) => SplitText.create($row, { type: 'chars', charsClass: 'about__char' }).chars);
    const $marks = getAll('[data-layer="skills-mark"]', $sheet);

    // Each row is typed at the same spot, just above the roller, where the last row ends up.
    // So while row k is typed, the paper sits lower by the distance from row k to the last row.
    const lastTop = $rows[$rows.length - 1]?.offsetTop ?? 0;
    const paperY = $rows.map(($row) => lastTop - $row.offsetTop);

    gsap.set(rowChars.flat(), { autoAlpha: 0 });
    gsap.set($marks, { '--mark-w': '0%' });
    gsap.set($paper, { y: paperY[0] ?? 0 });
    // The typewriter is set down on the desk first. Until it has landed, the paper is hidden too.
    gsap.set($typewriter, { y: 40, autoAlpha: 0 });
    gsap.set($paper, { autoAlpha: 0 });

    const typing = gsap.timeline({ paused: true });
    $rows.forEach(($row, k) => {
      const isHeading = $row.dataset.layer === 'skills-heading';
      if (isHeading) {
        const $mark = getLayer('skills-mark', $row);
        if ($mark) typing.to($mark, { '--mark-w': '100%', duration: 0.3, ease: 'power2.out' });
      }
      typing.to(rowChars[k], {
        autoAlpha: 1,
        duration: 0.01,
        ease: 'none',
        stagger: isHeading ? TYPE_HEADING_CHAR_S : TYPE_CHAR_S,
      });
      if (isHeading) typing.to({}, { duration: TYPE_HEADING_PAUSE_S });

      // End of the line: a small knock of the machine, and the paper moves up one row
      if (k < $rows.length - 1) {
        typing
          .to($typewriter, { y: 1, duration: 0.05, ease: 'power1.out', yoyo: true, repeat: 1 })
          .to($paper, { y: paperY[k + 1], duration: PAPER_FEED_S, ease: 'power2.inOut' }, '<');
      }
    });

    ScrollTrigger.create({
      trigger: $typewriter,
      start: 'top 80%',
      once: true,
      onEnter: () =>
        aboutTitleTyped.then(() =>
          context.add(() => {
            gsap
              .timeline()
              .to($typewriter, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.4)' })
              .set($paper, { autoAlpha: 1 })
              .add(() => typing.play());
          }),
        ),
    });
  }

  // The wave text needs Inter loaded before it can be measured
  waitForFonts().then(() => context.add(() => addCleanup(startWaveFlow($about))));
};

/*
  A colour variable from global.css as rgb(), for GSAP to tween. The colours are written in
  OKLCH, which GSAP can't blend, so the browser draws one pixel in that colour and we read it back.
*/
const colorVar = (name: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!ctx) return value;
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
};

/* ---------- Work section: project rows (name roll, kind underline, arrow) ---------- */
const createWorkRows = ($work: Element, preview?: WorkPreview): Cleanup[] => {
  const blue = colorVar('--c-blue');
  const ink = colorVar('--c-ink');

  return getAll('[data-layer="work-row"]', $work).map(($row, index) => {
    const $text = getLayer('work-name-text', $row);
    const $textHover = getLayer('work-name-hover', $row);
    const $kindLine = getLayer('work-kind-line', $row);
    const $arrow = getLayer<SVGElement>('work-arrow', $row);
    if (!$text || !$textHover || !$kindLine || !$arrow) return () => {};

    const roll = createLetterRoll($text, $textHover, false);

    const enter = () => {
      preview?.show(index, $row);
      roll.enter();
      gsap.set($kindLine, { transformOrigin: 'left center' });
      gsap.to($kindLine, { scaleX: 1, duration: NAV_DURATION_S, ease: 'power3.out', overwrite: true });
      gsap.to($arrow, {
        x: WORK_ARROW_NUDGE_PX,
        y: -WORK_ARROW_NUDGE_PX,
        color: blue,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
      });
    };

    const leave = () => {
      roll.leave();
      // The left end goes first, so the line also leaves towards the right
      gsap.set($kindLine, { transformOrigin: 'right center' });
      gsap.to($kindLine, { scaleX: 0, duration: NAV_DURATION_S, ease: 'power3.inOut', overwrite: true });
      gsap.to($arrow, { x: 0, y: 0, color: ink, duration: 0.3, ease: 'power2.out', overwrite: true });
    };

    // Keyboard: focusing a row shows the card next to it; leaving the row hides it
    const focus = () => {
      // Aim at the row first, so the card opens right there
      preview?.focusRow($row);
      enter();
    };
    const blur = () => {
      leave();
      preview?.hide();
    };

    const events: [string, EventListener][] = [
      ['mouseenter', enter],
      ['mouseleave', leave],
      ['focus', focus],
      ['blur', blur],
    ];
    events.forEach(([type, handler]) => $row.addEventListener(type, handler));
    return () => events.forEach(([type, handler]) => $row.removeEventListener(type, handler));
  });
};

/*
  ---------- Work section: one shared preview card for the whole list ----------
  It appears when the mouse enters the list and stays until it leaves the list, so moving
  between rows never hides it. Hovering a row rolls the reel inside it to that project's image
  (from below going down, from above going up) and changes its shape to that project's card.
  It follows the cursor like a piece of paper: it catches up smoothly, leans with sideways
  speed and settles back to its Figma tilt, and the image moves a little against it.
*/
interface WorkPreview {
  show: (index: number, $row: HTMLElement) => void;
  focusRow: ($row: HTMLElement) => void;
  hide: () => void;
  cleanup: Cleanup;
}

interface WorkCard {
  w: number;
  h: number;
  iw: number;
  ih: number;
  ix: number;
}

const createWorkPreview = ($work: HTMLElement): WorkPreview | undefined => {
  const $list = $work.querySelector<HTMLElement>('ul');
  const $preview = getLayer('work-preview', $work);
  const $card = $preview && getLayer('work-preview-card', $preview);
  const $reel = $preview && getLayer('work-preview-reel', $preview);
  const $images = $preview ? getAll('[data-layer="work-preview-image"]', $preview) : [];
  if (!$list || !$preview || !$card || !$reel || !$images.length) return;

  const cards: WorkCard[] = $images.map(($image) => JSON.parse($image.dataset.card ?? '{}'));

  // Start state: hidden, closed from the centre, a bit smaller
  gsap.set($preview, {
    xPercent: -50,
    yPercent: -50,
    rotation: WORK_CARD_TILT_DEG,
    scale: WORK_CARD_SCALE * 0.85,
    autoAlpha: 0,
    clipPath: 'inset(50% 50% 50% 50%)',
  });

  let active = -1;
  let isShown = false;
  // Where the card is (px, inside the section) and where it's heading
  const position = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let pointer: { x: number; y: number } | null = null;
  let lean = 0;
  let depth = 0;

  // The point next to the cursor, inside the section (the page may scroll while hovering)
  const aimAtPointer = () => {
    if (!pointer) return;
    const box = $work.getBoundingClientRect();
    target.x = pointer.x - box.left + WORK_CARD_OFFSET.x;
    target.y = pointer.y - box.top + WORK_CARD_OFFSET.y;
  };

  const tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, 50) / 1000;
    aimAtPointer();
    const previousX = position.x;
    // Frame-rate independent easing: the same feel at 60 and 120 frames per second
    const ease = 1 - Math.exp(-WORK_CARD_FOLLOW * dt);
    position.x += (target.x - position.x) * ease;
    position.y += (target.y - position.y) * ease;

    const speedX = dt > 0 ? (position.x - previousX) / dt : 0;
    const leanTarget = gsap.utils.clamp(-WORK_CARD_MAX_LEAN_DEG, WORK_CARD_MAX_LEAN_DEG, speedX * WORK_CARD_LEAN);
    const depthTarget = gsap.utils.clamp(-WORK_CARD_MAX_DEPTH_PX, WORK_CARD_MAX_DEPTH_PX, -speedX * WORK_CARD_DEPTH);
    lean += (leanTarget - lean) * 0.12;
    depth += (depthTarget - depth) * 0.12;

    gsap.set($preview, { x: position.x, y: position.y, rotation: WORK_CARD_TILT_DEG + lean });
    gsap.set($reel, { x: depth });
  };

  // Rolls the reel to a project and changes the card to that project's shape
  const switchTo = (index: number, instant: boolean) => {
    if (index === active) return;
    active = index;
    const card = cards[index];
    const settings = instant ? { duration: 0 } : { duration: WORK_CARD_SWITCH_S, ease: 'power3.inOut' };
    gsap.to($card, { '--cw': card.w, '--ch': card.h, '--iw': card.iw, '--ih': card.ih, '--ix': card.ix, ...settings, overwrite: true });
    gsap.to($reel, { y: -$images[index].offsetTop, ...settings, overwrite: 'auto' });
  };

  const open = () => {
    if (isShown) return;
    isShown = true;
    // Start right where it should be, so it doesn't fly in from the corner
    position.x = target.x;
    position.y = target.y;
    gsap.ticker.add(tick);
    gsap.to($preview, {
      clipPath: 'inset(0% 0% 0% 0%)',
      scale: WORK_CARD_SCALE,
      autoAlpha: WORK_CARD_OPACITY,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const hide = () => {
    if (!isShown) return;
    isShown = false;
    pointer = null;
    gsap.to($preview, {
      clipPath: 'inset(50% 50% 50% 50%)',
      scale: WORK_CARD_SCALE * 0.85,
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        if (!isShown) {
          gsap.ticker.remove(tick);
          active = -1;
        }
      },
    });
  };

  const show = (index: number, _$row: HTMLElement) => {
    switchTo(index, !isShown);
    open();
  };

  // Keyboard focus: the card goes to the row's Figma spot (634px in, 179px down)
  const focusRow = ($row: HTMLElement) => {
    pointer = null;
    const box = $work.getBoundingClientRect();
    const row = $row.getBoundingClientRect();
    const u = Math.min(window.innerWidth, 1440) / 1440;
    target.x = row.left - box.left + 634 * u;
    target.y = row.top - box.top + 179 * u;
    if (!isShown) {
      position.x = target.x;
      position.y = target.y;
    }
  };

  const onMove = (event: MouseEvent) => {
    pointer = { x: event.clientX, y: event.clientY };
    if (!isShown) aimAtPointer();
  };
  const onEnterList = (event: MouseEvent) => onMove(event);
  const onLeaveList = () => hide();

  // The reel's place depends on the image sizes, so it's set again when the page resizes
  const onResize = () => {
    if (active >= 0) gsap.set($reel, { y: -$images[active].offsetTop });
  };

  $list.addEventListener('mouseenter', onEnterList);
  $list.addEventListener('mousemove', onMove);
  $list.addEventListener('mouseleave', onLeaveList);
  window.addEventListener('resize', onResize);

  return {
    show,
    focusRow,
    hide,
    cleanup: () => {
      gsap.ticker.remove(tick);
      $list.removeEventListener('mouseenter', onEnterList);
      $list.removeEventListener('mousemove', onMove);
      $list.removeEventListener('mouseleave', onLeaveList);
      window.removeEventListener('resize', onResize);
    },
  };
};

/* ---------- Work section: the title bar, the sticker and the rows come in on scroll ---------- */
const createWorkEntrance = (context: gsap.Context, $work: Element) => {
  // Title: the yellow bar is drawn in from left to right, like the About highlighter
  const $marker = getLayer('work-marker', $work);
  const $click = getLayer('tag-click', $work);
  const $clickBody = $click && getLayer('tag-body', $click);
  if ($marker) {
    gsap.set($marker, { clipPath: 'inset(0% 100% 0% 0%)' });
    if ($clickBody) gsap.set($clickBody, { scale: 0.4, autoAlpha: 0 });

    ScrollTrigger.create({
      trigger: $marker,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        context.add(() => {
          const title = gsap.timeline();
          title.to($marker, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power2.inOut' });
          // The sticker grows in like the camera tags, then floats like the hero tags
          if ($clickBody) {
            title.to(
              $clickBody,
              {
                scale: 1,
                autoAlpha: 1,
                duration: 0.8,
                ease: 'back.out(1.7)',
                onComplete: () => context.add(() => startFloat($clickBody)),
              },
              0.5,
            );
          }
        }),
    });
  }

  // Rows: each line is drawn in from left to right, then its row rises in, one row after another
  const $list = $work.querySelector('ul');
  const $items = getAll('[data-layer="work-item"]', $work);
  if (!$list || !$items.length) return;

  const rows = $items.map(($item) => ({
    $line: getLayer('work-line', $item),
    $parts: [getLayer('work-name', $item), getLayer('work-tags', $item), getLayer('work-kind', $item)].filter(
      ($part): $part is HTMLElement => $part !== null,
    ),
  }));
  rows.forEach(({ $line, $parts }) => {
    if ($line) gsap.set($line, { scaleX: 0 });
    gsap.set($parts, { y: 20, autoAlpha: 0 });
  });

  ScrollTrigger.create({
    trigger: $list,
    start: 'top 80%',
    once: true,
    onEnter: () =>
      context.add(() => {
        const list = gsap.timeline();
        rows.forEach(({ $line, $parts }, i) => {
          if ($line) list.to($line, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, i * 0.15);
          list.to($parts, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.06 }, i * 0.15 + 0.1);
        });
      }),
  });
};

const createWorkAnimations = (context: gsap.Context): Cleanup[] => {
  const $work = document.querySelector<HTMLElement>('[data-section="work"]');
  if (!$work) return [];
  createWorkEntrance(context, $work);
  const preview = createWorkPreview($work);
  return [...createWorkRows($work, preview), ...(preview ? [preview.cleanup] : [])];
};

/* ---------- Film strip: slides in from the right, then its images scroll endlessly ---------- */
const createFilmStrip = (context: gsap.Context) => {
  const $film = document.querySelector('[data-section="film"]');
  const $strip = $film && getLayer('film-strip', $film);
  const $track = $film && getLayer('film-track', $film);
  const $rounds = $film ? getAll('[data-layer="film-round"]', $film) : [];
  if (!$film || !$strip || !$track || $rounds.length < 2) return;

  // The strip starts just past the right edge of the screen (the section clips it sideways)
  gsap.set($strip, { xPercent: 100 });

  // The frames are lazy, so they don't slow the first load. The strip slides in from off the
  // screen, where the browser wouldn't load them yet, so they're asked for a screen before it arrives.
  ScrollTrigger.create({
    trigger: $film,
    start: 'top bottom+=100%',
    once: true,
    onEnter: () => getAll<HTMLImageElement>('[data-layer="film-frame"]', $film).forEach(($frame) => ($frame.loading = 'eager')),
  });

  // One round of the six frames, as a share of the whole track. Everything scales with the
  // page, so this share stays the same at any width, and the loop never shows a gap.
  const roundPx = $rounds[1].offsetLeft - $rounds[0].offsetLeft;
  const roundShare = (roundPx / $track.offsetWidth) * 100;
  // Right to left runs from 0 to -1 round; left to right from -1 round back to 0
  const flow = gsap.fromTo(
    $track,
    { xPercent: FILM_FLOW_DIRECTION < 0 ? 0 : -roundShare },
    {
      xPercent: FILM_FLOW_DIRECTION < 0 ? -roundShare : 0,
      duration: roundPx / FILM_FLOW_PX_S,
      ease: 'none',
      repeat: -1,
      paused: true,
    },
  );

  let hasArrived = false;
  let isOnScreen = false;
  const updateFlow = () => (hasArrived && isOnScreen ? flow.play() : flow.pause());

  // Only runs while the strip is on screen
  ScrollTrigger.create({
    trigger: $film,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      isOnScreen = self.isActive;
      updateFlow();
    },
  });

  ScrollTrigger.create({
    trigger: $film,
    start: 'top 85%',
    once: true,
    onEnter: () =>
      context.add(() => {
        gsap.to($strip, {
          xPercent: 0,
          duration: FILM_ENTER_S,
          ease: 'power3.out',
          onComplete: () => {
            hasArrived = true;
            updateFlow();
          },
        });
      }),
  });
};

/*
  The double blue line draws itself in from left to right. The marquee and the project pages'
  facts both use this, so their lines always move the same way.
*/
const drawDoubleLine = ($lines: SVGPathElement[]) =>
  gsap.to($lines, { strokeDashoffset: 0, duration: MARQUEE_LINE_DRAW_S, ease: 'power2.inOut', stagger: 0.1 });

/* ---------- "Let's work together": words rise, stars pop, the lines draw, then it flows ---------- */
const createMarquee = (context: gsap.Context, addCleanup: (cleanup?: Cleanup) => void) => {
  const $marquee = document.querySelector('[data-section="marquee"]');
  const $track = $marquee && getLayer('marquee-track', $marquee);
  if (!$marquee || !$track) return;

  const $rounds = getAll('[data-layer="marquee-round"]', $marquee);
  const $texts = getAll('[data-layer="marquee-text"]', $marquee);
  const $pinks = getAll('[data-layer="marquee-star-pink"]', $marquee);
  const $outlines = getAll('[data-layer="marquee-star-outline"]', $marquee);
  const $lines = getAll<SVGPathElement>('[data-layer="marquee-line"]', $marquee);
  if ($rounds.length < 2) return;

  // Start states: words just below their line, stars at nothing, lines not drawn yet
  gsap.set($texts, { yPercent: 60, autoAlpha: 0 });
  gsap.set($pinks, { scale: 0, rotation: -90, autoAlpha: 0 });
  gsap.set($outlines, { x: -6, y: 6, autoAlpha: 0 });
  $lines.forEach(($line) => {
    const length = $line.getTotalLength();
    gsap.set($line, { strokeDasharray: length, strokeDashoffset: length });
  });

  // The flow: one round at a time, measured as a share of the track so the loop never shows a gap
  let roundPx = 0;
  let roundShare = 0;
  const measure = () => {
    roundPx = $rounds[1].offsetLeft - $rounds[0].offsetLeft;
    roundShare = (roundPx / $track.offsetWidth) * 100;
  };
  let progress = 0; // 0 to 1 through one round
  let speed = MARQUEE_FLOW_PX_S;
  const tick = (_time: number, deltaMs: number) => {
    if (!roundPx) return;
    // Scrolling either way speeds it up for a moment; it always flows right to left
    const scrollSpeed = Math.abs(smoothScroll?.velocity ?? 0);
    const target = MARQUEE_FLOW_PX_S + scrollSpeed * MARQUEE_SCROLL_BOOST;
    speed += (target - speed) * 0.08;
    progress = (progress + (speed * deltaMs) / 1000 / roundPx) % 1;
    gsap.set($track, { xPercent: -progress * roundShare });
  };

  let hasArrived = false;
  let isOnScreen = false;
  const updateFlow = () => (hasArrived && isOnScreen ? gsap.ticker.add(tick) : gsap.ticker.remove(tick));
  addCleanup(() => gsap.ticker.remove(tick));

  // Only flows while it's on screen, and measures again whenever the layout changes
  ScrollTrigger.create({
    trigger: $marquee,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      isOnScreen = self.isActive;
      updateFlow();
    },
    onRefresh: measure,
  });

  ScrollTrigger.create({
    trigger: $marquee,
    start: 'top 80%',
    once: true,
    onEnter: () =>
      // The text is Boldonse: measure the rounds once the font is in
      waitForFonts().then(() =>
        context.add(() => {
          measure();
          gsap
            .timeline({
              onComplete: () => {
                hasArrived = true;
                updateFlow();
              },
            })
            // Each "Let's work together" rises into its line, one after another from left to right
            .to($texts, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, 0)
            // The stars pop in with a quarter turn, the outline locks on just after
            .to($pinks, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.12 }, 0.3)
            .to($outlines, { x: 0, y: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out', stagger: 0.12 }, 0.4)
            // The double line draws itself in from left to right
            .add(drawDoubleLine($lines), 0);
        }),
      ),
  });
};

/* ---------- Footer: stickers, DOWNLOAD CV with its arrows, the buttons and the pink band ---------- */
const createFooter = (context: gsap.Context) => {
  const $footer = document.querySelector('[data-section="footer"]');
  if (!$footer) return;

  // Stickers grow in where they are, like the camera tags, then float
  getAll('[data-layer="footer-sticker"]', $footer).forEach(($sticker) => {
    const $body = getLayer('tag-body', $sticker);
    if (!$body) return;
    gsap.set($body, { scale: 0.4, autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: $sticker,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        context.add(() => {
          gsap.to($body, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
            onComplete: () => context.add(() => startFloat($body)),
          });
        }),
    });
  });

  // DOWNLOAD CV, the arrows and the buttons come in together, one after another
  const $cv = getLayer('footer-cv', $footer);
  const $download = getLayer('footer-cv-download', $footer);
  const $letters = getLayer('footer-cv-letters', $footer);
  const $marker = getLayer('footer-cv-marker', $footer);
  const $arrows = getAll<SVGElement>('[data-layer="footer-arrow-svg"]', $footer);
  const $buttons = getAll('[data-roll-button]', getLayer('footer-links', $footer) ?? $footer);
  if ($cv && $download && $letters && $marker) {
    gsap.set($download, { y: 20, autoAlpha: 0 });
    gsap.set($letters, { autoAlpha: 0 });
    gsap.set($marker, { clipPath: 'inset(0% 100% 0% 0%)' });
    // Each arrow starts further out along its own direction. The right ones are mirrored,
    // so the same values move them out to the right. The top ones point down, the bottom ones up.
    const isTop = (i: number) => i < 2;
    gsap.set($arrows, { x: -40, y: (i: number) => (isTop(i) ? -20 : 20), autoAlpha: 0 });
    gsap.set($buttons, { y: 20, autoAlpha: 0 });

    ScrollTrigger.create({
      trigger: $cv,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        waitForFonts().then(() =>
          context.add(() => {
            const letters = SplitText.create($letters, { type: 'chars' }).chars;
            gsap.set($letters, { autoAlpha: 1 });
            gsap
              .timeline({
                // Then every few seconds the arrows nudge towards "CV" together, to draw the eye
                onComplete: () =>
                  context.add(() => {
                    gsap.to($arrows, {
                      x: FOOTER_ARROW_NUDGE_PX,
                      y: (i: number) => (isTop(i) ? FOOTER_ARROW_NUDGE_PX / 2 : -FOOTER_ARROW_NUDGE_PX / 2),
                      duration: 0.25,
                      ease: 'power2.out',
                      yoyo: true,
                      repeat: -1,
                      repeatDelay: FOOTER_ARROW_NUDGE_EVERY_S,
                    });
                  }),
              })
              // "DOWNLOAD" rises into place
              .to($download, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' })
              // "CV" stands up from flat, like the hero title
              .fromTo(
                letters,
                { rotationX: -100, autoAlpha: 0, transformOrigin: '50% 100%', transformPerspective: 500 },
                { rotationX: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.08 },
                0.2,
              )
              // and the yellow bar is drawn in behind it like a highlighter
              .to($marker, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power2.inOut' }, 0.5)
              // The arrows shoot in and stop with a small overshoot, pointing at "CV"
              .to($arrows, { x: 0, y: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.08 }, 0.9)
              // The buttons rise in one after another
              .to($buttons, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1 }, 1.2);
          }),
        ),
    });
  }

  // Pink band: its three texts fade up
  const $bandTexts = getAll('[data-layer="footer-name"], [data-layer="footer-by"], [data-layer="footer-rights"]', $footer);
  const $band = getLayer('footer-band', $footer);
  if ($band && $bandTexts.length) {
    gsap.set($bandTexts, { y: 12, autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: $band,
      start: 'top 95%',
      once: true,
      onEnter: () =>
        context.add(() => {
          gsap.to($bandTexts, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 });
        }),
    });
  }
};

/*
  ---------- About me page, section 1: "A few more things about this human" ----------
  It reuses the home page's motion: the photo is pressed down while the yellow fill and the
  outlines slide into register, the title's letters stand up like "HI, I'M IRINA." and its yellow
  bars are drawn right after, and the card wipes in once the title is up. On top: Kiki runs in from off the left edge, the stems grow
  slowly out from behind the photo and their flowers open and float, and the hat drops onto
  Irina's head and stays there. The phone always bobs on its cord. Hovering the hat tips it, like saying howdy.
*/
const createAboutIntro = (context: gsap.Context, addCleanup: (cleanup?: Cleanup) => void) => {
  const $intro = document.querySelector('[data-section="about-intro"]');
  if (!$intro) return;

  const $phone = getLayer('intro-phone', $intro);
  const $archFill = getLayer('intro-arch-fill', $intro);
  const $archBack = getLayer('intro-arch-back', $intro);
  const $archFront = getLayer('intro-arch-front', $intro);
  const $photo = getLayer('intro-photo', $intro);
  const $kiki = getLayer('intro-kiki', $intro);
  const $hat = getLayer('intro-hat', $intro);
  const $flowers = getAll('[data-grow]', $intro);
  const $title = getLayer('intro-title', $intro);
  const $markers = getAll('[data-layer="intro-marker"]', $intro);
  const $stars = getAll('[data-layer="intro-star"]', $intro)
    .map(($star) => $star.querySelector<SVGElement>('svg'))
    .filter(($svg): $svg is SVGElement => $svg !== null);
  const $card = getLayer('intro-card', $intro);
  const $cardText = getLayer('intro-text', $intro);
  const $cvButton = getLayer('intro-cv', $intro);
  const $corners = getAll('[data-layer="intro-corner"]', $intro);

  // The phone hangs from the top of its cord: it bobs as the cord stretches, and sways
  if ($phone) {
    gsap.set($phone, { transformOrigin: '50% 0%' });
    gsap.to($phone, { scaleY: 1 + INTRO_PHONE_STRETCH, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.fromTo(
      $phone,
      { rotation: -INTRO_PHONE_SWAY_DEG },
      { rotation: INTRO_PHONE_SWAY_DEG, duration: 2.3, ease: 'sine.inOut', yoyo: true, repeat: -1 },
    );
  }

  // ---------- Start states, set before the page appears ----------
  // The photo and its arch, like the home page photo: fill and outlines start out of place
  if ($photo) gsap.set($photo, { scale: 1.06, rotation: 3, autoAlpha: 0 });
  if ($archFill) gsap.set($archFill, { x: -20, y: 14, autoAlpha: 0 });
  if ($archFront) gsap.set($archFront, { x: 18, y: -12, autoAlpha: 0 });
  if ($archBack) gsap.set($archBack, { x: -16, y: 18, autoAlpha: 0 });
  // Kiki starts just past the left edge of the screen, wherever the page is
  if ($kiki) gsap.set($kiki, { x: -($kiki.getBoundingClientRect().right + 40), rotation: -12, transformOrigin: '50% 100%' });
  if ($hat) gsap.set($hat, { y: -360, rotation: -20, autoAlpha: 0, transformOrigin: '50% 100%' });

  // Each stem is drawn from the end at the photo; data-grow says which end that is
  const flowers = $flowers.map(($flower) => {
    const $stem = $flower.querySelector<SVGPathElement>('[data-layer="flower-stem"]');
    const $head = $flower.querySelector<SVGGElement>('[data-layer="flower-head"]');
    const length = $stem?.getTotalLength() ?? 0;
    const fromEnd = $flower.dataset.grow === 'end';
    if ($stem) gsap.set($stem, { strokeDasharray: length, strokeDashoffset: fromEnd ? -length : length });
    if ($head) gsap.set($head, { scale: 0, transformOrigin: '50% 50%' });
    return { $flower, $stem, $head };
  });

  // Hidden until its letters are split, so it never flashes in full before the typing
  if ($title) gsap.set($title, { autoAlpha: 0 });
  gsap.set($markers, { clipPath: 'inset(0% 100% 0% 0%)' });
  gsap.set($stars, { scale: 0, rotation: -90, autoAlpha: 0 });
  if ($cardText) gsap.set($cardText, { autoAlpha: 0 });
  if ($cvButton) gsap.set($cvButton, { y: 12, autoAlpha: 0 });
  if ($card) gsap.set($card, { clipPath: 'inset(-5% 105% -5% -5%)' });
  gsap.set($corners, { x: (i: number) => (i % 2 ? 8 : -8), y: (i: number) => (i < 2 ? -8 : 8), autoAlpha: 0 });

  // The title is typed first; the bars and the card wait for it, like on the home page
  let markTitleTyped: () => void = () => {};
  const titleTyped = new Promise<void>((resolve) => {
    markTitleTyped = resolve;
  });

  // ---------- Scroll and mouse: the collage pieces drift apart, each its own way ----------
  /*
    Like the home hero: as you scroll past section 1 the collage pieces drift apart, each in its
    own direction (dx / dy, scaled by COLLAGE_DRIFT_SCALE, px at the end of the section), and they shift against the mouse,
    the nearer ones more (depth, px at the edge of the window).
    Both go through xPercent / yPercent, worked out from each piece's size every frame, so they add
    to the pieces' own x / y motion (Kiki's run, the hat's drop and howdy, the flowers' float)
    instead of fighting it.
  */
  const COLLAGE: { name: string; dx: number; dy: number; depth: number }[] = [
    { name: 'intro-photo', dx: 0, dy: -40, depth: 4 },
    { name: 'intro-arch-fill', dx: -30, dy: -60, depth: 3 },
    { name: 'intro-arch-back', dx: -60, dy: -20, depth: 2 },
    { name: 'intro-arch-front', dx: 40, dy: -80, depth: 6 },
    { name: 'intro-flower-red-top', dx: -50, dy: -110, depth: 10 },
    { name: 'intro-flower-red-low', dx: -80, dy: -30, depth: 8 },
    // The blue flowers' stems are short, so they move almost exactly with the photo (at most 6px
    // apart), and their roots stay hidden under it
    { name: 'intro-flower-blue-left', dx: -6, dy: -40, depth: 4 },
    { name: 'intro-flower-blue-right', dx: 6, dy: -40, depth: 4 },
    { name: 'intro-kiki', dx: 80, dy: 10, depth: 7 },
    { name: 'intro-hat', dx: 30, dy: -130, depth: 12 },
  ];
  const pieces = COLLAGE.map((piece) => ({ ...piece, $el: getLayer(piece.name, $intro), w: 1, h: 1 })).filter(
    (piece): piece is (typeof piece) & { $el: HTMLElement } => piece.$el !== null,
  );
  // Sizes are read once, and again when the layout changes, not every frame
  const measure = () =>
    pieces.forEach((piece) => {
      piece.w = piece.$el.offsetWidth || 1;
      piece.h = piece.$el.offsetHeight || 1;
    });
  measure();

  let scrolled = 0; // 0 to 1 through section 1
  ScrollTrigger.create({
    trigger: $intro,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      scrolled = self.progress;
    },
    onRefresh: measure,
  });

  // The mouse, from -1 (left / top edge) to 1, eased so the pieces follow it softly
  const mouse = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  const followsMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const onMouseMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  if (followsMouse) {
    window.addEventListener('pointermove', onMouseMove);
    addCleanup(() => window.removeEventListener('pointermove', onMouseMove));
  }

  const moveCollage = () => {
    eased.x += (mouse.x - eased.x) * 0.06;
    eased.y += (mouse.y - eased.y) * 0.06;
    pieces.forEach(({ $el, dx, dy, depth, w, h }) => {
      const x = dx * COLLAGE_DRIFT_SCALE * scrolled - eased.x * depth;
      const y = dy * COLLAGE_DRIFT_SCALE * scrolled - eased.y * depth;
      gsap.set($el, { xPercent: (x / w) * 100, yPercent: (y / h) * 100 });
    });
  };
  // Only while section 1 is on screen
  ScrollTrigger.create({
    trigger: $intro,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? gsap.ticker.add(moveCollage) : gsap.ticker.remove(moveCollage)),
  });
  addCleanup(() => gsap.ticker.remove(moveCollage));

  // ---------- Hover: the hat tips up like saying howdy, then drops back on ----------
  const tipHat = () => {
    if (!$hat || gsap.isTweening($hat)) return;
    gsap
      .timeline()
      .to($hat, { y: -28, rotation: -14, duration: 0.28, ease: 'power2.out' })
      .to($hat, { y: 0, rotation: 0, duration: 0.5, ease: 'bounce.out' }, '+=0.2');
  };

  // ---------- Card: wipes in when it's on screen, once the title is typed ----------
  if ($card && $cardText) {
    ScrollTrigger.create({
      trigger: $card,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        titleTyped.then(() =>
          context.add(() => {
            const lines = SplitText.create($cardText, { type: 'lines' }).lines;
            gsap.set($cardText, { autoAlpha: 1 });
            gsap
              .timeline({ onComplete: () => markIntroTextShown() })
              .to($card, { clipPath: 'inset(-5% -5% -5% -5%)', duration: 0.8, ease: 'power3.inOut', clearProps: 'clipPath' })
              .to($corners, { x: 0, y: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.05 }, '-=0.1')
              .fromTo(
                lines,
                { y: 12, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 },
                '<0.2',
              )
              // The CV button rises in after the text, like the lines
              .to($cvButton ?? [], { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3');
          }),
        ),
    });
  }

  // ---------- The load sequence (the title needs the fonts in first) ----------
  waitForFonts().then(() =>
    context.add(() => {
      // Words too, so the title still breaks between words, never inside one
      const titleChars = $title ? SplitText.create($title, { type: 'words,chars' }).chars : [];
      gsap.set(titleChars, { autoAlpha: 0 });
      if ($title) gsap.set($title, { autoAlpha: 1 });
      // When the last letter has stood up
      const titleDoneAt = INTRO_TITLE_AT_S + Math.max(titleChars.length - 1, 0) * TITLE_STAGGER_S + TITLE_STAND_S;

      const load = gsap.timeline({
        onComplete: () => {
          context.add(() => {
            // The open flowers float up and down, each at its own pace
            flowers.forEach(({ $flower }) => {
              gsap.to($flower, {
                y: -INTRO_FLOAT_PX,
                duration: gsap.utils.random(2.2, 3.2),
                delay: gsap.utils.random(0, 0.8),
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
              });
            });
          });
          if ($hat) {
            // Until someone tips the hat, it tips a little by itself every few seconds, to show
            // it can be played with
            let isFound = false;
            const nudge = gsap.delayedCall(HAT_NUDGE_EVERY_S, function repeatNudge() {
              if (isFound) return;
              if (!gsap.isTweening($hat)) {
                gsap
                  .timeline()
                  .to($hat, { y: -8, rotation: -5, duration: 0.22, ease: 'power2.out' })
                  .to($hat, { y: 0, rotation: 0, duration: 0.45, ease: 'bounce.out' });
              }
              nudge.restart(true);
            });
            // Hover, a tap, a click, or Enter / Space with the keyboard all tip it
            const tip = () => {
              isFound = true;
              nudge.kill();
              tipHat();
            };
            const onKey = (event: KeyboardEvent) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              tip();
            };
            const events: [string, EventListener][] = [
              ['mouseenter', tip],
              ['click', tip],
              ['keydown', onKey as EventListener],
            ];
            events.forEach(([type, handler]) => $hat.addEventListener(type, handler));
            addCleanup(() => {
              nudge.kill();
              events.forEach(([type, handler]) => $hat.removeEventListener(type, handler));
            });
          }
        },
      });

      load
        // 0.3s: each letter stands up from lying flat, like "HI, I'M IRINA." on the home page
        .fromTo(
          titleChars,
          { rotationX: -100, autoAlpha: 0, transformOrigin: '50% 100%', transformPerspective: 500 },
          { rotationX: 0, autoAlpha: 1, duration: TITLE_STAND_S, ease: 'back.out(1.7)', stagger: TITLE_STAGGER_S },
          INTRO_TITLE_AT_S,
        )
        .call(() => markTitleTyped(), [], titleDoneAt)
        // Once the letters are up, the yellow bars are drawn in from left to right behind the title
        .to(
          $markers,
          { clipPath: 'inset(0% 0% 0% 0%)', duration: MARKER_S, ease: 'power2.inOut', stagger: MARKER_S * 0.9 },
          titleDoneAt,
        )
        // 0.4s: the photo is pressed down, its fill and outlines slide into register behind it
        .to($photo ?? [], { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.4)' }, 0.4)
        .to($archFill ?? [], { x: 0, y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out' }, 0.45)
        .to($archFront ?? [], { x: 0, y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out' }, 0.5)
        .to($archBack ?? [], { x: 0, y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out' }, 0.55)
        // 0.8s: Kiki runs in from off the left edge, squashes as she stops and springs back, like the hat
        .to($kiki ?? [], { x: 0, rotation: 0, duration: 0.6, ease: 'power3.in' }, 0.8)
        .to($kiki ?? [], { scaleX: 0.86, scaleY: 1.1, duration: 0.1, ease: 'power2.out' }, 1.4)
        .to($kiki ?? [], { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 1.5)
        // 1.4s: the stars pop
        .to($stars, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.12 }, 1.4);

      // The stems grow slowly out from behind the photo, one after another, and each flower opens
      flowers.forEach(({ $stem, $head }, i) => {
        const at = INTRO_FLOWER_AT_S + i * INTRO_FLOWER_GAP_S;
        if ($stem) load.to($stem, { strokeDashoffset: 0, duration: INTRO_STEM_S, ease: 'sine.inOut' }, at);
        if ($head) load.to($head, { scale: 1, duration: 0.9, ease: 'back.out(1.6)' }, at + INTRO_STEM_S * 0.85);
      });

      // The hat drops onto Irina's head and stays put once it lands (only the hover moves it)
      if ($hat) {
        load.to($hat, { y: 0, rotation: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.in' }, INTRO_HAT_DROP_AT_S);
      }
    }),
  );
};

/*
  ---------- About me page, section 2: "How it started" ----------
  Once section 1's text is in, the stem grows down from that card on its own, to lead the eye
  down the page, and its flower opens once the stem reaches it. It stays when you scroll back up.
  The title is typed and the card wipes in, like the home page. The camera tilts as if it takes
  the picture, then the photo and the strip grow out from their middle. The words flow along the wave like on
  the home page. The camera, its photo and the strip move inside wrappers that keep their tilt.
*/
const createAboutHowItStarted = (context: gsap.Context, addCleanup: (cleanup?: Cleanup) => void) => {
  const $section = document.querySelector('[data-section="how-started"]');
  if (!$section) return;

  // The stem and the flower are two copies of one SVG: the stem under the cards, the flower above
  const $flower = getLayer('how-started-flower', $section);
  const $bloom = getLayer('how-started-bloom', $section);
  const $stem = $flower?.querySelector<SVGPathElement>('[data-layer="flower-stem"]') ?? null;
  const $head = $bloom?.querySelector<SVGGElement>('[data-layer="flower-head"]') ?? null;
  const $title = getLayer('how-started-title', $section);
  const $card = getLayer('how-started-card', $section);
  const $cardText = getLayer('how-started-text', $section);
  const $corners = getAll('[data-layer="how-started-corner"]', $section);
  const $camera = getLayer('how-started-camera', $section);
  const $photo = getLayer('how-started-photo', $section);
  const $strip = getLayer('how-started-strip', $section);

  // ---------- After section 1's text, the stem grows down on its own; then its flower opens ----------
  if ($flower && $stem) {
    const length = $stem.getTotalLength();
    const fromEnd = $flower.dataset.grow === 'end';
    gsap.set($stem, { strokeDasharray: length, strokeDashoffset: fromEnd ? -length : length });
    if ($head) gsap.set($head, { scale: 0, transformOrigin: '50% 50%' });

    // The stem and its flower float together, once the flower is open
    const float = gsap.to([$flower, $bloom].filter(Boolean), {
      y: -INTRO_FLOAT_PX,
      duration: 2.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      paused: true,
    });

    // Once section 1's text is in, the stem grows down on its own, then its flower opens and
    // floats. It doesn't wait for the scroll, so it shows the way down the page. Once grown, it stays.
    introTextShown.then(() =>
      context.add(() => {
        gsap
          .timeline({ delay: HOW_STEM_AFTER_S, onComplete: () => float.play() })
          .to($stem, { strokeDashoffset: 0, duration: HOW_STEM_S, ease: 'sine.inOut' })
          .to($head ?? [], { scale: 1, duration: 0.9, ease: 'back.out(1.6)' }, HOW_STEM_S * 0.9);
      }),
    );
  }

  // ---------- Title, typed like the home page's About title, then the card ----------
  if ($cardText) gsap.set($cardText, { autoAlpha: 0 });
  if ($card) gsap.set($card, { clipPath: 'inset(-5% 105% -5% -5%)' });
  gsap.set($corners, { x: (i: number) => (i % 2 ? 8 : -8), y: (i: number) => (i < 2 ? -8 : 8), autoAlpha: 0 });
  if ($title) gsap.set($title, { autoAlpha: 0 });

  if ($title) {
    ScrollTrigger.create({
      trigger: $title,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        waitForFonts().then(() =>
          context.add(() => {
            const chars = SplitText.create($title, { type: 'words,chars' }).chars;
            gsap.set(chars, { autoAlpha: 0 });
            gsap.set($title, { autoAlpha: 1 });
            const typed = gsap.timeline({ onComplete: () => markHowTextShown() });
            typed.to(chars, { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: ABOUT_TITLE_TYPE_S });
            // The camera comes in with the title, so it never shows before it (even after a reload
            // further down the page, when every trigger above fires at once)
            if ($camera) playCamera();

            // Once the title is typed, the card wipes in, its corners clamp, and the lines appear
            if ($card && $cardText) {
              const lines = SplitText.create($cardText, { type: 'lines' }).lines;
              gsap.set($cardText, { autoAlpha: 1 });
              gsap.set(lines, { y: 12, autoAlpha: 0 });
              typed
                .to($card, { clipPath: 'inset(-5% -5% -5% -5%)', duration: 0.8, ease: 'power3.inOut', clearProps: 'clipPath' })
                .to($corners, { x: 0, y: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.05 }, '-=0.1')
                .to(lines, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, '<0.2');
            }
          }),
        ),
    });
  }

  // ---------- Camera: it tilts as it takes the picture, then the pictures grow from their middle ----------
  // It starts with the title and the card, when the section scrolls in (the camera itself is
  // high enough to be on screen at load). The camera rises in, the photo and the strip then open
  // from a line across their middle, out to the top and the bottom.
  const $pictures = [$photo, $strip].filter(($el): $el is HTMLElement => $el !== null);
  if ($camera) gsap.set($camera, { autoAlpha: 0, y: 16, transformOrigin: '50% 100%' });
  // It plays when the title starts typing (see the title above)
  gsap.set($pictures, { clipPath: 'inset(50% 0% 50% 0%)', autoAlpha: 1 });

  const playCamera = () => {
    gsap
      .timeline()
      .to($camera, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      // a quick tilt and back, like pressing the shutter
      .to($camera, {
        keyframes: [
          { rotation: -5, duration: 0.25, ease: 'power2.out' },
          { rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' },
        ],
      })
      .to(
        $pictures,
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.9,
          ease: 'power3.inOut',
          stagger: 0.2,
          clearProps: 'clipPath',
        },
        0.9, // just after the tilt starts
      );
  };

  // ---------- The words flow along the wave, like on the home page ----------
  waitForFonts().then(() => context.add(() => addCleanup(startWaveFlow($section, 'how-started-wave'))));
};

/*
  ---------- About me page, section 3: "How it's going" ----------
  The same style as the first two sections. Once section 2's text is in, the long stem grows down
  from under its card into this card, the red flower opens, then the short branch grows to the
  blue flower. The title is typed and the card wipes in. The statue is pressed down like
  section 1's photo, its eyes are pressed on, and the bubble gum pops and keeps growing and
  shrinking (never smaller than in Figma, so the real gum stays covered). The disco ball's circle
  and outlines slide into place like section 1's arch, and the statue's stems grow out of it.
*/
const createAboutHowItsGoing = (context: gsap.Context) => {
  const $section = document.querySelector('[data-section="how-going"]');
  if (!$section) return;

  const $longStem = getLayer('going-stem-long', $section);
  const $branch = getLayer('going-stem-branch', $section);
  const $flowerRed = getLayer('going-flower-red', $section);
  const $flowerBlue = getLayer('going-flower-blue', $section);
  const $statueFlowers = [getLayer('going-statue-flower-red', $section), getLayer('going-statue-flower-blue', $section)].filter(
    ($el): $el is HTMLElement => $el !== null,
  );
  const $title = getLayer('going-title', $section);
  const $card = getLayer('going-card', $section);
  const $cardText = getLayer('going-text', $section);
  const $corners = getAll('[data-layer="going-corner"]', $section);
  const $statue = getLayer('going-statue', $section);
  const $eyes = [getLayer('going-eye-left', $section), getLayer('going-eye-right', $section)].filter(
    ($el): $el is HTMLElement => $el !== null,
  );
  const $bubble = getLayer('going-bubble', $section);
  const $bubbleOutlines = getAll('[data-layer="going-bubble-outline"]', $section);
  const $discoFill = getLayer('going-disco-fill', $section);
  const $discoOutlines = getAll('[data-layer="going-disco-outline"]', $section);
  const $discoBall = getLayer('going-disco-ball', $section);

  // A stem starts hidden, drawn from the end data-grow names; its flower starts closed
  const prepStem = ($wrap: HTMLElement | null) => {
    const $stem = $wrap?.querySelector<SVGPathElement>('[data-layer="flower-stem"]') ?? null;
    if ($wrap && $stem) {
      const length = $stem.getTotalLength();
      gsap.set($stem, { strokeDasharray: length, strokeDashoffset: $wrap.dataset.grow === 'end' ? -length : length });
    }
    return $stem;
  };
  const prepHead = ($wrap: HTMLElement | null) => {
    const $head = $wrap?.querySelector<SVGGElement>('[data-layer="flower-head"]') ?? null;
    if ($head) gsap.set($head, { scale: 0, transformOrigin: '50% 50%' });
    return $head;
  };
  const openHead = { scale: 1, duration: 0.9, ease: 'back.out(1.6)' };

  // ---------- The long stem, its red flower, the branch and the blue flower ----------
  const $longPath = prepStem($longStem);
  const $branchPath = prepStem($branch);
  const $redHead = prepHead($flowerRed);
  const $blueHead = prepHead($flowerBlue);

  if ($longPath) {
    // They float together once open, so the flowers never leave their stems
    const cardFlowers = [$longStem, $branch, $flowerRed, $flowerBlue].filter(Boolean);
    const float = gsap.to(cardFlowers, { y: -INTRO_FLOAT_PX, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });

    howTextShown.then(() => context.add(() => {
      const grow = gsap.timeline({ delay: HOW_STEM_AFTER_S, onComplete: () => float.play() });
      grow.to($longPath, { strokeDashoffset: 0, duration: HOW_STEM_S, ease: 'sine.inOut' });
      if ($redHead) grow.to($redHead, openHead, HOW_STEM_S * 0.9);
      // The branch leaves the long stem just before it reaches the card
      if ($branchPath) grow.to($branchPath, { strokeDashoffset: 0, duration: GOING_BRANCH_S, ease: 'sine.inOut' }, HOW_STEM_S * 0.8);
      if ($blueHead) grow.to($blueHead, openHead, HOW_STEM_S * 0.8 + GOING_BRANCH_S * 0.85);
    }));
  }

  // ---------- Title, typed like the other titles, then the card ----------
  if ($cardText) gsap.set($cardText, { autoAlpha: 0 });
  if ($card) gsap.set($card, { clipPath: 'inset(-5% 105% -5% -5%)' });
  gsap.set($corners, { x: (i: number) => (i % 2 ? 8 : -8), y: (i: number) => (i < 2 ? -8 : 8), autoAlpha: 0 });
  if ($title) gsap.set($title, { autoAlpha: 0 });

  if ($title) {
    ScrollTrigger.create({
      trigger: $title,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        waitForFonts().then(() => context.add(() => {
          const chars = SplitText.create($title, { type: 'words,chars' }).chars;
          gsap.set(chars, { autoAlpha: 0 });
          gsap.set($title, { autoAlpha: 1 });
          const typed = gsap.timeline();
          typed.to(chars, { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: ABOUT_TITLE_TYPE_S });
          // The statue comes in with the title, so nothing shows before it (even after a reload
          // further down the page, when every trigger above fires at once)
          playStatue();

          // Once the title is typed, the card wipes in, its corners clamp, and the lines appear
          if ($card && $cardText) {
            // Each paragraph is split on its own, so the empty line between them stays
            const lines = SplitText.create($cardText.querySelectorAll('p'), { type: 'lines' }).lines;
            gsap.set($cardText, { autoAlpha: 1 });
            gsap.set(lines, { y: 12, autoAlpha: 0 });
            typed
              .to($card, { clipPath: 'inset(-5% -5% -5% -5%)', duration: 0.8, ease: 'power3.inOut', clearProps: 'clipPath' })
              .to($corners, { x: 0, y: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.05 }, '-=0.1')
              .to(lines, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, '<0.2');
          }
        })),
    });
  }

  // ---------- The statue, its eyes, the bubble gum, the disco ball and the statue's stems ----------
  const statueStems = $statueFlowers.map(($wrap) => ({ $wrap, $stem: prepStem($wrap), $head: prepHead($wrap) }));

  if ($statue) gsap.set($statue, { scale: 1.06, rotation: 3, autoAlpha: 0 });
  gsap.set($eyes, { scale: 1.15, rotation: -4, autoAlpha: 0 });
  if ($discoBall) gsap.set($discoBall, { scale: 1.06, rotation: -3, autoAlpha: 0 });
  // Like section 1's arch: the yellow circle and its outlines start out of place
  if ($discoFill) gsap.set($discoFill, { x: -20, y: 14, autoAlpha: 0 });
  if ($discoOutlines[0]) gsap.set($discoOutlines[0], { x: 18, y: -12, autoAlpha: 0 });
  if ($discoOutlines[1]) gsap.set($discoOutlines[1], { x: -16, y: 18, autoAlpha: 0 });

  // The bubble and its outlines all grow from the same point: the left of the bubble, at the
  // mouth. Growing from there keeps the whole of the real bubble gum covered.
  const $bubbleParts = [$bubble, ...$bubbleOutlines].filter(($el): $el is HTMLElement => $el !== null);
  if ($bubble) {
    const mouth = $bubble.getBoundingClientRect();
    const mouthX = mouth.left;
    const mouthY = mouth.top + mouth.height / 2;
    $bubbleParts.forEach(($part) => {
      const box = $part.getBoundingClientRect();
      gsap.set($part, {
        transformOrigin: `${((mouthX - box.left) / box.width) * 100}% ${((mouthY - box.top) / box.height) * 100}%`,
        scale: 0,
      });
    });
  }

  const playStatue = () => {
    if (!$statue) return;
    const statueIn = gsap.timeline({
      onComplete: () => {
        // The open flowers float, and the bubble keeps growing and shrinking back
        statueStems.forEach(({ $wrap }) => {
          gsap.to($wrap, {
            y: -INTRO_FLOAT_PX,
            duration: gsap.utils.random(2.4, 3.2),
            delay: gsap.utils.random(0, 0.6),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        });
        gsap.to($bubbleParts, { scale: 1 + GOING_BUBBLE_GROW, duration: GOING_BUBBLE_S, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      },
    });

    statueIn
      // The statue is pressed down like section 1's photo
      .to($statue, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.4)' }, 0)
      // The disco ball is pressed down while its circle and outlines slide into place
      .to($discoBall ?? [], { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.4)' }, 0.2)
      .to($discoFill ?? [], { x: 0, y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out' }, 0.25)
      .to($discoOutlines, { x: 0, y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', stagger: 0.05 }, 0.3)
      // The eyes are pressed on, one after the other
      .to($eyes, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.15 }, 0.5)
      // The bubble gum pops out of the mouth
      .to($bubbleParts, { scale: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.06 }, 0.8);

    // The statue's stems grow slowly out of it, one after the other, and their flowers open
    statueStems.forEach(({ $stem, $head }, i) => {
      const at = 0.9 + i * INTRO_FLOWER_GAP_S;
      if ($stem) statueIn.to($stem, { strokeDashoffset: 0, duration: INTRO_STEM_S, ease: 'sine.inOut' }, at);
      if ($head) statueIn.to($head, openHead, at + INTRO_STEM_S * 0.85);
    });
  };
};

/*
  ---------- Project pages: the hero ----------
  On load the band wipes in from left to right while the laptop and phone slide in from the right
  edge. Then the name's letters stand up one by one like "HI, I'M IRINA.", the tags grow in where
  they are, the line about the project rises in line by line, and the buttons rise in. As you
  scroll past, the mockup drifts up a little slower than the page, so it feels layered over the band.
*/
const createProjectHero = (context: gsap.Context) => {
  const $hero = document.querySelector('[data-section="project-hero"]');
  if (!$hero) return;

  const $band = getLayer('project-band', $hero);
  const $mockup = getLayer('project-mockup', $hero);
  const $title = getLayer('project-title', $hero);
  const $tagBodies = getAll('[data-layer="project-tag"] [data-layer="tag-body"]', $hero);
  const $summary = getLayer('project-summary', $hero);
  const $buttons = getAll('[data-layer="project-buttons"] [data-roll-button]', $hero);

  // ---------- Start states, set before the page appears ----------
  if ($band) gsap.set($band, { clipPath: 'inset(0% 100% 0% 0%)' });
  // The mockup starts just past the right edge of the screen, wherever the page is
  if ($mockup) gsap.set($mockup, { x: window.innerWidth - $mockup.getBoundingClientRect().left });
  if ($title) gsap.set($title, { autoAlpha: 0 });
  gsap.set($tagBodies, { scale: 0 });
  if ($summary) gsap.set($summary, { autoAlpha: 0 });
  gsap.set($buttons, { y: 16, autoAlpha: 0 });

  // As soon as the page has scrolled 1px (also when it loads already scrolled), the load hurries
  ScrollTrigger.create({ start: 1, once: true, onEnter: hurryProjectIntros });

  // ---------- As you scroll past the hero, the mockup lags a little behind the page ----------
  if ($mockup) {
    gsap.to($mockup, {
      y: PROJECT_MOCKUP_DRIFT_PX,
      ease: 'none',
      scrollTrigger: { trigger: $hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // ---------- The load sequence (the name and the lines need the fonts in first) ----------
  waitForFonts().then(() =>
    context.add(() => {
      const chars = $title ? SplitText.create($title, { type: 'chars' }).chars : [];
      const lines = $summary ? SplitText.create($summary, { type: 'lines' }).lines : [];
      gsap.set(chars, { autoAlpha: 0 });
      if ($title) gsap.set($title, { autoAlpha: 1 });
      gsap.set(lines, { y: 12, autoAlpha: 0 });
      if ($summary) gsap.set($summary, { autoAlpha: 1 });

      const titleAt = PROJECT_BAND_AT_S + PROJECT_BAND_S * 0.75;
      const titleDoneAt = titleAt + Math.max(chars.length - 1, 0) * TITLE_STAGGER_S + TITLE_STAND_S * 0.6;

      trackProjectIntro(gsap.timeline())
        // The band wipes in from left to right, like the text cards
        .to($band ?? [], { clipPath: 'inset(0% 0% 0% 0%)', duration: PROJECT_BAND_S, ease: 'power3.inOut', clearProps: 'clipPath' }, PROJECT_BAND_AT_S)
        // The laptop and phone slide in from the right edge and settle
        .to($mockup ?? [], { x: 0, duration: PROJECT_MOCKUP_S, ease: 'expo.out' }, PROJECT_BAND_AT_S)
        // The name's letters stand up from lying flat, one after the other
        .fromTo(
          chars,
          { rotationX: -100, autoAlpha: 0, transformOrigin: '50% 100%', transformPerspective: 500 },
          { rotationX: 0, autoAlpha: 1, duration: TITLE_STAND_S, ease: 'back.out(1.7)', stagger: TITLE_STAGGER_S },
          titleAt,
        )
        // The tags grow in where they are
        .to($tagBodies, { scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.1 }, titleDoneAt)
        // The line about the project rises in, line by line
        .to(lines, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, titleDoneAt + 0.2)
        // Then the buttons, and the sections below may come in
        .to($buttons, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.12 }, titleDoneAt + 0.45)
        .call(() => markProjectHeroShown(), [], titleDoneAt + 0.45);
    }),
  );
};

/*
  ---------- Project pages: the facts ----------
  When it comes into view, the double blue line draws in from left to right. The facts card wipes
  in and its corners clamp, then each label fades in and its value is typed, one fact after
  another. The tools card follows a moment later, and its icons pop in from left to right.
  Hovering an icon grows it a little, like the back arrow.
*/
const createProjectFacts = (context: gsap.Context): Cleanup | undefined => {
  const $section = document.querySelector('[data-section="project-facts"]');
  if (!$section) {
    markProjectFactsShown();
    return;
  }

  const $lines = getAll<SVGPathElement>('[data-layer="facts-line"]', $section);
  const $factsCard = getLayer('facts-card', $section);
  const $factsCorners = getAll('[data-layer="facts-corner"]', $section);
  const $labels = getAll('[data-layer="facts-label"]', $section);
  const $values = getAll('[data-layer="facts-value"]', $section);
  const $toolsCard = getLayer('tools-card', $section);
  const $toolsCorners = getAll('[data-layer="tools-corner"]', $section);
  const $toolsLabel = getLayer('tools-label', $section);
  const $icons = getAll('[data-layer="tools-icon"]', $section);

  // ---------- Start states ----------
  $lines.forEach(($line) => {
    const length = $line.getTotalLength();
    gsap.set($line, { strokeDasharray: length, strokeDashoffset: length });
  });
  const cardStart = { clipPath: 'inset(-5% 105% -5% -5%)' };
  const cornerStart = { x: (i: number) => (i % 2 ? 8 : -8), y: (i: number) => (i < 2 ? -8 : 8), autoAlpha: 0 };
  if ($factsCard) gsap.set($factsCard, cardStart);
  if ($toolsCard) gsap.set($toolsCard, cardStart);
  gsap.set([...$factsCorners, ...$toolsCorners], cornerStart);
  gsap.set([...$labels, ...$values], { autoAlpha: 0 });
  if ($toolsLabel) gsap.set($toolsLabel, { autoAlpha: 0 });
  gsap.set($icons, { scale: 0 });

  // ---------- The double line draws in exactly like the marquee's ----------
  // Same trigger point as the marquee, and never hurried by an early scroll, so it always
  // moves at the marquee's pace. It still waits for the hero, so the page comes in in order.
  if ($lines.length) {
    ScrollTrigger.create({
      trigger: $section,
      start: 'top 80%',
      once: true,
      onEnter: () => projectHeroShown.then(() => context.add(() => drawDoubleLine($lines))),
    });
  }

  // ---------- The cards, the facts and the icons ----------
  if (!$factsCard) markProjectFactsShown();
  if ($factsCard) {
    ScrollTrigger.create({
      trigger: $factsCard,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        Promise.all([waitForFonts(), projectHeroShown]).then(() =>
          context.add(() => {
            const cards = gsap.timeline({ onComplete: () => markProjectFactsShown() });
            trackProjectIntro(cards);
            const cardIn = { clipPath: 'inset(-5% -5% -5% -5%)', duration: 0.8, ease: 'power3.inOut', clearProps: 'clipPath' };
            const cornersIn = { x: 0, y: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.05 };

            cards.to($factsCard, cardIn, 0).to($factsCorners, cornersIn, 0.7);
            if ($toolsCard) cards.to($toolsCard, cardIn, 0.15).to($toolsCorners, cornersIn, 0.85);

            // Each label fades in, then its value is typed letter by letter, one fact after another
            let at = 0.8;
            $labels.forEach(($label, i) => {
              const $value = $values[i];
              cards.to($label, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' }, at);
              if (!$value) return;
              const chars = SplitText.create($value, { type: 'words,chars' }).chars;
              gsap.set(chars, { autoAlpha: 0 });
              gsap.set($value, { autoAlpha: 1 });
              cards.to(chars, { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: FACTS_TYPE_S }, at + 0.2);
              at += 0.2 + chars.length * FACTS_TYPE_S + 0.1;
            });

            // The tools label, then the icons pop in from left to right
            if ($toolsLabel) cards.to($toolsLabel, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' }, 0.95);
            cards.to($icons, { scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.08 }, 1.05);
          }),
        ),
    });
  }

  // ---------- Hovering an icon grows it a little ----------
  const cleanups = $icons.map(($icon) =>
    onHover(
      $icon,
      () => gsap.to($icon, { scale: LOGO_HOVER_SCALE, duration: 0.3, ease: 'power2.out', overwrite: 'auto' }),
      () => gsap.to($icon, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' }),
    ),
  );
  return () => cleanups.forEach((cleanup) => cleanup());
};

/*
  ---------- Project pages: the story ----------
  The left column stays in place while the images scroll past. All the chapter titles stay on
  screen; only the chapter you're in is open, and in it only the part whose images you're looking
  at. Folding is only visual (height and opacity): screen readers still read every part in order,
  and tabbing to a button in a folded part scrolls to that part's images, so it opens. A part opens when its first image reaches the middle of the screen, and the one before
  folds back up; scrolling back up plays it in reverse. The line under each chapter title fills
  green as you scroll through that chapter's images.
  Without this (no JavaScript, or Reduce motion), every text is open and the column scrolls.
*/
const createProjectStory = (context: gsap.Context): Cleanup | undefined => {
  const $story = document.querySelector<HTMLElement>('[data-section="project-story"]');
  if (!$story) return;

  const imagesOf = (partPrefix: string) => getAll(`[data-layer="story-image"][data-part^="${partPrefix}"]`, $story);

  const chapters = getAll('[data-layer="story-chapter"]', $story).map(($chapter) => ({
    id: $chapter.dataset.chapter ?? '',
    $parts: getLayer('story-chapter-parts', $chapter),
    $fill: getLayer('story-progress', $chapter),
    $partEls: getAll('[data-layer="story-part"]', $chapter),
  }));
  const parts = chapters.flatMap((chapter) =>
    chapter.$partEls.map(($part) => ({
      id: $part.dataset.part ?? '',
      $part,
      chapter,
      $body: getLayer('story-part-body', $part),
      $buttons: getAll('[data-roll-button]', $part),
    })),
  );
  if (!parts.length) return;

  // Tighter gaps and a column that stays in place (see ProjectStory.astro)
  $story.dataset.story = 'live';

  // ---------- In order: after the facts, the chapters and then each image rise in as they come into view ----------
  const $rail = getLayer('story-rail', $story);
  const $images = getAll('[data-layer="story-image"]', $story);
  if ($rail) gsap.set($rail, { y: 24, autoAlpha: 0 });
  gsap.set($images, { y: 40, autoAlpha: 0 });
  const riseIn = ($el: HTMLElement) =>
    ScrollTrigger.create({
      trigger: $el,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        projectFactsShown.then(() =>
          context.add(() => trackProjectIntro(gsap.to($el, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }))),
        ),
    });
  if ($rail) riseIn($rail);
  $images.forEach(riseIn);

  // ---------- Open one part (and its chapter), fold the others ----------
  let activeIndex = -1;
  const fold = ($el: HTMLElement | null, open: boolean, instant: boolean) => {
    if (!$el) return;
    // opacity, not autoAlpha: a folded part stays readable for screen readers
    if (instant) {
      gsap.set($el, { height: open ? 'auto' : 0, opacity: open ? 1 : 0 });
      return;
    }
    // Stop whatever it was doing (including a fade that hasn't started yet), so a part can
    // turn around halfway when you change direction
    gsap.killTweensOf($el);
    if (open) {
      gsap.to($el, { height: 'auto', duration: STORY_OPEN_S, ease: 'power2.inOut' });
      gsap.to($el, { opacity: 1, duration: STORY_OPEN_S * 0.6, delay: STORY_OPEN_S * 0.3, ease: 'power1.out' });
    } else {
      gsap.to($el, { opacity: 0, duration: STORY_CLOSE_S * 0.4, ease: 'power1.out' });
      gsap.to($el, { height: 0, duration: STORY_CLOSE_S, delay: STORY_CLOSE_S * 0.1, ease: 'power2.inOut' });
    }
  };
  const show = (index: number, instant = false) => {
    if (index === activeIndex) return;
    activeIndex = index;
    const active = parts[index];
    context.add(() => {
      chapters.forEach((chapter) => fold(chapter.$parts, chapter === active.chapter, instant));
      parts.forEach((part, i) => fold(part.$body, i === index, instant));
      // The part's buttons rise in one by one once its text is in, like the text itself
      if (!instant && active.$buttons.length) {
        gsap.killTweensOf(active.$buttons);
        gsap.fromTo(
          active.$buttons,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, delay: STORY_OPEN_S * 0.6, ease: 'power3.out', stagger: 0.08 },
        );
      }
    });
  };
  show(0, true);

  // A part opens when its first image reaches the middle of the screen (and the one before it
  // opens again when you scroll back up past that point)
  parts.forEach((part, i) => {
    const $first = imagesOf(part.id)[0];
    if (i === 0 || !$first) return;
    ScrollTrigger.create({
      trigger: $first,
      start: 'top center',
      onEnter: () => show(i),
      onLeaveBack: () => show(i - 1),
    });
  });

  // ---------- Keyboard: tabbing into a folded part scrolls to its images, so it opens ----------
  const cleanups = parts.map((part, i) => {
    const $first = imagesOf(part.id)[0];
    const onFocus = () => {
      if (i === activeIndex || !$first) return;
      // Its first image just past the middle of the screen, where the part opens
      const top = $first.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + 2;
      if (smoothScroll) smoothScroll.scrollTo(top);
      else window.scrollTo({ top });
    };
    part.$part.addEventListener('focusin', onFocus);
    return () => part.$part.removeEventListener('focusin', onFocus);
  });

  // ---------- The line under each chapter title fills as you scroll through its images ----------
  chapters.forEach(({ id, $fill }) => {
    const $images = imagesOf(`${id}-`);
    if (!$fill || !$images.length) return;
    gsap.to($fill, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: $images[0],
        start: 'top center',
        endTrigger: $images[$images.length - 1],
        end: 'bottom center',
        scrub: true,
      },
    });
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
    delete $story.dataset.story;
  };
};

/*
  ---------- Project pages: the live website ----------
  A clear cover keeps the page scrolling past the website. A click lifts it so you can use the
  website; moving the mouse away puts it back. While the mouse is over the cover, the pink
  "Click to try it" tag pops in and follows it like the cursor flower (with Reduce motion it
  simply shows in the middle). The cover works with Reduce motion too, as it isn't motion.
*/
const createProjectLiveCover = (reduceMotion: boolean): Cleanup | undefined => {
  const $screen = getLayer('live-screen');
  const $cover = $screen && getLayer<HTMLButtonElement>('live-cover', $screen);
  const $hint = $screen && getLayer('live-hint', $screen);
  if (!$screen || !$cover) return;

  // ---------- The hint ----------
  const follows = !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // With motion it's placed by its own top-left corner at the mouse, so the script owns its position
  if ($hint) gsap.set($hint, follows ? { left: 0, top: 0, x: 0, y: 0, xPercent: -50, yPercent: -100, scale: 0, autoAlpha: 1 } : {});
  const moveX = $hint && follows ? gsap.quickTo($hint, 'x', { duration: CURSOR_FLOWER_LAG_S, ease: 'power3.out' }) : null;
  const moveY = $hint && follows ? gsap.quickTo($hint, 'y', { duration: CURSOR_FLOWER_LAG_S, ease: 'power3.out' }) : null;
  let isShown = false;

  // Just above the pointer, so it never covers what you're pointing at
  const at = (event: PointerEvent) => {
    const box = $screen.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top - CURSOR_FLOWER_OFFSET_PX };
  };
  const showHint = (event: PointerEvent) => {
    if (!$hint || isShown) return;
    isShown = true;
    if (!follows) {
      gsap.set($hint, { visibility: 'visible' });
      return;
    }
    const { x, y } = at(event);
    gsap.set($hint, { x, y });
    gsap.to($hint, { scale: 1, duration: 0.4, ease: 'back.out(2)', overwrite: 'auto' });
  };
  const moveHint = (event: PointerEvent) => {
    if (!isShown || !moveX || !moveY) return;
    const { x, y } = at(event);
    moveX(x);
    moveY(y);
  };
  const hideHint = () => {
    if (!$hint || !isShown) return;
    isShown = false;
    if (!follows) gsap.set($hint, { visibility: 'hidden' });
    else gsap.to($hint, { scale: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' });
  };

  // ---------- A YouTube video: started by the click, paused when it leaves the screen ----------
  // Commands go to YouTube's player through postMessage (https://developers.google.com/youtube/iframe_api_reference)
  const $frame = getLayer<HTMLIFrameElement>('live-site', $screen);
  const isVideo = $screen.dataset.liveKind === 'youtube';
  const tellVideo = (func: 'playVideo' | 'pauseVideo') =>
    $frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), 'https://www.youtube-nocookie.com');
  const outOfView = isVideo
    ? new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) tellVideo('pauseVideo');
      })
    : null;
  outOfView?.observe($screen);

  // ---------- The cover ----------
  const guard = () => $screen.classList.add('project-live__screen--guarded');
  const lift = () => {
    $screen.classList.remove('project-live__screen--guarded');
    hideHint();
    if (isVideo) tellVideo('playVideo');
  };
  guard();

  const events: [EventTarget, string, EventListener][] = [
    [$cover, 'click', lift],
    [$cover, 'pointerenter', showHint as EventListener],
    [$cover, 'pointermove', moveHint as EventListener],
    [$cover, 'pointerleave', hideHint],
    [$screen, 'mouseleave', guard],
  ];
  events.forEach(([$target, type, handler]) => $target.addEventListener(type, handler));
  return () => {
    $screen.classList.remove('project-live__screen--guarded');
    outOfView?.disconnect();
    events.forEach(([$target, type, handler]) => $target.removeEventListener(type, handler));
  };
};

// With motion: the website rises in when it comes into view, once the facts are in
const createProjectLive = (context: gsap.Context) => {
  const $screen = getLayer('live-screen');
  if (!$screen) return;
  gsap.set($screen, { y: 40, autoAlpha: 0 });
  ScrollTrigger.create({
    trigger: $screen,
    start: 'top 90%',
    once: true,
    onEnter: () =>
      projectFactsShown.then(() =>
        context.add(() => trackProjectIntro(gsap.to($screen, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }))),
      ),
  });
};

/* ---------- Page load: the hero comes into register ---------- */
const playHeroIntro = (context: gsap.Context, addCleanup: (cleanup?: Cleanup) => void) => {
  const $html = document.documentElement;
  const $band = getLayer('band');
  const $plate = getLayer('title-plate');
  const $platePaper = getLayer('title-plate-paper');
  const $title = getLayer('title');
  const $subtitle = getLayer('subtitle');
  const $subtitleOpen = getLayer('subtitle-open');
  const $subtitleClose = getLayer('subtitle-close');
  const $subtitleText = getLayer('subtitle-text');
  const $camera = getLayer('camera');
  const $cameraImage = getLayer('camera-image');
  const $photo = getLayer('photo');
  const $photoFill = getLayer('photo-yellow');
  const $outlineFront = getLayer('photo-outline-front');
  const $outlineBack = getLayer('photo-outline-back');
  const $internship = document.querySelector<HTMLElement>('[data-tag-intro="hang"]');
  const $internshipBody = $internship && getLayer('tag-body', $internship);
  const $internshipLabel = $internship && getLayer('tag-label', $internship);
  if (
    !$band ||
    !$plate ||
    !$platePaper ||
    !$title ||
    !$subtitle ||
    !$subtitleOpen ||
    !$subtitleClose ||
    !$subtitleText ||
    !$camera ||
    !$cameraImage ||
    !$photo ||
    !$photoFill ||
    !$outlineFront ||
    !$outlineBack ||
    !$internship ||
    !$internshipBody ||
    !$internshipLabel
  ) {
    delete $html.dataset.intro;
    markAboutTitleTyped();
    return;
  }

  const $headerItems = getLayers(['logo', 'nav-projects', 'nav-about', 'cta']);
  const starNames = ['title-star-left', 'title-star-right', 'sparkle-big', 'sparkle-small'];
  // The SVG inside each star moves, so the star's own position and tilt stay put
  const getSvgs = (names: string[]) =>
    getLayers(names)
      .map(($layer) => $layer.querySelector<SVGElement>('svg'))
      .filter(($svg): $svg is SVGElement => $svg !== null);
  const $stars = getSvgs(starNames);
  const $starOutlines = getSvgs(starNames.map((name) => `${name}-outline`));
  const $travelTags = getAll('[data-tag-intro="travel"]');
  const $growTags = getAll('[data-tag-intro="grow"]');
  const getBody = ($tag: HTMLElement) => getLayer('tag-body', $tag) ?? $tag;
  const $travelBodies = $travelTags.map(getBody);
  const $growBodies = $growTags.map(getBody);

  // No masks: Boldonse letters are taller than their box, so a mask cuts them off
  const titleSplit = SplitText.create($title, { type: 'chars' });
  // The < and > start side by side in the middle of the text, then move out to their places
  const subtitleHalf = $subtitleText.offsetWidth / 2;
  const subtitleSplit = SplitText.create($subtitleText, { type: 'chars' });
  // Words too, so the title still breaks between words, never inside one
  const $aboutTitle = getLayer('about-title');
  const aboutTitleChars = $aboutTitle ? SplitText.create($aboutTitle, { type: 'words,chars' }).chars : [];

  // Where each title tag starts: the centre of the plate, hidden under it.
  // GSAP's x/y move the tag along its own tilt (the CSS `rotate`), so the
  // on-screen distance is turned back by that tilt first.
  const plateBox = $plate.getBoundingClientRect();
  const plateCentre = { x: plateBox.left + plateBox.width / 2, y: plateBox.top + plateBox.height / 2 };
  const tagOffsets = $travelTags.map(($tag) => {
    const box = $tag.getBoundingClientRect();
    const dx = plateCentre.x - (box.left + box.width / 2);
    const dy = plateCentre.y - (box.top + box.height / 2);
    const tilt = (-parseFloat(getComputedStyle($tag).rotate || '0') * Math.PI) / 180;
    return {
      x: dx * Math.cos(tilt) - dy * Math.sin(tilt),
      y: dx * Math.sin(tilt) + dy * Math.cos(tilt),
    };
  });

  // The sign starts with random letters in place of its text (same length, so its width
  // never changes), then decodes into the real words
  const internshipText = $internshipLabel.textContent ?? '';
  const scrambledText = internshipText.replace(/[a-z]/g, () => gsap.utils.random(SCRAMBLE_CHARS.split('')));

  const floatWhenDone = {
    onComplete(this: gsap.core.Tween) {
      const $tag = this.targets()[0] as Element;
      context.add(() => startFloat($tag));
    },
  };

  const signHangsAt = INTERNSHIP_AT_S + SIGN_DROP_S;

  const intro = gsap.timeline({
    paused: true,
    defaults: { ease: 'expo.out' },
    // Once everything is in place, the layers start following the mouse
    onComplete: () => context.add(() => addCleanup(createDepth([...$travelBodies, ...$growBodies]))),
  });

  intro
    // The wrappers show straight away. Their inner layers set their own start state below.
    .set([$plate, $title, $subtitle, $camera], { autoAlpha: 1 }, 0)

    // 0.0s: the header is there almost at once, so it's usable from the start
    .fromTo($headerItems, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' }, 0)

    // 0.0s: the band is pulled on from the left like a strip of tape
    .fromTo(
      $band,
      { scaleX: 0, skewX: -12, transformOrigin: 'left center', autoAlpha: 1 },
      { scaleX: 1, skewX: 0, duration: BAND_S, ease: 'power3.inOut' },
      0,
    )

    // 0.1s: the plate is placed by hand: it wipes in and settles from a bigger tilt
    .fromTo(
      $platePaper,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: PLATE_S, ease: 'power3.inOut' },
      0.1,
    )
    .fromTo(
      $platePaper,
      { rotation: 4 },
      { rotation: 0, duration: PLATE_S * 0.85, ease: 'power2.out', immediateRender: false },
      0.1,
    )

    // 0.5s: each letter stands up from lying flat on the plate, like cards flipped upright,
    // with a little overshoot. Hinged on its bottom edge, one after another, following the plate.
    .fromTo(
      titleSplit.chars,
      { rotationX: -100, autoAlpha: 0, transformOrigin: '50% 100%', transformPerspective: 500 },
      { rotationX: 0, autoAlpha: 1, duration: TITLE_STAND_S, ease: 'back.out(1.7)', stagger: TITLE_STAGGER_S },
      TITLE_AT_S,
    )

    // 0.5s: the subtitle's < > appear side by side in the middle, then open like an HTML tag
    .fromTo(
      [$subtitleOpen, $subtitleClose],
      { autoAlpha: 0, x: (i: number) => (i === 0 ? subtitleHalf : -subtitleHalf) },
      { autoAlpha: 1, duration: 0.4, ease: 'power1.out' },
      0.5,
    )
    .to([$subtitleOpen, $subtitleClose], { x: 0, duration: SUBTITLE_OPEN_S, ease: SUBTITLE_EASE }, SUBTITLE_OPEN_AT_S)
    // 2.3s: once the tag is open, the text is typed between the brackets, with no cursor
    .fromTo(
      subtitleSplit.chars,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: SUBTITLE_TYPE_S },
      SUBTITLE_OPEN_AT_S + SUBTITLE_OPEN_S,
    )
    // 2.6s: the About title below the hero is typed, letter by letter
    .fromTo(
      aboutTitleChars,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: ABOUT_TITLE_TYPE_S },
      ABOUT_TITLE_AT_S,
    )
    .call(() => markAboutTitleTyped(), [], ABOUT_TITLE_AT_S + aboutTitleChars.length * ABOUT_TITLE_TYPE_S)

    // 0.7s: the photo is pressed down like a sticker, and its fill and outlines
    // slide in from out of place until the print is in register
    .fromTo(
      $photo,
      { scale: 1.06, rotation: 3, autoAlpha: 0 },
      { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.4)' },
      0.7,
    )
    .fromTo($photoFill, { x: -20, y: 14, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 1.1 }, 0.75)
    .fromTo($outlineFront, { x: 18, y: -12, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 1.1 }, 0.8)
    .fromTo($outlineBack, { x: -16, y: 18, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 1.1 }, 0.85)

    // 0.75s: the camera is pressed down in place, just after the photo, so it never leaves it
    .fromTo(
      $cameraImage,
      { scale: 1.06, rotation: -3, autoAlpha: 0 },
      { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.4)' },
      0.75,
    )

    // 1.2s: the pink fills pop in, and their outlines slide in from out of place and lock on
    .fromTo(
      $stars,
      { scale: 0, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.1 },
      1.2,
    )
    .fromTo(
      $starOutlines,
      { x: (i: number) => (i % 2 ? 6 : -6), y: (i: number) => (i % 2 ? -6 : 6), autoAlpha: 0 },
      { x: 0, y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1 },
      1.3,
    )

    // 1.5s: the title tags travel out from under the plate, growing as they go
    .set($travelBodies, { autoAlpha: 1 }, 1.5)
    .fromTo(
      $travelBodies,
      { x: (i: number) => tagOffsets[i].x, y: (i: number) => tagOffsets[i].y, scale: 0.4 },
      { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'back.out(1.2)', stagger: { each: 0.08, ...floatWhenDone } },
      1.5,
    )
    // 1.6s: the camera tags grow where they are
    .fromTo(
      $growBodies,
      { scale: 0.4, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.7)', stagger: { each: 0.08, ...floatWhenDone } },
      1.6,
    )

    // 2.3s: the internship sign flips down from its top edge, like a sign hung on a nail
    .fromTo(
      $internshipBody,
      { rotationX: -95, autoAlpha: 0 },
      { rotationX: 0, autoAlpha: 1, duration: SIGN_DROP_S, ease: 'power3.in' },
      INTERNSHIP_AT_S,
    )
    // it swings side to side and settles
    .to(
      $internshipBody,
      { keyframes: { rotation: SIGN_SWING_DEG, easeEach: 'sine.inOut' }, duration: 1.8 },
      signHangsAt,
    )
    // and its text decodes from random letters into the real words, left to right
    .to(
      $internshipLabel,
      {
        duration: SIGN_DECODE_S,
        ease: 'none',
        scrambleText: { text: internshipText, chars: SCRAMBLE_CHARS, revealDelay: 0.2, speed: 0.6 },
      },
      signHangsAt,
    )
    .call(() => context.add(() => addCleanup(createInternshipSwing($internshipBody))), [], signHangsAt + SIGN_DECODE_S);

  // Every layer now has its start state, so the CSS that hid them can go
  gsap.set($travelBodies, { autoAlpha: 0 });
  // It hangs from its top centre, with some depth for the flip
  gsap.set($internshipBody, { transformOrigin: '50% 0%', transformPerspective: 600 });
  $internshipLabel.textContent = scrambledText;
  delete $html.dataset.intro;
  intro.play();

  // Scrolling while the hero still loads: everything still arrives in order, just faster.
  // start: 1 = as soon as the page has scrolled 1px (also true if it loads already scrolled).
  ScrollTrigger.create({
    start: 1,
    once: true,
    onEnter: () => {
      if (intro.progress() < 1) gsap.to(intro, { timeScale: INTRO_HURRY_SPEED, duration: 0.3, ease: 'power1.in' });
    },
  });
};

/*
  ---------- Page transitions: tape strips ----------
  Clicking a link to another page of the site covers the screen with five horizontal strips of
  one colour, sliding in from alternate sides. Then the new page loads behind them (Base.astro
  starts it covered) and they slide away the other way. The pace is the example Irina picked
  (smllns-portfolio): a 0.8s cover and a 0.5s reveal on power4.inOut.
  The colour moves on through the palette with every transition, also across pages (it's kept in
  sessionStorage). With Reduce motion the strips just fade in and out.
  Left alone: links within the same page, downloads, email links, links to other sites or that
  open a new tab, and clicks with a modifier key (to open in a new tab).
*/
const TRANSITION_COLOURS = ['--c-pink', '--c-yellow', '--c-green', '--c-blue', '--c-marker'];
const TRANSITION_IN = { duration: 0.8, ease: 'power4.inOut', stagger: 0.04 };
const TRANSITION_OUT = { duration: 0.5, ease: 'power4.inOut', stagger: 0.03, delay: 0.08 };

const createPageTransitions = (reduceMotion: boolean) => {
  const $html = document.documentElement;
  const $layer = document.querySelector<HTMLElement>('[data-page-transition]');
  if (!$layer) return;
  const $strips = getAll('[data-transition-strip]', $layer);
  // The even strips come from the left, the odd ones from the right, and leave on the other side
  const fromSide = (i: number) => (i % 2 ? 101 : -101);
  const toSide = (i: number) => (i % 2 ? -101 : 101);
  let isLeaving = false;

  const storage = {
    get: (key: string) => {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set: (key: string, value: string) => {
      try {
        sessionStorage.setItem(key, value);
      } catch {
        // no sessionStorage: the next page simply shows without the reveal
      }
    },
    remove: (key: string) => {
      try {
        sessionStorage.removeItem(key);
      } catch {
        // nothing to clean up
      }
    },
  };

  const hide = () => {
    delete $html.dataset.transition;
    gsap.set($layer, { clearProps: 'visibility,pointerEvents,opacity' });
    gsap.set($strips, { clearProps: 'transform' });
  };

  // ---------- Arriving: the page starts covered, the strips slide away ----------
  const reveal = () => {
    storage.remove('page-transition');
    gsap.set($layer, { visibility: 'visible' });
    if (reduceMotion) {
      gsap.to($layer, { opacity: 0, duration: 0.25, ease: 'power1.out', onComplete: hide });
    } else {
      gsap.to($strips, { xPercent: toSide, ...TRANSITION_OUT, onComplete: hide });
    }
  };
  if ($html.dataset.transition === 'in') reveal();

  // Back to a page kept in the browser's memory (the back button): it was left covered, so reveal it
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    isLeaving = false;
    reveal();
  });

  // ---------- Leaving: cover the screen, then go ----------
  const leave = (href: string) => {
    isLeaving = true;
    const index = Number(storage.get('page-transition-index') ?? 0) % TRANSITION_COLOURS.length;
    const colour = `var(${TRANSITION_COLOURS[index]})`;
    storage.set('page-transition-index', String(index + 1));
    $html.style.setProperty('--transition-colour', colour);

    const go = () => {
      storage.set('page-transition', colour);
      window.location.href = href;
    };
    gsap.set($layer, { visibility: 'visible', pointerEvents: 'auto' });
    if (reduceMotion) {
      gsap.set($strips, { xPercent: 0 });
      gsap.fromTo($layer, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.in', onComplete: go });
    } else {
      gsap.fromTo($strips, { xPercent: fromSide }, { xPercent: 0, ...TRANSITION_IN, onComplete: go });
    }
  };

  document.addEventListener('click', (event) => {
    if (isLeaving || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const $link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
    if (!$link || $link.hasAttribute('download')) return;
    if ($link.target && $link.target !== '_self') return;
    const url = new URL($link.href, window.location.href);
    if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return;
    // Same page (a link to a section on it): the smooth scroll handles it
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;
    // Files, like the CV PDF
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith('.html')) return;
    event.preventDefault();
    leave(url.href);
  });
};

/*
  The skip link jumps to the page's main title and moves the keyboard focus there too, so the
  next Tab goes on from the content, not from the header (smooth scrolling would skip that).
*/
const createSkipLink = () => {
  const $link = document.querySelector<HTMLAnchorElement>('[data-skip-link]');
  const $target = $link && document.getElementById($link.hash.slice(1));
  if (!$link || !$target) return;
  $target.setAttribute('tabindex', '-1');
  $link.addEventListener('click', () => $target.focus({ preventScroll: true }));
};

export const initAnimations = () => {
  createSkipLink();
  createPageTransitions(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const mm = gsap.matchMedia();

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const reduceMotion = Boolean(context.conditions?.reduceMotion);
      const cleanups: Cleanup[] = [];
      const addCleanup = (cleanup?: Cleanup) => {
        if (cleanup) cleanups.push(cleanup);
      };

      createNavLinks(reduceMotion).forEach(addCleanup);
      getAll('[data-roll-button]').forEach(($button) => addCleanup(createRollButton($button, reduceMotion)));
      addCleanup(createProjectLiveCover(reduceMotion));

      if (reduceMotion) {
        // No spinning, floating, smooth scrolling or page-load sequence: everything is simply there
        delete document.documentElement.dataset.intro;
        markAboutTitleTyped();
      } else {
        addCleanup(createLogo());
        addCleanup(createBackArrow());
        addCleanup(createCvHover());
        addCleanup(createCursorFlower());
        addCleanup(createSmoothScroll());
        createScrollDrift();
        createAboutAnimations(context, addCleanup);
        // The work rows' hover is done here, so the instant CSS hover switches off
        document.documentElement.dataset.motion = '';
        addCleanup(() => delete document.documentElement.dataset.motion);
        createWorkAnimations(context).forEach(addCleanup);
        createFilmStrip(context);
        createMarquee(context, addCleanup);
        createFooter(context);
        createAboutIntro(context, addCleanup);
        createAboutHowItStarted(context, addCleanup);
        createAboutHowItsGoing(context);
        createProjectHero(context);
        addCleanup(createProjectFacts(context));
        addCleanup(createProjectStory(context));
        createProjectLive(context);
        if (document.querySelector('[data-section="hero"]')) {
          waitForFonts().then(() => context.add(() => playHeroIntro(context, addCleanup)));
        } else {
          // A page without the hero (like About me): nothing to wait for, show the page at once
          delete document.documentElement.dataset.intro;
          markAboutTitleTyped();
        }
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    },
  );
};
