import { useCallback } from 'react';

interface SmoothScrollOptions {
  offset?: number;
  duration?: number;
  easing?: 'linear' | 'easeInOut' | 'easeOut' | 'easeIn';
}

const easingFunctions = {
  linear: (t: number) => t,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: (t: number) => t * (2 - t),
  easeIn: (t: number) => t * t,
};

export function useSmoothScroll(options: SmoothScrollOptions = {}) {
  const { offset = 80, duration = 800, easing = 'easeInOut' } = options;

  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const easingFn = easingFunctions[easing];

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easingFn(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }, [offset, duration, easing]);

  const scrollToTop = useCallback(() => {
    const startPosition = window.scrollY;
    let startTime: number | null = null;

    const easingFn = easingFunctions[easing];

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easingFn(progress);

      window.scrollTo(0, startPosition * (1 - easedProgress));

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }, [duration, easing]);

  return { scrollToElement, scrollToTop };
}

// Utility function for one-off smooth scrolling
export function smoothScrollTo(elementId: string, offset = 80) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
}

export default useSmoothScroll;
