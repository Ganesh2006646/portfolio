/* =========================================
   PORTFOLIO — Main JavaScript
   Rich scroll animations, parallax, cursor,
   loader, page transitions, and interactions
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initLoader();
  initNavigation();
  initScrollReveal();
  // initSplitText(); — Replaced by GSAP kinetic-text.js
  initCountUp();
  initHeroAnimation();
  initMarquee();
  initMagneticButtons();
  initContactForm();
  initWorkPage();
  initSmoothScroll();
  initTopBar();

  /* Consolidated scroll loop — single rAF-driven handler
     replaces multiple independent scroll listeners */
  initScrollLoop();
});

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function signalEntryReady() {
  if (window.__PORTFOLIO_ENTRY_READY) return;
  window.__PORTFOLIO_ENTRY_READY = true;
  document.body?.classList.add('entry-ready');
  document.dispatchEvent(new Event('portfolio:entry-ready'));
}

/* ==========================================
   CUSTOM CURSOR
   ========================================== */
function initCursor() {
  const cursor = document.querySelector('.cursor');
  const cursorDot = document.querySelector('.cursor-dot');
  if (!cursor || !cursorDot) return;
  if (prefersReducedMotion()) return;
  if (window.innerWidth <= 768) return;

  // Activate cursor-none only when JS is running and cursor elements exist
  document.body.classList.add('cursor-active');

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let dotX = 0, dotY = 0;

  // Smooth sensitivity — tuned for smoke & gas ball feel
  // Lower values = more drift/lag (smoky), higher = snappier
  const RING_LERP = 0.045;  // outer smoke — heavy drift
  const DOT_LERP = 0.12;    // gas core — soft but responsive

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    // Smooth interpolation (lerp)
    ringX += (mouseX - ringX) * RING_LERP;
    ringY += (mouseY - ringY) * RING_LERP;
    cursor.style.left = ringX + 'px';
    cursor.style.top = ringY + 'px';

    dotX += (mouseX - dotX) * DOT_LERP;
    dotY += (mouseY - dotY) * DOT_LERP;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Click feedback
  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

  // Hover effect on interactive elements
  const hoverEls = document.querySelectorAll(
    'a, button, .project-card, .service-card, .collab-radio label, ' +
    '.submit-btn, .arsenal-tag, .impact-card, .compete-card, .experience-card, ' +
    '.recognition-card, .nav-link, .logo, input, textarea'
  );
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Spotlight effect for profile image wrapper
  const profileWrapper = document.getElementById('profileImageWrapper');
  if (profileWrapper) {
    profileWrapper.addEventListener('mousemove', (e) => {
      const rect = profileWrapper.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      profileWrapper.style.setProperty('--mouse-x', `${x}%`);
      profileWrapper.style.setProperty('--mouse-y', `${y}%`);
    });
    // Reset to center when mouse leaves
    profileWrapper.addEventListener('mouseleave', () => {
      profileWrapper.style.setProperty('--mouse-x', '50%');
      profileWrapper.style.setProperty('--mouse-y', '50%');
    });
  }
}

/* ==========================================
   LOADING SCREEN
   ========================================== */
function initLoader() {
  const loader = document.querySelector('.loader');
  const incomingRoute = sessionStorage.getItem('incomingRoute');

  if (prefersReducedMotion()) {
    sessionStorage.removeItem('incomingRoute');
    if (loader) {
      loader.classList.add('hidden');
      loader.style.display = 'none';
    }
    document.body.style.overflow = '';
    triggerEntryAnimations();
    signalEntryReady();
    return;
  }

  // ---- Incoming page transition (arriving from another page) ----
  if (incomingRoute) {
    sessionStorage.removeItem('incomingRoute');

    // Hide the default loader — the transition overlay handles the reveal
    if (loader) loader.style.display = 'none';
    document.body.style.overflow = 'hidden';

    const pt = document.getElementById('pageTransition');
    if (pt) {
      const label = pt.querySelector('.route-name');
      if (label && incomingRoute !== 'None') label.textContent = incomingRoute;

      // Step 1: Bars start covering the viewport (instantly)
      pt.classList.add('covering');

      // Step 2: After a brief settle (let the new page render), lift the bars
      setTimeout(() => {
        pt.classList.remove('covering');
        pt.classList.add('active-in');

        // Step 3: After the lift animation finishes, clean up
        // Animation: 0.36s + stagger(0.16s) + buffer
        setTimeout(() => {
          pt.classList.remove('active-in');
          document.body.style.overflow = '';
          triggerEntryAnimations();
          signalEntryReady();
        }, 600);
      }, 120);
    } else {
      document.body.style.overflow = '';
      triggerEntryAnimations();
      signalEntryReady();
    }
    return;
  }

  // ---- Normal first-visit loader (no transition) ----
  if (!loader) return;

  // Circular text
  const circularText = document.querySelector('.circular-text');
  if (circularText) {
    const text = "hello • hola • bonjour • ciao • hey • ";
    const chars = text.split('');
    const radius = 100;
    circularText.innerHTML = '';
    chars.forEach((c, i) => {
      const span = document.createElement('span');
      span.textContent = c;
      span.style.transform = `rotate(${(i / chars.length) * 360}deg)`;
      span.style.transformOrigin = `0 ${radius}px`;
      circularText.appendChild(span);
    });
  }

  // Counter
  const counter = document.querySelector('.loader-counter');
  if (counter) {
    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 20) + 10;
      if (count >= 100) {
        count = 100;
        clearInterval(interval);
        setTimeout(() => {
          loader.classList.add('hidden');
          document.body.style.overflow = '';
          setTimeout(() => {
            triggerEntryAnimations();
            signalEntryReady();
          }, 150);
        }, 200);
      }
      counter.textContent = count + '%';
    }, 60);
  } else {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      setTimeout(() => {
        triggerEntryAnimations();
        signalEntryReady();
      }, 150);
    }, 1200);
  }

  document.body.style.overflow = 'hidden';
}

/* ==========================================
   ENTRY ANIMATIONS (after loader)
   ========================================== */
function triggerEntryAnimations() {
  // Hero title & subtitle are now handled by kinetic-text.js (GSAP)
  // Work page title words
  document.querySelectorAll('.work-page-title .word span').forEach((s, i) => {
    setTimeout(() => s.classList.add('visible'), i * 80);
  });
}

function initHeroAnimation() {
  if (!document.querySelector('.loader')) {
    setTimeout(() => {
      triggerEntryAnimations();
      signalEntryReady();
    }, 200);
  }
}

/* ==========================================
   SCROLL REVEAL — Intersection Observer
   Handles all .reveal-* and .stagger-children
   ========================================== */
function initScrollReveal() {
  const selectors = [
    '.reveal', '.reveal-left', '.reveal-right',
    '.reveal-scale', '.reveal-rotate', '.reveal-blur',
    '.reveal-clip', '.reveal-clip-left',
    '.reveal-bounce', '.reveal-lines',
    '.stagger-children', '.image-reveal',
    '.scroll-line-reveal',
    // '.split-text' — Now handled by GSAP kinetic-text.js
    '.work-item'
  ].join(',');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll(selectors).forEach(el => observer.observe(el));
}

/* ==========================================
   CONSOLIDATED SCROLL LOOP
   Single requestAnimationFrame-driven handler
   replaces parallax, hero parallax, scroll
   progress, header scrolled, and top-bar
   ========================================== */
function initScrollLoop() {
  // Cache all elements once
  const parallaxLayers = document.querySelectorAll('.parallax-layer');
  const heroTitle = document.querySelector('.hero-title');
  const heroSub = document.querySelector('.hero-subtitle');
  const scrollInd = document.querySelector('.hero-scroll-indicator');
  const progressBar = document.querySelector('.work-progress-bar .fill');
  const header = document.querySelector('.header');
  const topBar = document.querySelector('.top-bar');

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const wh = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - wh;

      // Parallax depth layers
      parallaxLayers.forEach(layer => {
        const speed = parseFloat(getComputedStyle(layer).getPropertyValue('--parallax-speed')) || 0.05;
        const rect = layer.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const offset = (wh / 2 - centerY) * speed;
        layer.style.transform = `translateY(${offset}px)`;
      });

      // Hero parallax on scroll
      if (heroTitle && scrollY < wh) {
        heroTitle.style.transform = `translateY(${scrollY * 0.35}px)`;
        heroTitle.style.opacity = 1 - (scrollY / wh) * 1.4;
      }

      if (heroSub && scrollY < wh) {
        heroSub.style.transform = `translateY(${scrollY * 0.18}px)`;
      }

      if (scrollInd && scrollY < wh) {
        scrollInd.style.opacity = 1 - (scrollY / (wh * 0.3));
      }

      // Scroll progress bar (work page)
      if (progressBar && docHeight > 0) {
        progressBar.style.height = (scrollY / docHeight) * 100 + '%';
      }

      // Header scrolled state
      if (header) {
        header.classList.toggle('scrolled', scrollY > 50);
      }

      // Top availability bar
      if (topBar) {
        topBar.classList.toggle('visible', scrollY > 300);
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on init so first paint is accurate (deep-links, restored scroll)
  onScroll();
}

/* ==========================================
   SPLIT TEXT — letter-by-letter animation
   ========================================== */
function initSplitText() {
  // Replaced by GSAP + SplitType kinetic-text.js
  // This function is intentionally empty.
}

/* ==========================================
   COUNT UP — animate numbers on scroll
   ========================================== */
function initCountUp() {
  const els = document.querySelectorAll('.count-up');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const duration = 2000;
        const start = performance.now();

        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          el.textContent = Math.floor(ease * target);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
}

/* ==========================================
   NAVIGATION
   ========================================== */
function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    const setMenuState = (isOpen) => {
      hamburger.classList.toggle('active', isOpen);
      mobileMenu.classList.toggle('active', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    };

    hamburger.addEventListener('click', () => {
      setMenuState(!mobileMenu.classList.contains('active'));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        setMenuState(false);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        setMenuState(false);
        hamburger.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
        setMenuState(false);
      }
    });
  }

  // Page transitions
  document.querySelectorAll('[data-transition]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const name = link.getAttribute('data-transition') || '';
      triggerPageTransition(href, name);
    });
  });
}

function triggerPageTransition(href, routeName) {
  const transition = document.getElementById('pageTransition');
  if (!transition) { window.location.href = href; return; }

  const label = transition.querySelector('.route-name');
  if (label) label.textContent = routeName;

  // Clean any previous state
  transition.classList.remove('active-in', 'covering');

  // Phase 1: Bars fall down to cover the current page
  transition.classList.add('active-out');

  // Store route name so the next page plays the lift animation
  sessionStorage.setItem('incomingRoute', routeName || 'None');

  // Navigate after bars fully cover
  // Animation: 0.32s + stagger(0.16s) + buffer = ~520ms
  setTimeout(() => { window.location.href = href; }, 520);
}

/* ==========================================
   MARQUEE
   ========================================== */
function initMarquee() {
  const marquee = document.querySelector('.marquee');
  if (!marquee) return;
  marquee.innerHTML += marquee.innerHTML; // duplicate for seamless loop
}

/* ==========================================
   MAGNETIC BUTTONS
   ========================================== */
function initMagneticButtons() {
  if (prefersReducedMotion()) return;
  if (window.innerWidth <= 768) return;
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

/* ==========================================
   3D TILT EFFECT ON PROJECT CARDS
   ========================================== */
function initTiltCards() {
  if (window.innerWidth <= 768) return;
  document.querySelectorAll('.work-item').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const tiltX = (0.5 - y) * 4;
      const tiltY = (x - 0.5) * 4;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}

/* ==========================================
  CONTACT FORM — Google Sheets + Email Fallback
  ========================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const btn = document.getElementById('submitBtn');
  const msgEl = document.getElementById('formMessage');
  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbywqIulMnSGUC0Wcyit5dhWfp_pyykgFE-L3TBlm4zOpOJifUsEbkwa-GSoguiL58N8KA/exec';

  function showMessage(type, text, asHtml = false) {
    if (!msgEl) return;
    msgEl.className = `form-message show ${type}`;
    if (asHtml) {
      msgEl.innerHTML = text;
      return;
    }
    msgEl.textContent = text;
  }

  function resetMessage() {
    if (!msgEl) return;
    msgEl.className = 'form-message';
    msgEl.textContent = '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetMessage();

    // Honeypot check
    const honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    // Validate collaboration radio
    const collabSelected = form.querySelector('input[name="collaboration"]:checked');
    if (!collabSelected) {
      showMessage('error', '⚠ Please select a type of collaboration.');
      return;
    }

    const originalHTML = btn.innerHTML;
    btn.classList.add('loading');
    btn.disabled = true;

    // Gather form data
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const company = (form.querySelector('[name="company"]').value || '').trim() || 'N/A';
    const collab = form.querySelector('input[name="collaboration"]:checked').value;
    const message = form.querySelector('[name="message"]').value.trim();

    showMessage('info', 'Submitting your message...');

    const payload = new URLSearchParams({
      name,
      email,
      company,
      collaboration: collab,
      message,
      source: 'portfolio-contact-form',
      submittedAt: new Date().toISOString()
    });

    // Build fallback mailto link (used only if sheet submission fails)
    const destEmail = 'kankatalaganeshgiridhar@gmail.com';
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Company: ${company}\n` +
      `Collaboration: ${collab}\n\n` +
      `Message:\n${message}`
    );
    const mailtoHref = `mailto:${destEmail}?subject=${subject}&body=${body}`;

    let sheetSaved = false;
    try {
      // Google Apps Script doesn't return CORS headers on POST redirects,
      // so we use a hidden iframe + dynamic form to perform a real form POST.
      // This bypasses CORS entirely and works reliably.
      sheetSaved = await new Promise((resolve) => {
        const iframeName = 'gsheet_iframe_' + Date.now();
        const iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Timeout: resolve false if no response within 10s
        const timeout = setTimeout(() => {
          cleanup();
          resolve(false);
        }, 10000);

        // When the iframe loads (Apps Script responded), count it as success
        iframe.addEventListener('load', () => {
          clearTimeout(timeout);
          // Small delay to let the iframe populate
          setTimeout(() => {
            let success = true;
            try {
              // Try to read the response (may fail due to cross-origin)
              const doc = iframe.contentDocument || iframe.contentWindow.document;
              const body = doc.body ? doc.body.textContent : '';
              if (body.includes('"error"')) success = false;
            } catch (_) {
              // Cross-origin — can't read, but the submission likely worked
            }
            cleanup();
            resolve(success);
          }, 500);
        });

        function cleanup() {
          try { document.body.removeChild(iframe); } catch (_) {}
          try { document.body.removeChild(hiddenForm); } catch (_) {}
        }

        // Build a hidden form that targets the iframe
        const hiddenForm = document.createElement('form');
        hiddenForm.method = 'POST';
        hiddenForm.action = SHEET_URL;
        hiddenForm.target = iframeName;
        hiddenForm.style.display = 'none';

        // Add all fields
        const fields = { name, email, company, collaboration: collab, message,
                         source: 'portfolio-contact-form', submittedAt: new Date().toISOString() };
        for (const [key, val] of Object.entries(fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = val;
          hiddenForm.appendChild(input);
        }

        document.body.appendChild(hiddenForm);
        hiddenForm.submit();
      });
    } catch (err) {
      console.warn('Sheet save failed:', err);
    }

    btn.classList.remove('loading');
    btn.disabled = false;

    if (sheetSaved) {
      btn.innerHTML = '<span>Submitted ✓</span>';
      btn.style.background = 'var(--success)';
      showMessage('success', '✓ Thanks! Your message was submitted successfully. I will get back to you soon.');
      form.reset();
    } else {
      btn.innerHTML = '<span>Try Email Instead</span>';
      btn.style.background = '';
      showMessage(
        'warning',
        `⚠ Could not confirm Google Sheets submission right now. <a href="${mailtoHref}">Send via email instead</a>.`,
        true
      );
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      resetMessage();
    }, 6000);
  });
}

/* ==========================================
   WORK PAGE
   ========================================== */
function initWorkPage() {
  // (progress bar handled by initScrollLoop)
  initTiltCards();
}

/* ==========================================
   SMOOTH SCROLL (anchor links)
   ========================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      let target = null;
      try {
        target = document.querySelector(href);
      } catch (_) {
        return;
      }

      if (target) {
        e.preventDefault();
        const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
        target.scrollIntoView({ behavior, block: 'start' });
      }
    });
  });
}

/* ==========================================
   TOP BAR — (now handled by initScrollLoop)
   ========================================== */
function initTopBar() {
  // consolidated into initScrollLoop
}
