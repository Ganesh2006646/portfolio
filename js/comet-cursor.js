/* =========================================
   COMET GAS BALL CURSOR TRAIL
   Canvas-based particle system — Hero only
   ========================================= */

(function () {
  'use strict';

  const hero = document.querySelector('.hero');
  if (!hero || window.innerWidth <= 768) return;

  /* --- Canvas setup --- */
  const canvas = document.createElement('canvas');
  canvas.id = 'comet-cursor-canvas';
  hero.style.position = 'relative';
  hero.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    const rect = hero.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  resize();
  window.addEventListener('resize', resize);

  /* --- Palette: Cyan → Neon Blue → Deep Violet --- */
  const palette = [
    [0, 255, 255],    // cyan
    [80, 200, 255],   // neon sky
    [100, 150, 255],  // neon blue
    [130, 100, 255],  // blue-violet
    [160, 60, 255],   // violet
    [200, 50, 230],   // magenta-violet
    [108, 60, 225],   // brand accent
  ];

  function randomColor() {
    return palette[Math.floor(Math.random() * palette.length)];
  }

  /* --- Particle class --- */
  class Particle {
    constructor(x, y, vx, vy) {
      this.x = x;
      this.y = y;
      const [r, g, b] = randomColor();
      this.r = r;
      this.g = g;
      this.b = b;
      this.radius = Math.random() * 18 + 6;
      this.baseRadius = this.radius;
      this.life = 1;
      this.decay = Math.random() * 0.018 + 0.008;
      this.vx = vx * (Math.random() * 0.3 + 0.1) + (Math.random() - 0.5) * 0.8;
      this.vy = vy * (Math.random() * 0.3 + 0.1) + (Math.random() - 0.5) * 0.8;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.97;
      this.vy *= 0.97;
      this.life -= this.decay;
      this.radius = this.baseRadius * this.life;
    }

    draw(ctx) {
      if (this.life <= 0 || this.radius <= 0.5) return;
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      const a = this.life * 0.6;
      gradient.addColorStop(0, `rgba(${this.r},${this.g},${this.b},${a})`);
      gradient.addColorStop(0.4, `rgba(${this.r},${this.g},${this.b},${a * 0.5})`);
      gradient.addColorStop(1, `rgba(${this.r},${this.g},${this.b},0)`);
      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    get dead() {
      return this.life <= 0;
    }
  }

  /* --- State --- */
  const particles = [];
  let mouseX = -1000, mouseY = -1000;
  let prevMouseX = 0, prevMouseY = 0;
  let isOverHero = false;
  let animating = false;

  /* --- Core glow (stationary ball at cursor) --- */
  function drawCoreGlow(x, y) {
    const coreRadius = 22;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, coreRadius);
    gradient.addColorStop(0, 'rgba(180, 220, 255, 0.9)');
    gradient.addColorStop(0.2, 'rgba(100, 180, 255, 0.5)');
    gradient.addColorStop(0.5, 'rgba(108, 60, 225, 0.2)');
    gradient.addColorStop(1, 'rgba(108, 60, 225, 0)');
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  /* --- Animation loop --- */
  function loop() {
    if (!animating) return;

    // Motion blur clear
    ctx.fillStyle = 'rgba(5, 7, 15, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Additive blending for plasma glow
    ctx.globalCompositeOperation = 'lighter';

    // Update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].dead) {
        particles.splice(i, 1);
      }
    }

    // Draw core glow at cursor position
    if (isOverHero) {
      drawCoreGlow(mouseX, mouseY);
    }

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(loop);
  }

  /* --- Event listeners --- */
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const vx = -(x - prevMouseX) * 0.15;
    const vy = -(y - prevMouseY) * 0.15;

    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = x;
    mouseY = y;

    // Emit particles based on movement speed
    const speed = Math.sqrt(vx * vx + vy * vy);
    const count = Math.min(Math.floor(speed * 1.5) + 2, 8);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, vx, vy));
    }

    // Cap particles for performance
    while (particles.length > 300) {
      particles.shift();
    }
  });

  hero.addEventListener('mouseenter', () => {
    isOverHero = true;
    if (!animating) {
      animating = true;
      loop();
    }
  });

  hero.addEventListener('mouseleave', () => {
    isOverHero = false;
    mouseX = -1000;
    mouseY = -1000;
    // Keep animating to let existing particles fade
    setTimeout(() => {
      if (!isOverHero && particles.length === 0) {
        animating = false;
        // Full clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, 2000);
  });

})();
