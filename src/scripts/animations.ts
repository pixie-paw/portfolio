import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Site-wide animations. Mark elements in your .astro files with data attributes:
 *   data-split        → text reveals line by line / word by word on load
 *   data-reveal       → fades and slides up when scrolled into view
 *   data-parallax="n" → moves at a different speed while scrolling (n = strength, e.g. 0.2)
 *
 * Everything sits inside gsap.matchMedia so visitors who ask for reduced motion
 * get the content without the movement.
 */
export function initAnimations() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      SplitText.create(el, {
        type: 'words,chars',
        mask: 'words',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 110,
            duration: 0.8,
            ease: 'expo.out',
            stagger: 0.025,
          }),
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 40,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
      const strength = Number(el.dataset.parallax) || 0.2;
      gsap.to(el, {
        yPercent: -100 * strength,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });
}
