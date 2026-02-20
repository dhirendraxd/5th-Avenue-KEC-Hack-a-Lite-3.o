import { useState, useEffect, useCallback } from 'react';

interface ParallaxValues {
  scrollY: number;
  offsetY: (speed: number) => number;
  opacity: (fadeStart: number, fadeEnd: number) => number;
  scale: (baseScale: number, scrollScale: number) => number;
}

export const useParallax = (): ParallaxValues => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const offsetY = useCallback((speed: number) => {
    return scrollY * speed;
  }, [scrollY]);

  const opacity = useCallback((fadeStart: number, fadeEnd: number) => {
    if (scrollY < fadeStart) return 1;
    if (scrollY > fadeEnd) return 0;
    return 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
  }, [scrollY]);

  const scale = useCallback((baseScale: number, scrollScale: number) => {
    return baseScale + (scrollY * scrollScale);
  }, [scrollY]);

  return { scrollY, offsetY, opacity, scale };
};
