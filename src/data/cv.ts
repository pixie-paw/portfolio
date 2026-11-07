import fs from 'node:fs';
import path from 'node:path';

/*
  Irina's CV, as a PDF in the public folder. The footer's DOWNLOAD CV and the About me page's
  CHECK MY CV both link to it.

  hasCv() checks whether the file is there. It's a function, not a value worked out once, so
  the dev server checks again on every page load: a PDF added while it's running shows up
  without a restart.
*/
export const CV_FILE = 'irina-moldovan-cv.pdf';
export const hasCv = () => fs.existsSync(path.join(process.cwd(), 'public', CV_FILE));
