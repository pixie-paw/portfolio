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
const startWaveFlow = ($about: Element): Cleanup | undefined => {
  const $wave = getLayer<SVGSVGElement>('wave', $about);
  const $text = getLayer<SVGTextElement>('wave-text', $about);
  const $textPath = getLayer<SVGTextPathElement>('wave-text-path', $about);
  const $curve = $about.querySelector<SVGPathElement>('#about-wave-text-path');
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

/* ---------- Work section: project rows (name roll, kind underline, arrow) ---------- */
const createWorkRows = ($work: Element, preview?: WorkPreview): Cleanup[] => {
  const blue = getComputedStyle(document.documentElement).getPropertyValue('--c-blue').trim();
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--c-ink').trim();

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
            .to($lines, { strokeDashoffset: 0, duration: MARQUEE_LINE_DRAW_S, ease: 'power2.inOut', stagger: 0.1 }, 0);
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

export const initAnimations = () => {
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

      if (reduceMotion) {
        // No spinning, floating, smooth scrolling or page-load sequence: everything is simply there
        delete document.documentElement.dataset.intro;
        markAboutTitleTyped();
      } else {
        addCleanup(createLogo());
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
        waitForFonts().then(() => context.add(() => playHeroIntro(context, addCleanup)));
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    },
  );
};
