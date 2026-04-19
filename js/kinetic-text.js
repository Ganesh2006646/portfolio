/* =========================================
   KINETIC TEXT REVEALS
   GSAP + SplitType — Masked Typography
   ========================================= */

(function () {
  'use strict';

  // Wait for GSAP and SplitType to be available
  if (typeof gsap === 'undefined' || typeof SplitType === 'undefined') {
    console.warn('[KineticText] GSAP or SplitType not loaded.');
    return;
  }

  // Register ScrollTrigger if available
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* --- Custom ease matching the requested cubic-bezier(0.19, 1, 0.22, 1) --- */
  // This is equivalent to "power4.out" in GSAP
  const EASE = 'power4.out';
  const CHAR_STAGGER = 0.02;
  const DURATION = 1.2;

  /* --- Helper: Apply SplitType and create masked reveals --- */
  function createKineticReveal(element, options = {}) {
    const {
      triggerType = 'scroll', // 'immediate' or 'scroll'
      delay = 0,
    } = options;

    // Skip if already processed
    if (element.dataset.kineticReady) return;
    element.dataset.kineticReady = 'true';

    // Store original for accessibility
    const originalText = element.textContent;

    // SplitType splits into lines, words, chars
    const split = new SplitType(element, {
      types: 'lines,chars',
      tagName: 'span',
    });

    // Wrap each line in an overflow:hidden mask
    if (split.lines) {
      split.lines.forEach((line) => {
        const mask = document.createElement('div');
        mask.classList.add('kinetic-line-mask');
        mask.style.overflow = 'hidden';
        mask.style.display = 'block';
        // Slight padding to prevent clipping of descenders
        mask.style.paddingBottom = '0.08em';
        mask.style.paddingTop = '0.02em';
        line.parentNode.insertBefore(mask, line);
        mask.appendChild(line);
      });
    }

    // Set initial state — chars hidden below mask
    gsap.set(split.chars, {
      yPercent: 110,
      opacity: 0,
    });

    // Create the animation
    const tl = gsap.timeline({ paused: true });
    tl.to(split.chars, {
      yPercent: 0,
      opacity: 1,
      duration: DURATION,
      ease: EASE,
      stagger: CHAR_STAGGER,
    });

    if (triggerType === 'immediate') {
      // For hero title — play after a delay (loader finish)
      setTimeout(() => tl.play(), delay);
    } else if (triggerType === 'scroll' && typeof ScrollTrigger !== 'undefined') {
      // For section headings — trigger on scroll
      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        once: true,
        onEnter: () => tl.play(),
      });
    }

    // Accessibility
    element.setAttribute('aria-label', originalText);

    return { split, tl };
  }

  /* --- Initialize --- */
  function init() {
    // Detect if this is a transition arrival (loader hidden) vs first visit
    const loader = document.querySelector('.loader');
    const isTransitionArrival = loader && loader.style.display === 'none';
    const hasVisibleLoader = loader && loader.style.display !== 'none';

    // 1. Hero title — immediate (after loader)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      // Transition arrival: short delay (lift animation ~1.1s from DOMContentLoaded)
      // First visit with loader: long delay (loader ~2.8s)
      // No loader: short delay
      const delay = isTransitionArrival ? 800 : hasVisibleLoader ? 2800 : 400;
      createKineticReveal(heroTitle, {
        triggerType: 'immediate',
        delay: delay,
      });
    }

    // 2. Hero subtitle — fade in after title
    const heroSub = document.querySelector('.hero-subtitle');
    if (heroSub) {
      const subDelay = isTransitionArrival ? 1400 : hasVisibleLoader ? 3600 : 1000;
      gsap.set(heroSub, { opacity: 0, y: 30 });
      setTimeout(() => {
        gsap.to(heroSub, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: EASE,
        });
      }, subDelay);
    }

    // 3. Section headings — scroll-triggered
    document.querySelectorAll('.section-title').forEach((el) => {
      createKineticReveal(el, { triggerType: 'scroll' });
    });

    // 4. Section head h2 elements (if any)
    document.querySelectorAll('.section-head h2').forEach((el) => {
      createKineticReveal(el, { triggerType: 'scroll' });
    });
  }

  /* --- Run on DOMContentLoaded or immediately if already loaded --- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to let other scripts initialize
    setTimeout(init, 50);
  }

})();
