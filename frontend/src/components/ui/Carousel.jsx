import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Generic auto-advancing carousel. Framework-agnostic beyond React + lucide —
 * drop it around any array of slide nodes. Built for the hero, but nothing
 * here is hero-specific, so it's reusable for testimonials, promo banners,
 * or the "browse by specialty" rail.
 *
 * Props:
 *  - slides: React.ReactNode[]        required
 *  - autoPlay: boolean                default true
 *  - intervalMs: number                default 6000
 *  - showDots: boolean                 default true
 *  - showArrows: boolean               default true
 *  - pauseOnHover: boolean             default true
 *  - onSlideChange: (index) => void    optional
 *  - className: string                 optional, applied to the outer region
 */
const Carousel = ({
  slides,
  autoPlay = true,
  intervalMs = 6000,
  showDots = true,
  showArrows = true,
  pauseOnHover = true,
  onSlideChange,
  className = '',
}) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const prefersReducedMotion = useRef(false);
  const count = slides.length;

  useEffect(() => {
    prefersReducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const goTo = useCallback(
    (next) => {
      const wrapped = ((next % count) + count) % count;
      setIndex(wrapped);
      onSlideChange?.(wrapped);
    },
    [count, onSlideChange]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!autoPlay || paused || count <= 1 || prefersReducedMotion.current) return undefined;
    const id = window.setInterval(() => goTo(index + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [autoPlay, paused, count, intervalMs, index, goTo]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) (delta < 0 ? next() : prev());
    touchStartX.current = null;
  };

  return (
    <div
      className={`relative ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Highlights"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      onFocus={() => pauseOnHover && setPaused(true)}
      onBlur={() => pauseOnHover && setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="w-full shrink-0"
              aria-hidden={i !== index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 sm:-translate-x-3"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 sm:translate-x-3"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {showDots && count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2 sm:justify-start">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${
                i === index ? 'w-6 bg-amber-300' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;