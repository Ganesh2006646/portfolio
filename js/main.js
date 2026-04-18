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
  initParallax();
  initSplitText();
  initCountUp();
  initHeroAnimation();
  initMarquee();
  initMagneticButtons();
  initContactForm();
  initWorkPage();
  initSmoothScroll();
  initTopBar();
  initScrollProgress();
  initTiltCards();
});

/* ==========================================
   CUSTOM CURSOR
   ========================================== */
function initCursor() {
  const cursor = document.querySelector('.cursor');
  const cursorDot = document.querySelector('.cursor-dot');
  if (!cursor || !cursorDot) return;
  if (window.innerWidth <= 768) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.12;
    cursorY += (mouseY - cursorY) * 0.12;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    dotX += (mouseX - dotX) * 0.25;
    dotY += (mouseY - dotY) * 0.25;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverEls = document.querySelectorAll('a, button, .project-card, .service-card, .budget-option, .submit-btn');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

/* ==========================================
   LOADING SCREEN
   ========================================== */
function initLoader() {
  const loader = document.querySelector('.loader');
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
      count += Math.floor(Math.random() * 15) + 5;
      if (count >= 100) {
        count = 100;
        clearInterval(interval);
        setTimeout(() => {
          loader.classList.add('hidden');
          document.body.style.overflow = '';
          setTimeout(triggerEntryAnimations, 300);
        }, 400);
      }
      counter.textContent = count + '%';
    }, 120);
  } else {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      setTimeout(triggerEntryAnimations, 300);
    }, 2500);
  }

  document.body.style.overflow = 'hidden';
}

/* ==========================================
   ENTRY ANIMATIONS (after loader)
   ========================================== */
function triggerEntryAnimations() {
  // Hero title lines
  document.querySelectorAll('.hero-title .line span').forEach(s => s.classList.add('visible'));
  // Hero subtitle
  const sub = document.querySelector('.hero-subtitle');
  if (sub) sub.classList.add('visible');
  // Work page title words
  document.querySelectorAll('.work-page-title .word span').forEach((s, i) => {
    setTimeout(() => s.classList.add('visible'), i * 80);
  });
}

function initHeroAnimation() {
  if (!document.querySelector('.loader')) {
    setTimeout(triggerEntryAnimations, 200);
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
    '.scroll-line-reveal', '.split-text',
    '.work-item'
  ].join(',');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll(selectors).forEach(el => observer.observe(el));
}

/* ==========================================
   PARALLAX — depth-based scroll offset
   ========================================== */
function initParallax() {
  const layers = document.querySelectorAll('.parallax-layer');
  if (!layers.length) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        layers.forEach(layer => {
          const speed = parseFloat(getComputedStyle(layer).getPropertyValue('--parallax-speed')) || 0.05;
          const rect = layer.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const offset = (window.innerHeight / 2 - centerY) * speed;
          layer.style.transform = `translateY(${offset}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ==========================================
   SPLIT TEXT — letter-by-letter animation
   ========================================== */
function initSplitText() {
  document.querySelectorAll('.split-text').forEach(el => {
    const text = el.textContent;
    el.innerHTML = '';
    el.setAttribute('aria-label', text);
    let charIndex = 0;
    text.split('').forEach(c => {
      const span = document.createElement('span');
      span.classList.add('char');
      span.textContent = c === ' ' ? '\u00A0' : c;
      span.style.transitionDelay = `${charIndex * 0.025}s`;
      el.appendChild(span);
      charIndex++;
    });
  });
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
   SCROLL PROGRESS BAR
   ========================================== */
function initScrollProgress() {
  const bar = document.querySelector('.work-progress-bar .fill');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.height = (scrollTop / docHeight) * 100 + '%';
  });
}

/* ==========================================
   HERO PARALLAX ON SCROLL
   ========================================== */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const wh = window.innerHeight;

  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && scrollY < wh) {
    heroTitle.style.transform = `translateY(${scrollY * 0.35}px)`;
    heroTitle.style.opacity = 1 - (scrollY / wh) * 1.4;
  }

  const heroSub = document.querySelector('.hero-subtitle');
  if (heroSub && scrollY < wh) {
    heroSub.style.transform = `translateY(${scrollY * 0.18}px)`;
  }

  const scrollInd = document.querySelector('.hero-scroll-indicator');
  if (scrollInd && scrollY < wh) {
    scrollInd.style.opacity = 1 - (scrollY / (wh * 0.3));
  }
});

/* ==========================================
   NAVIGATION
   ========================================== */
function initNavigation() {
  const header = document.querySelector('.header');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
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
  const transition = document.querySelector('.page-transition');
  const label = transition?.querySelector('.route-name');
  if (!transition) { window.location.href = href; return; }
  if (label) label.textContent = routeName;
  transition.classList.add('active');
  setTimeout(() => { window.location.href = href; }, 600);
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
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const tiltX = (0.5 - y) * 8;  // degrees
      const tiltY = (x - 0.5) * 8;
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
   CONTACT FORM
   ========================================== */
function initContactForm() {
  document.querySelectorAll('.budget-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.budget-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  const form = document.querySelector('.contact-form form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      const original = btn.innerHTML;
      btn.innerHTML = '<span>Sent! ✓</span>';
      btn.style.background = 'var(--success)';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        form.reset();
        document.querySelectorAll('.budget-option').forEach(o => o.classList.remove('selected'));
      }, 3000);
    });
  }
}

/* ==========================================
   WORK PAGE
   ========================================== */
function initWorkPage() {
  // (progress bar handled by initScrollProgress)
}

/* ==========================================
   SMOOTH SCROLL (anchor links)
   ========================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ==========================================
   TOP BAR (appears on scroll)
   ========================================== */
function initTopBar() {
  const topBar = document.querySelector('.top-bar');
  if (!topBar) return;
  window.addEventListener('scroll', () => {
    topBar.classList.toggle('visible', window.scrollY > 300);
  });
}
