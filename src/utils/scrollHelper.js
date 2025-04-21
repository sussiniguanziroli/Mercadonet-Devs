// utils/scrollHelper.js
export const scrollToTop = () => {
    // Opción 1: Usar `scrollIntoView` (más confiable en algunos navegadores)
    document.documentElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  
    // Opción 2: Alternativa con polyfill para Safari/Edge antiguos
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Fallback para navegadores sin soporte nativo
      const duration = 300;
      const start = window.pageYOffset;
      const startTime = performance.now();
  
      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, start * (1 - progress));
        if (progress < 1) requestAnimationFrame(animateScroll);
      };
      requestAnimationFrame(animateScroll);
    }
  };