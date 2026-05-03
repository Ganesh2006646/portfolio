/* =========================================
   SCROLL-DRIVEN 3D EFFECTS ENGINE
   GSAP ScrollTrigger — Cinematic Depth
   =========================================
   Effects:
   1. Hero → About: 3D text explosion + perspective tilt
   2. Tech Stack: Scroll-linked orbital speed
   3. Impact Cards: 3D conveyor belt depth
   4. Section Transitions: 3D perspective wipes
   5. Scroll Velocity: Reactive parallax & blur
   ========================================= */

(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Skip on mobile for performance
  if (window.innerWidth <= 768) return;

  /* ==========================================
     1. HERO 3D TEXT EXPLOSION
     As user scrolls past hero, letters spread
     apart along Z-axis with rotation.
     ========================================== */
  function initHero3DExplosion() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSub = document.querySelector('.hero-subtitle');
    const heroActions = document.getElementById('heroActions');
    const hero = document.getElementById('hero');
    if (!heroTitle || !hero) return;

    // Set perspective on the hero container
    gsap.set(hero, {
      perspective: 1200,
      perspectiveOrigin: '50% 50%',
    });

    // Get all chars from kinetic-text split (or create word-level animation)
    const chars = heroTitle.querySelectorAll('.char, span span');
    if (chars.length > 0) {
      gsap.to(chars, {
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
        z: () => gsap.utils.random(-200, 200),
        rotationX: () => gsap.utils.random(-25, 25),
        rotationY: () => gsap.utils.random(-30, 30),
        opacity: 0,
        scale: 0.8,
        stagger: 0.02,
        ease: 'power2.in',
      });
    }

    // Subtitle and actions fade with depth
    if (heroSub) {
      gsap.to(heroSub, {
        scrollTrigger: {
          trigger: hero,
          start: '10% top',
          end: '60% top',
          scrub: 1,
        },
        y: -80,
        z: -100,
        opacity: 0,
        ease: 'power2.in',
      });
    }

    if (heroActions) {
      gsap.to(heroActions, {
        scrollTrigger: {
          trigger: hero,
          start: '10% top',
          end: '50% top',
          scrub: 1,
        },
        y: -60,
        opacity: 0,
        scale: 0.9,
        ease: 'power2.in',
      });
    }
  }

  /* ==========================================
     2. ABOUT SECTION — Perspective Tilt Reveal
     Section rises up with 3D perspective tilt,
     like flying into the content.
     ========================================== */
  function initAboutPerspective() {
    const about = document.getElementById('about');
    if (!about) return;

    gsap.set(about, {
      transformPerspective: 1200,
      transformOrigin: '50% 0%',
    });

    gsap.from(about, {
      scrollTrigger: {
        trigger: about,
        start: 'top 90%',
        end: 'top 30%',
        scrub: 1.2,
      },
      rotationX: 8,
      y: 80,
      scale: 0.96,
      ease: 'power3.out',
    });

    // NOTE: Bento grid items use CSS .reveal-* transitions.
    // A GSAP .from() here conflicts with the CSS transforms (like translateX for reveal-right)
    // and causes elements to freeze in an overlapping state. Handled natively by CSS instead.
  }

  /* ==========================================
     3. TECH STACK — Scroll-Activated Orbital Speed
     Integrates with existing techstack.js to
     control orbital speed based on scroll velocity.
     ========================================== */
  function initTechStackScroll() {
    const arsenal = document.getElementById('arsenal');
    if (!arsenal) return;

    // Legend pills assembly — scatter and assemble on scroll
    const pills = arsenal.querySelectorAll('.legend-pill');
    if (pills.length > 0) {
      gsap.from(pills, {
        scrollTrigger: {
          trigger: arsenal,
          start: 'top 95%',
          end: 'top 30%',
          scrub: 1,
        },
        x: () => gsap.utils.random(-200, 200),
        y: () => gsap.utils.random(-100, 100),
        rotation: () => gsap.utils.random(-45, 45),
        scale: 0.5,
        stagger: 0.04,
        ease: 'back.out(1.7)',
      });
    }

    // Apply perspective tilt to the canvas wrapper
    const canvasWrap = arsenal.querySelector('.techstack-canvas-wrapper');
    if (canvasWrap) {
      gsap.set(canvasWrap, {
        transformPerspective: 1000,
        transformOrigin: '50% 50%',
      });

      // Subtle parallax on the 3D canvas
      gsap.fromTo(canvasWrap, {
        rotationX: 5,
        y: 60,
      }, {
        scrollTrigger: {
          trigger: arsenal,
          start: 'top 85%',
          end: 'center center',
          scrub: 1.5,
        },
        rotationX: 0,
        y: 0,
        ease: 'power2.out',
      });
    }
    // Velocity tracking is now centralized in initScrollVelocity
  }

  /* ==========================================
     4. IMPACT CARDS — 3D Conveyor Belt Depth
     Cards closer to viewport center are flat;
     cards above/below are tilted with depth blur.
     ========================================== */
  function initImpactCards3D() {
    const cards = document.querySelectorAll('.impact-card');
    if (!cards.length) return;

    cards.forEach((card, i) => {
      gsap.set(card, {
        transformPerspective: 800,
        transformOrigin: '50% 50%',
      });

      // Each card has its own ScrollTrigger for continuous 3D tilt
      ScrollTrigger.create({
        trigger: card,
        start: 'top 90%',
        end: 'bottom 10%',
        onUpdate: (self) => {
          // Progress 0 = just entering, 0.5 = center of viewport, 1 = exiting
          const progress = self.progress;
          const centerOffset = (progress - 0.5) * 2; // -1 to 1

          // Tilt away from center
          const rotateX = centerOffset * 8;
          const rotateY = (i % 2 === 0 ? 1 : -1) * centerOffset * 4;
          const translateZ = -Math.abs(centerOffset) * 40;
          const blur = Math.abs(centerOffset) * 1.5;

          gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            z: translateZ,
            filter: `blur(${blur}px)`,
            duration: 0.4,
            ease: 'power1.out',
            overwrite: 'auto',
          });
        },
        onLeave: () => {
          gsap.to(card, { rotationX: 0, rotationY: 0, z: 0, filter: 'blur(0px)', duration: 0.6 });
        },
        onLeaveBack: () => {
          gsap.to(card, { rotationX: 0, rotationY: 0, z: 0, filter: 'blur(0px)', duration: 0.6 });
        },
      });
    });
  }

  /* ==========================================
     5. COMPETE CARDS — Staggered 3D Cascade
     Timeline cards swing in from the side
     with 3D rotation as they enter viewport.
     ========================================== */
  function initCompeteCards3D() {
    // NOTE:
    // This section already uses CSS-based reveal animations.
    // A GSAP `.from()` with opacity can override those styles and
    // cause cards to remain invisible (especially on anchor jumps).
    // Keep this function intentionally empty for stability.
    return;
  }

  /* ==========================================
     6. EXPERIENCE & RECOGNITION — Depth Float
     Cards float up from below with Z-depth
     ========================================== */
  function initExperienceDepth() {
    // NOTE:
    // Experience/Recognition cards also use CSS reveal animations.
    // Avoid GSAP `.from()` opacity here to prevent invisible content.
    return;
  }

  /* ==========================================
     7. SECTION DIVIDERS — 3D Line Reveal
     Section dividers draw with depth rotation
     ========================================== */
  function initDividers3D() {
    const dividers = document.querySelectorAll('.section-divider');
    dividers.forEach((div) => {
      gsap.set(div, {
        transformPerspective: 600,
        transformOrigin: '0% 50%',
      });

      gsap.from(div, {
        scrollTrigger: {
          trigger: div,
          start: 'top 85%',
          end: 'top 65%',
          scrub: 0.8,
        },
        scaleX: 0,
        rotationY: 15,
        opacity: 0,
        ease: 'power4.out',
      });
    });
  }

  /* ==========================================
     8. SCROLL VELOCITY EFFECTS
     - Fast scroll = stronger parallax, text blur
     - Slow scroll = sharp and detailed
     - Scroll stop = settle bounce on elements
     ========================================== */
  function initScrollVelocity() {
    let targetVelocity = 0;
    let smoothVelocity = 0;

    // Track global scroll velocity cleanly
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        targetVelocity = Math.abs(self.getVelocity());
      },
    });

    const marquee = document.getElementById('marquee');

    // Use GSAP ticker to smoothly decay velocity even when scrolling stops completely
    gsap.ticker.add(() => {
      // Smooth interpolation
      smoothVelocity += (targetVelocity - smoothVelocity) * 0.1;
      // Decay target velocity
      targetVelocity *= 0.9;

      // 1. Expose to techstack.js for orbital speed
      window.__SCROLL_SPEED__ = Math.min(smoothVelocity / 1000, 5);

      // 2. CSS property for potential UI reactivity
      const normalizedSpeed = Math.min(smoothVelocity / 3000, 1);
      document.documentElement.style.setProperty('--scroll-speed', normalizedSpeed);

      // 3. Marquee dynamic duration
      if (marquee) {
        const duration = Math.max(8, 25 - (smoothVelocity / 500) * 3);
        marquee.style.animationDuration = duration + 's';
      }
    });
  }

  /* ==========================================
     9. WORK PAGE — Project Cards 3D Depth
     For work.html project cards
     ========================================== */
  function initWorkPageCards3D() {
    const workItems = document.querySelectorAll('.work-item');
    if (!workItems.length) return;

    workItems.forEach((item, i) => {
      // Continuous 3D tilt based on scroll position
      const image = item.querySelector('.work-item-image');
      if (image) {
        gsap.set(image, {
          transformPerspective: 800,
          transformOrigin: '50% 50%',
        });

        ScrollTrigger.create({
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const offset = (self.progress - 0.5) * 2;
            gsap.to(image, {
              rotationY: offset * 5,
              rotationX: offset * -3,
              z: -Math.abs(offset) * 20,
              duration: 0.5,
              ease: 'power1.out',
              overwrite: 'auto',
            });
          },
        });
      }
    });
  }

  /* ==========================================
     10. MARQUEE — Scroll-Speed Reactive
     Marquee speeds up with scroll velocity
     ========================================== */
  // (Marquee velocity handled inside initScrollVelocity)

  /* ==========================================
     MASTER INIT
     ========================================== */
  function masterInit() {
    // Detect which page we're on
    const isHomePage = !!document.getElementById('hero');
    const isWorkPage = document.body.classList.contains('work-theme');

    if (isHomePage) {
      initHero3DExplosion();
      initAboutPerspective();
      initTechStackScroll();
      initImpactCards3D();
      initCompeteCards3D();
      initExperienceDepth();
      initDividers3D();
      // initMarqueeScrollReactive() removed; logic is in initScrollVelocity
    }

    if (isWorkPage) {
      initWorkPageCards3D();
    }

    // Global effects (both pages)
    initScrollVelocity();
  }

  // Run after DOM is ready + a short delay for other scripts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(masterInit, 200));
  } else {
    setTimeout(masterInit, 200);
  }

})();
