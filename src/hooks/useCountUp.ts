import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to a target value over a given duration
 * using requestAnimationFrame with ease-out easing.
 *
 * Resets and re-animates whenever `target` changes.
 */
export function useCountUp(target: number, duration: number = 1000): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset on target change
    setCurrent(0);
    startTimeRef.current = null;

    if (target === 0) return;

    function animate(timestamp: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out: decelerate towards the end (1 - (1 - t)^3)
      const eased = 1 - Math.pow(1 - progress, 3);

      setCurrent(eased * target);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration]);

  return current;
}
