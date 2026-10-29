'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * Pure TypeScript + Tailwind SpotlightCard based on React Bits SpotlightCard-TS-TW.
 * Features:
 * - Zero runtime animation dependencies (no Framer Motion, GSAP, Three.js)
 * - Strict touch dormancy (touch devices do not trigger expensive pointer tracking)
 * - Full prefers-reduced-motion compliance
 * - Hardware-accelerated CSS custom variable updates to avoid React re-renders
 */
export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(8, 127, 219, 0.12)',
  ...props
}: SpotlightCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [supportsHover, setSupportsHover] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    // Only enable hover tracking on real pointing devices with fine hover capabilities
    const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
    setSupportsHover(hoverMedia.matches);

    const handleHoverChange = (e: MediaQueryListEvent) => setSupportsHover(e.matches);
    hoverMedia.addEventListener('change', handleHoverChange);

    // Reduced motion media query
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionMedia.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionMedia.addEventListener('change', handleMotionChange);

    return () => {
      hoverMedia.removeEventListener('change', handleHoverChange);
      motionMedia.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Touch events or devices without fine hover should remain dormant
      if (!supportsHover || prefersReducedMotion || e.pointerType !== 'mouse') return;

      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--spotlight-x', `${x}px`);
      card.style.setProperty('--spotlight-y', `${y}px`);
    },
    [supportsHover, prefersReducedMotion]
  );

  const handleMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (supportsHover && !prefersReducedMotion) {
        setIsHovered(true);
      }
    },
    [supportsHover, prefersReducedMotion]
  );

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xs transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {supportsHover && !prefersReducedMotion && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(400px circle at var(--spotlight-x, 0px) var(--spotlight-y, 0px), ${spotlightColor}, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
