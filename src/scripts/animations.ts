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

// Hero load sequence
const TITLE_STAND_S = 0.9; // each title letter stands up from flat
const TITLE_STAGGER_S = 0.05;
const SUBTITLE_OPEN_AT_S = 0.9; // the subtitle's < > appear together, rest a moment, then open
const SUBTITLE_OPEN_S = 2;
const SUBTITLE_EASE = 'sine.inOut'; // starts and stops gently, like the tag is pulled open by hand
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

// Don't keep the page hidden for long if a web font is slow
const FONT_WAIT_MS = 1500;

type Cleanup = () => void;

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

/* ---------- 5. Green buttons (Get in touch, About me): letters and arrow roll up into the light copy ---------- */
const createRollButton = ($button: HTMLElement, reduceMotion: boolean): Cleanup | undefined => {
  const $text = getLayer('button-text', $button);
  const $textHover = getLayer('button-text-hover', $button);
  const $arrow = getLayer<SVGElement>('button-arrow', $button);
  const $arrowHover = getLayer<SVGElement>('button-arrow-hover', $button);
  if (!$text || !$textHover || !$arrow || !$arrowHover) return;

  const textSplit = SplitText.create($text, { type: 'chars' });
  const hoverSplit = SplitText.create($textHover, { type: 'chars', aria: 'none' });
  // The arrow rolls as the last "letter"
  const $tops = [...textSplit.chars, $arrow];
  const $bottoms = [...hoverSplit.chars, $arrowHover];

  gsap.set($bottoms, { yPercent: CTA_ROLL_Y });
  gsap.set([$textHover, $arrowHover], { visibility: 'visible' });

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

  return onHover(
    $button,
    () => roll(-CTA_ROLL_Y, 0),
    () => roll(0, CTA_ROLL_Y),
  );
};

/* ---------- Smooth scrolling (Lenis) and the hero drifting apart on scroll ---------- */
const createSmoothScroll = (): Cleanup => {
  const lenis = new Lenis({ anchors: true });
  const tick = (time: number) => lenis.raf(time * 1000);

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
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

    // 0.0s: the band tears on from the left like a strip of tape
    .fromTo(
      $band,
      { scaleX: 0, skewX: -12, transformOrigin: 'left center', autoAlpha: 1 },
      { scaleX: 1, skewX: 0, duration: 0.8, ease: 'power4.out' },
      0,
    )

    // 0.15s: the plate is placed by hand: it wipes in and settles from a bigger tilt
    .fromTo($platePaper, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.8 }, 0.15)
    .fromTo($platePaper, { rotation: 4 }, { rotation: 0, duration: 0.6, ease: 'power3.out', immediateRender: false }, 0.15)

    // 0.4s: each letter stands up from lying flat on the plate, like cards flipped upright,
    // with a little overshoot. Hinged on its bottom edge, one after another.
    .fromTo(
      titleSplit.chars,
      { rotationX: -100, autoAlpha: 0, transformOrigin: '50% 100%', transformPerspective: 500 },
      { rotationX: 0, autoAlpha: 1, duration: TITLE_STAND_S, ease: 'back.out(1.7)', stagger: TITLE_STAGGER_S },
      0.4,
    )

    // 0.5s: the subtitle's < > appear side by side in the middle, then open like an HTML tag,
    // and the text shows between them as they move apart
    .fromTo(
      [$subtitleOpen, $subtitleClose],
      { autoAlpha: 0, x: (i: number) => (i === 0 ? subtitleHalf : -subtitleHalf) },
      { autoAlpha: 1, duration: 0.4, ease: 'power1.out' },
      0.5,
    )
    .to([$subtitleOpen, $subtitleClose], { x: 0, duration: SUBTITLE_OPEN_S, ease: SUBTITLE_EASE }, SUBTITLE_OPEN_AT_S)
    .fromTo(
      $subtitleText,
      { clipPath: 'inset(-20% 50% -20% 50%)' },
      { clipPath: 'inset(-20% 0% -20% 0%)', duration: SUBTITLE_OPEN_S, ease: SUBTITLE_EASE },
      SUBTITLE_OPEN_AT_S,
    )

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
      } else {
        addCleanup(createLogo());
        addCleanup(createSmoothScroll());
        createScrollDrift();
        waitForFonts().then(() => context.add(() => playHeroIntro(context, addCleanup)));
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    },
  );
};
