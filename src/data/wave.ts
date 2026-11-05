/*
  The blue wave and the words that run along it, shared by the home page's About section
  and the About me page.

  The points are the wave's centre line, measured from the home page's Figma render every
  40px, in that frame's px. Under the typewriter it's hidden, so those points only keep the
  curve smooth. Both ends run on past the 1440 frame, so it still goes edge to edge on wide screens.
*/
export const WAVE_POINTS: [number, number][] = [
  [-800, 1850], [-500, 1830], [-195, 1690], [-100, 1615], [0, 1499.5], [40, 1442.5],
  [80, 1398], [120, 1369.5], [160, 1357], [200, 1361], [240, 1377], [280, 1398],
  [320, 1418.5], [360, 1431.5], [400, 1434], [440, 1425.5], [480, 1401.5], [520, 1358],
  [560, 1306.5], [600, 1266.5], [640, 1248], [700, 1238], [780, 1262], [860, 1310],
  [940, 1352], [1000, 1374], [1040, 1386], [1080, 1396], [1120, 1402], [1160, 1404.5],
  [1200, 1404], [1240, 1400], [1280, 1392.5], [1320, 1381], [1360, 1367], [1400, 1347.5],
  [1440, 1325], [1542, 1270], [1800, 1190], [2240, 1160],
];

// Irina's approved copy, word for word
export const WAVE_TEXT =
  'Test   ·   Design   ·   Iterate   ·   Code   ·   Create   ·   Test   ·   Design   ·   Iterate   ·   Code   ·   Create   ·   Test   ·   Design   ·   Iterate   ·   Code   ·   Test   ·   Create   ·   Design   ·   Iterate   ·   Code   ·   Create';

/** The wave's points moved by dx / dy (Figma px). */
export const shiftPoints = (points: [number, number][], dx: number, dy: number): [number, number][] =>
  points.map(([x, y]) => [x + dx, y + dy]);

/**
 * A smooth line through the points (Catmull-Rom turned into cubic Béziers), as an SVG path,
 * with y measured from `top` (the Figma y of the section the SVG sits in).
 */
export const smoothPath = (points: [number, number][], top: number) => {
  const p = points.map(([x, y]) => [x, y - top]);
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [x0, y0] = p[i - 1] ?? p[i];
    const [x1, y1] = p[i];
    const [x2, y2] = p[i + 1];
    const [x3, y3] = p[i + 2] ?? p[i + 1];
    const c1 = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6];
    const c2 = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${x2} ${y2}`;
  }
  return d;
};

/** About how far along the points a given x is (straight lines between points), for startOffset. */
export const lengthUpTo = (points: [number, number][], untilX: number) =>
  points
    .filter(([x]) => x <= untilX)
    .reduce((length, [x, y], i, kept) => (i === 0 ? 0 : length + Math.hypot(x - kept[i - 1][0], y - kept[i - 1][1])), 0);

/*
  The double blue line (the marquee's, and on project pages under the hero), measured from the
  home page's Figma render (its marquee section starts at y 2878): the centre of the upper 7px line every
  40px. The lower line is the same curve, 4px to the right and 14px lower (as in Figma).
  Both ends run on past the frame, so the lines go edge to edge on wide screens too.
*/
export const DOUBLE_LINE_POINTS: [number, number][] = [
  [-800, 3520], [-400, 3480], [-90, 3378], [0, 3288], [40, 3257.5], [80, 3234], [120, 3215],
  [160, 3202], [200, 3195.5], [240, 3194.5], [280, 3196.5], [320, 3200], [360, 3204.5],
  [400, 3208.5], [440, 3212.5], [480, 3216.5], [520, 3218.5], [560, 3218.5], [600, 3215],
  [640, 3207.5], [680, 3198.5], [720, 3188.5], [760, 3178.5], [800, 3169], [840, 3161],
  [880, 3155], [920, 3155.5], [960, 3159.5], [1000, 3166], [1040, 3173.5], [1080, 3181],
  [1120, 3188], [1160, 3193.5], [1200, 3196.5], [1240, 3194.5], [1280, 3187.5], [1320, 3177.5],
  [1360, 3166], [1400, 3153.5], [1534, 3118], [1800, 3060], [2240, 3040],
];
export const DOUBLE_LINE_LOWER = { x: 4, y: 14 };
