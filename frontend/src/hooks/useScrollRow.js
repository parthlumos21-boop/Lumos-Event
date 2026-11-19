import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Enhanced custom hook to manage horizontal scroll rows with:
 * - Left/Right button navigation
 * - Auto-scroll carousel (scrolls left-to-right and right-to-left automatically every 2-3s)
 * - Wheel-to-horizontal scrolling (scroll wheel changes cards smoothly)
 * - Mouse drag-to-swipe and touch swipe handling
 * - Edge boundaries and active progress tracking
 *
 * @param {number} scrollAmount - Pixels to scroll on each step (default 340)
 * @param {object} options - Configuration options { autoPlay, autoPlayInterval, pauseOnHover }
 */
export const useScrollRow = (scrollAmount = 340, options = {}) => {
  const {
    autoPlay = false,
    autoPlayInterval = 2800, // 2.8s (within the requested 2-3 seconds window)
    pauseOnHover = true,
  } = options;

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Direction: 1 = scrolling forward (left to right), -1 = scrolling backward (right to left)
  const directionRef = useRef(1);
  const isPausedRef = useRef(false);
  const pauseTimeoutRef = useRef(null);

  // Drag coordinates ref to avoid stale state in event listeners
  const dragInfo = useRef({
    isDown: false,
    startX: 0,
    scrollLeftStart: 0,
    hasMoved: false,
  });

  const checkScrollBounds = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Temporary pause helper when user clicks arrows or manually swipes
  const pauseAutoPlayTemporarily = useCallback((ms = 3200) => {
    isPausedRef.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, ms);
  }, []);

  // 1. Scroll and wheel listeners
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollBounds();
    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds, { passive: true });

    // Smooth wheel-to-horizontal scroll
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const isAtLeft = el.scrollLeft <= 5 && e.deltaY < 0;
        const isAtRight = el.scrollLeft >= el.scrollWidth - el.clientWidth - 5 && e.deltaY > 0;

        // If not at the boundary, scroll cards horizontally
        if (!isAtLeft && !isAtRight) {
          e.preventDefault();
          el.scrollBy({ left: e.deltaY * 1.5, behavior: 'auto' });
          pauseAutoPlayTemporarily(3500);
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
      el.removeEventListener('wheel', handleWheel);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [checkScrollBounds, pauseAutoPlayTemporarily]);

  // 2. Automatic back-and-forth scrolling (Left-to-Right & Right-to-Left every 2-3s)
  useEffect(() => {
    if (!autoPlay) return;

    const intervalId = setInterval(() => {
      const el = scrollRef.current;
      if (!el || isPausedRef.current || dragInfo.current.isDown) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;

      if (maxScroll <= 0) return;

      if (directionRef.current === 1) {
        // Scrolling forward (left to right)
        if (scrollLeft >= maxScroll - 20) {
          // Reached right end -> reverse direction to right-to-left
          directionRef.current = -1;
          el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
        // Scrolling backward (right to left)
        if (scrollLeft <= 20) {
          // Reached left end -> reverse direction to left-to-right
          directionRef.current = 1;
          el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    }, autoPlayInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoPlay, autoPlayInterval, scrollAmount]);

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      directionRef.current = -1;
      pauseAutoPlayTemporarily(3500);
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }, [scrollAmount, pauseAutoPlayTemporarily]);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      directionRef.current = 1;
      pauseAutoPlayTemporarily(3500);
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, [scrollAmount, pauseAutoPlayTemporarily]);

  // Mouse drag / swipe event handlers
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0 || !scrollRef.current) return;
    pauseAutoPlayTemporarily(4000);
    dragInfo.current = {
      isDown: true,
      startX: e.pageX - scrollRef.current.offsetLeft,
      scrollLeftStart: scrollRef.current.scrollLeft,
      hasMoved: false,
    };
    setIsDragging(true);
  }, [pauseAutoPlayTemporarily]);

  const handleMouseMove = useCallback((e) => {
    if (!dragInfo.current.isDown || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragInfo.current.startX) * 1.4;
    if (Math.abs(walk) > 4) {
      dragInfo.current.hasMoved = true;
    }
    scrollRef.current.scrollLeft = dragInfo.current.scrollLeftStart - walk;
  }, []);

  const handleMouseUpOrLeave = useCallback(() => {
    dragInfo.current.isDown = false;
    setIsDragging(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) isPausedRef.current = true;
  }, [pauseOnHover]);

  const handleContainerMouseLeave = useCallback(() => {
    dragInfo.current.isDown = false;
    setIsDragging(false);
    if (pauseOnHover) isPausedRef.current = false;
  }, [pauseOnHover]);

  const handleTouchStart = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    pauseAutoPlayTemporarily(3000);
  }, [pauseAutoPlayTemporarily]);

  const dragProps = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUpOrLeave,
    onMouseLeave: handleContainerMouseLeave,
    onMouseEnter: handleMouseEnter,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    isDragging,
    dragProps,
  };
};

export default useScrollRow;
