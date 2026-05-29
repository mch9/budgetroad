'use client';

import { useEffect, useRef } from 'react';

/* Fade-up on scroll. SSR/no-JS renders fully visible; on mount we hide (below-fold,
   so no visible flash) then reveal on intersection. Imperative (no setState in effect),
   inline transform/opacity (no Tailwind purge risk). Respects reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.style.transitionDelay = `${delay}ms`;
    el.style.transform = 'translateY(16px)';
    el.style.opacity = '0';

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transform = '';
          el.style.opacity = '';
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${className}`}>
      {children}
    </div>
  );
}
