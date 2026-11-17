import React, { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';

/**
 * Reusable, lightweight ScrollReveal component.
 * Uses native IntersectionObserver with GPU-accelerated CSS transitions.
 * Cross-browser supported and automatically unobserves once revealed (0 idle CPU).
 */
export const ScrollReveal = ({
  children,
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'none'
  delay = 0,
  threshold = 0.12,
  className = '',
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const currentEl = ref.current;
    if (!currentEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentEl);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(currentEl);

    return () => {
      if (currentEl) observer.unobserve(currentEl);
      observer.disconnect();
    };
  }, [threshold]);

  const getHiddenTransform = () => {
    switch (direction) {
      case 'up':
        return 'translate-y-8';
      case 'down':
        return '-translate-y-8';
      case 'left':
        return 'translate-x-8';
      case 'right':
        return '-translate-x-8';
      case 'none':
        return 'scale-[0.98]';
      default:
        return 'translate-y-8';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      className={clsx(
        'transition-all duration-700 ease-out will-change-[transform,opacity]',
        isVisible
          ? 'opacity-100 translate-y-0 translate-x-0 scale-100'
          : `opacity-0 ${getHiddenTransform()}`,
        className
      )}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
