/* ============================================================
   GANESH GIRIDHAR — PORTFOLIO SCRIPTS — ENHANCED EDITION
   Particles, cursor glow, magnetic hover, scroll progress,
   typewriter, stat counters, reveal animations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll Progress Bar ────────────────────────────────
  const scrollProgress = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = progress + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });

  // ── Navbar scroll effect ───────────────────────────────
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ── Back to Top Button ─────────────────────────────────
  const backToTop = document.getElementById('backToTop');
  const toggleBackToTop = () => {
    backToTop.classList.toggle('visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Mobile menu ────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  const toggleMenu = () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    navOverlay.classList.toggle('show');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggleMenu);
  navOverlay.addEventListener('click', toggleMenu);

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) toggleMenu();
    });
  });

  // ── Active nav link on scroll ──────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  const highlightNav = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });

  // ── Typewriter effect ──────────────────────────────────
  const typewriterEl = document.getElementById('typewriter');
  const phrases = [
    'Full Stack Developer',
    'Algorithm Enthusiast',
    'CS Engineering Student',
    'Sustainability Researcher',
    'Systems Thinker'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  function typeWriter() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      typewriterEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 35;
    } else {
      typewriterEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 70;
    }

    if (!isDeleting && charIndex === current.length) {
      typeSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 500;
    }

    setTimeout(typeWriter, typeSpeed);
  }

  typeWriter();

  // ── Scroll-triggered reveal animations ─────────────────
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ── Animated stat counters ─────────────────────────────
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let statsCounted = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target'));
          const duration = 1800;
          const steps = 50;
          const increment = target / steps;
          let current = 0;
          let step = 0;

          const counter = setInterval(() => {
            step++;
            // Ease-out effect
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            current = Math.round(eased * target);

            if (step >= steps) {
              stat.textContent = target + '+';
              clearInterval(counter);
            } else {
              stat.textContent = current + '+';
            }
          }, duration / steps);
        });
        countObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const statsSection = document.querySelector('.about-stats');
  if (statsSection) countObserver.observe(statsSection);

  // ── Smooth scroll for anchor links ─────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============================================================
  // ENHANCED EFFECTS
  // ============================================================

  // ── Cursor Glow Effect (Desktop) ───────────────────────
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorGlow.classList.add('active');
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('active');
    });

    // Smooth follow with lerp
    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  // ── Magnetic Hover Effect ──────────────────────────────
  const magneticElements = document.querySelectorAll('.magnetic');
  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // ── 3D Tilt Effect on Project Cards ────────────────────
  const tiltCards = document.querySelectorAll('.project-card, .stat-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -5;
      const rotateY = (x - centerX) / centerX * 5;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });

  // ── Staggered Reveal for Grid Items ────────────────────
  const staggerGrids = document.querySelectorAll('.skills-grid, .projects-grid, .achievements-list');
  staggerGrids.forEach(grid => {
    const items = grid.children;
    const gridObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          Array.from(items).forEach((item, index) => {
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, index * 100);
          });
          gridObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    // Set initial state
    Array.from(items).forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px)';
      item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });

    gridObserver.observe(grid);
  });

  // ── Particle System for Hero ───────────────────────────
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
      const hero = document.querySelector('.hero');
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
        this.growing = Math.random() > 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.growing) {
          this.opacity += this.fadeSpeed;
          if (this.opacity >= 0.5) this.growing = false;
        } else {
          this.opacity -= this.fadeSpeed;
          if (this.opacity <= 0.05) this.growing = true;
        }

        if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 60, 225, ${this.opacity})`;
        ctx.fill();
      }
    }

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(108, 60, 225, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function initParticles() {
      resizeCanvas();
      const count = Math.min(60, Math.floor(canvas.width * canvas.height / 15000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationId = requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animationId);
      initParticles();
      animateParticles();
    });

    // Pause particles when not visible
    const heroEl = document.querySelector('.hero');
    const particleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateParticles();
        } else {
          cancelAnimationFrame(animationId);
        }
      });
    }, { threshold: 0 });
    particleObserver.observe(heroEl);
  }

  // ── Smooth parallax on mouse move (hero section) ───────
  const hero = document.querySelector('.hero');
  if (hero && window.innerWidth > 768) {
    const blobs = hero.querySelectorAll('.hero-blob');
    const profileFrame = hero.querySelector('.profile-frame');

    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);

      blobs.forEach((blob, i) => {
        const factor = (i + 1) * 15;
        blob.style.transform += ` translate(${x * factor}px, ${y * factor}px)`;
      });

      if (profileFrame) {
        profileFrame.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
      }
    }, { passive: true });
  }

  // ── Text scramble effect on section titles ─────────────
  const scrambleChars = '!@#$%^&*()_+-=[]{}|;:,./<>?';
  const sectionTitles = document.querySelectorAll('.section-title');

  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const originalText = el.textContent;
        let iteration = 0;
        const totalIterations = 8;

        const interval = setInterval(() => {
          el.innerHTML = originalText.split('').map((char, idx) => {
            if (char === '\n' || char === ' ') return char;
            if (idx < iteration) return originalText[idx];
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }).join('');

          iteration += originalText.length / totalIterations;

          if (iteration >= originalText.length) {
            el.innerHTML = originalText.replace(/\n/g, '<br>');
            clearInterval(interval);
          }
        }, 50);

        titleObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  // Only apply to a subset to keep it subtle
  if (sectionTitles.length > 1) {
    // Skip hero title, apply to others
    for (let i = 0; i < sectionTitles.length; i++) {
      titleObserver.observe(sectionTitles[i]);
    }
  }

});
