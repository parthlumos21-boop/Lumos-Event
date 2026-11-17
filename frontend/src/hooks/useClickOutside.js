import { useEffect } from 'react';

/**
 * Custom hook to detect clicks outside a referenced element and listen for the Escape key.
 *
 * @param {React.RefObject} ref - The element ref to monitor
 * @param {Function} handler - Callback to execute when click outside or Escape occurs
 * @param {boolean} active - Whether the listeners should currently be active
 */
export const useClickOutside = (ref, handler, active = true) => {
  useEffect(() => {
    if (!active) return;

    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handler(event);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, handler, active]);
};

export default useClickOutside;
