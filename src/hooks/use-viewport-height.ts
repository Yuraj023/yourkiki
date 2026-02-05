import { useEffect } from 'react';

export function useViewportHeight() {
  useEffect(() => {
    // Function to set the actual viewport height
    const setVH = () => {
      // Get the visual viewport height (stays constant when keyboard appears)
      const vh = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    };

    // Set initial value
    setVH();

    // Update on resize, but not when keyboard appears
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVH);
    } else {
      window.addEventListener('resize', setVH);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setVH);
      } else {
        window.removeEventListener('resize', setVH);
      }
    };
  }, []);
}
