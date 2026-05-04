/* =========================================
   TECHSTACK — 3D Physics Sphere Simulation
   + GSAP ScrollTrigger Integration
   ========================================= */

(function () {
  'use strict';

  /* ---- Configuration ---- */
  const SPHERE_COUNT = 20;
  const SCALE_OPTIONS = [0.85, 1.15, 0.95, 1.05, 1.0];
  const MOUSE_RADIUS = 6.0;
  const DAMPING = 0.96;
  const CENTER_PULL = 0.2;
  const TARGET_RADIUS = 3.5;
  const MOUSE_PUSH = 28;
  const MAX_VELOCITY = 25;

  /* Tech data — branded colors for canvas-drawn textures */
  const TECH_DATA = [
    { name: 'Python', color: '#3776AB' },
    { name: 'Java', color: '#ED8B00' },
    { name: 'JavaScript', color: '#F7DF1E' },
    { name: 'React', color: '#61DAFB' },
    { name: 'Node.js', color: '#639143' },
    { name: 'Express', color: '#888888' },
    { name: 'PostgreSQL', color: '#4169E1' },
    { name: 'MongoDB', color: '#47A248' },
    { name: 'Docker', color: '#2496ED' },
    { name: 'Flutter', color: '#02569B' },
    { name: 'Git', color: '#F05032' },
  ];

  /* ---- State ---- */
  let scene, camera, renderer;
  let particles = [];
  let isActive = false;
  let canvasContainer;
  let animationId;
  let mouse3D;
  let mouseTarget;
  let materialCache = [];
  let sharedGeometry;

  /* ---- Scroll-Driven State ---- */
  let scrollProgress = 0;       // 0 = out of view, 1 = fully in view
  let assemblyProgress = 0;     // Lerped scroll progress for smooth assembly
  let hasAssembled = false;      // True once spheres first reach full assembly
  let scrollVelocity = 0;       // Current scroll speed for orbit boost
  let lastScrollY = 0;
  let cameraBaseZ = 30;
  let cameraTargetZ = 30;

  // Expose for debugging
  window.__TECHSTACK_PARTICLES__ = particles;

  /* ---- Scatter positions (far out, random) ---- */
  function randomScatterPos() {
    const angle = Math.random() * Math.PI * 2;
    const elevAngle = (Math.random() - 0.5) * Math.PI;
    const radius = 18 + Math.random() * 12; // Far from center
    return new THREE.Vector3(
      Math.cos(angle) * Math.cos(elevAngle) * radius,
      Math.sin(elevAngle) * radius,
      Math.sin(angle) * Math.cos(elevAngle) * radius * 0.4
    );
  }

  /* ---- Assembled target positions (shell cluster) ---- */
  function assembledTargetPos(index, total) {
    // Fibonacci sphere distribution for even spacing
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const y = 1 - (index / (total - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;
    return new THREE.Vector3(
      Math.cos(theta) * radiusAtY * TARGET_RADIUS,
      y * TARGET_RADIUS,
      Math.sin(theta) * radiusAtY * TARGET_RADIUS
    );
  }

  function createTechTexture(techData, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const brandColor = techData.color;

    // Bright, crisp white base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Extremely soft shadow for roundness
    const gradient = ctx.createRadialGradient(
      size * 0.35, size * 0.35, 0,
      size * 0.5, size * 0.5, size * 0.65
    );
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.8, 'rgba(240,240,245,0.4)');
    gradient.addColorStop(1, 'rgba(210,210,215,0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Text Label
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const label = techData.name;
    let fontSize = size * 0.22;
    if (label.length > 8) fontSize = size * 0.17;
    if (label.length > 10) fontSize = size * 0.14;

    ctx.font = `900 ${fontSize}px 'Inter', 'Segoe UI', Arial, sans-serif`;
    ctx.shadowColor = brandColor;
    ctx.shadowBlur = size * 0.05;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(label, size * 0.5, size * 0.5);
    ctx.fillText(label, size * 0.5, size * 0.5);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#050505';
    ctx.fillText(label, size * 0.5, size * 0.5);
    ctx.restore();

    // Edge ring
    ctx.strokeStyle = brandColor;
    ctx.lineWidth = size * 0.025;
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, size * 0.48, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 16;
    return texture;
  }

  function createMaterials() {
    TECH_DATA.forEach((tech) => {
      const texture = createTechTexture(tech, 512);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color('#ffffff'),
        emissiveMap: texture,
        emissiveIntensity: 0.1,
        metalness: 0.0,
        roughness: 0.15,
      });
      materialCache.push(mat);
    });
  }

  function initScene() {
    canvasContainer = document.getElementById('techstack-canvas');
    if (!canvasContainer) return false;

    let cw = canvasContainer.clientWidth || 800;
    let ch = canvasContainer.clientHeight || 600;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(32.5, cw / ch, 1, 100);
    camera.position.set(0, 0, cameraBaseZ);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(cw, ch);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    canvasContainer.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    const spot = new THREE.SpotLight(0xffffff, 4);
    spot.position.set(20, 20, 25);
    spot.penumbra = 1;
    spot.angle = 0.2;
    scene.add(spot);

    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(0, 5, -5);
    scene.add(dir);

    const rim = new THREE.PointLight(0x6C3CE1, 2, 50);
    rim.position.set(-15, -5, 10);
    scene.add(rim);

    window.addEventListener('resize', onResize);
    setTimeout(onResize, 100);

    return true;
  }

  function createSpheres() {
    sharedGeometry = new THREE.SphereGeometry(1, 28, 28);
    for (let i = 0; i < SPHERE_COUNT; i++) {
      const scale = SCALE_OPTIONS[Math.floor(Math.random() * SCALE_OPTIONS.length)];
      const mat = materialCache[Math.floor(Math.random() * materialCache.length)];

      const mesh = new THREE.Mesh(sharedGeometry, mat);
      mesh.scale.setScalar(scale);

      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      // Start at scattered positions (far out)
      const scatterPos = randomScatterPos();
      const targetPos = assembledTargetPos(i, SPHERE_COUNT);
      mesh.position.copy(scatterPos);

      // Start invisible — will fade in with assembly
      mesh.material = mat.clone();
      mesh.material.transparent = true;
      mesh.material.opacity = 0;

      scene.add(mesh);

      particles.push({
        mesh,
        scale,
        vx: 0, vy: 0, vz: 0,
        avx: 0, avy: 0, avz: 0,
        baseAvx: (Math.random() - 0.5) * 0.015,
        baseAvy: (Math.random() - 0.5) * 0.015,
        baseAvz: (Math.random() - 0.5) * 0.015,
        scatterPos: scatterPos.clone(),
        targetPos: targetPos.clone(),
        assemblyDelay: i * 0.03, // Staggered assembly
      });
    }
  }

  /* ---- Scroll-Driven Assembly ---- */
  function updateAssembly(dt) {
    // Smooth lerp toward scroll progress
    assemblyProgress += (scrollProgress - assemblyProgress) * 0.04;

    // Camera zoom: pulls in as section enters view
    cameraTargetZ = THREE.MathUtils.lerp(38, 28, assemblyProgress);
    camera.position.z += (cameraTargetZ - camera.position.z) * 0.03;

    // Subtle camera tilt based on scroll velocity
    const tiltX = scrollVelocity * 0.0003;
    camera.rotation.x += (tiltX - camera.rotation.x) * 0.05;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const pos = p.mesh.position;

      // Per-sphere staggered progress (earlier spheres assemble first)
      const staggeredProgress = Math.max(0, Math.min(1,
        (assemblyProgress - p.assemblyDelay) / (1 - p.assemblyDelay)
      ));

      // Ease function: cubic ease-out for smooth deceleration
      const eased = 1 - Math.pow(1 - staggeredProgress, 3);

      if (!hasAssembled) {
        // During assembly: interpolate from scatter to target
        const lerpPos = new THREE.Vector3().lerpVectors(p.scatterPos, p.targetPos, eased);
        pos.lerp(lerpPos, 0.08);

        // Fade in opacity
        p.mesh.material.opacity = Math.min(1, eased * 1.5);

        // Scale bounce: overshoot slightly then settle
        const scaleBounce = eased > 0.8
          ? p.scale * (1 + Math.sin((eased - 0.8) * Math.PI * 5) * 0.08 * (1 - eased) * 5)
          : p.scale * eased;
        p.mesh.scale.setScalar(Math.max(0.01, scaleBounce));

        // Spin faster during assembly
        p.mesh.rotation.x += p.baseAvx * (3 - eased * 2);
        p.mesh.rotation.y += p.baseAvy * (3 - eased * 2);
      }
    }

    // Mark assembled once fully in view
    if (assemblyProgress > 0.95 && !hasAssembled) {
      hasAssembled = true;
      // Set proper opacity and scale
      particles.forEach(p => {
        p.mesh.material.opacity = 1;
        p.mesh.scale.setScalar(p.scale);
      });
    }
  }

  function physicsStep(dt) {
    if (dt > 0.05) dt = 0.05;

    // Orbit speed boost from scroll velocity
    const scrollBoost = 1 + Math.abs(scrollVelocity) * 0.005;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const pos = p.mesh.position;

      if (isNaN(pos.x)) { pos.set(0, 0, 0); p.vx = p.vy = p.vz = 0; }

      // 1. Shell cluster pull
      const dist = Math.max(0.1, pos.length());
      const shellForce = (dist - TARGET_RADIUS) * CENTER_PULL * dt * 30;
      p.vx -= (pos.x / dist) * shellForce;
      p.vy -= (pos.y / dist) * shellForce;
      p.vz -= (pos.z / dist) * shellForce;

      // 2. Orbital swirl — boosted by scroll speed
      const swirlSpeed = 5.0 * dt * scrollBoost;
      p.vx -= (pos.y / dist) * swirlSpeed;
      p.vy += (pos.x / dist) * swirlSpeed;

      // Natural jiggle
      const jiggle = 0.15;
      p.vx += (Math.random() - 0.5) * jiggle;
      p.vy += (Math.random() - 0.5) * jiggle;
      p.vz += (Math.random() - 0.5) * jiggle;

      // 3. Mouse repulsion
      const dx = pos.x - mouse3D.x;
      const dy = pos.y - mouse3D.y;
      const dz = pos.z - mouse3D.z;
      const mouseDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (mouseDist > 0.1 && mouseDist < MOUSE_RADIUS + p.scale * 1.5) {
        const pushForce = MOUSE_PUSH * dt / (mouseDist * mouseDist);
        p.vx += (dx / mouseDist) * pushForce * 40;
        p.vy += (dy / mouseDist) * pushForce * 40;
        p.vz += (dz / mouseDist) * pushForce * 15;
        p.avx += (Math.random() - 0.5) * pushForce * 0.2;
        p.avy += (Math.random() - 0.5) * pushForce * 0.2;
        p.avz += (Math.random() - 0.5) * pushForce * 0.2;
      }

      // 4. Sphere collision
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        if (!q.mesh) continue;
        const qpos = q.mesh.position;

        const cx = pos.x - qpos.x;
        const cy = pos.y - qpos.y;
        const cz = pos.z - qpos.z;
        const cDist = Math.sqrt(cx * cx + cy * cy + cz * cz);
        const minDist = p.scale + q.scale + 0.12;

        if (cDist > 0 && cDist < minDist) {
          const overlap = (minDist - cDist) * 0.5;
          const nx = cx / cDist;
          const ny = cy / cDist;
          const nz = cz / cDist;

          const spring = 0.2;
          pos.x += nx * overlap * spring;
          pos.y += ny * overlap * spring;
          pos.z += nz * overlap * spring;
          qpos.x -= nx * overlap * spring;
          qpos.y -= ny * overlap * spring;
          qpos.z -= nz * overlap * spring;

          p.vx += nx * 0.3; p.vy += ny * 0.3; p.vz += nz * 0.3;
          q.vx -= nx * 0.3; q.vy -= ny * 0.3; q.vz -= nz * 0.3;

          p.avx += ny * 0.01; q.avx -= ny * 0.01;
          p.avy -= nx * 0.01; q.avy += nx * 0.01;
        }
      }

      // 5. Velocity cap and apply
      const speedSq = p.vx * p.vx + p.vy * p.vy + p.vz * p.vz;
      if (speedSq > MAX_VELOCITY * MAX_VELOCITY) {
        const speed = Math.sqrt(speedSq);
        p.vx = (p.vx / speed) * MAX_VELOCITY;
        p.vy = (p.vy / speed) * MAX_VELOCITY;
        p.vz = (p.vz / speed) * MAX_VELOCITY;
      }

      p.vx *= DAMPING; p.vy *= DAMPING; p.vz *= DAMPING;

      pos.x += p.vx * dt;
      pos.y += p.vy * dt;
      pos.z += p.vz * dt;

      // Rotation: boost spin speed with scroll velocity
      const spinBoost = 1 + Math.abs(scrollVelocity) * 0.002;
      p.mesh.rotation.x += (p.avx + p.baseAvx) * spinBoost;
      p.mesh.rotation.y += (p.avy + p.baseAvy) * spinBoost;
      p.mesh.rotation.z += (p.avz + p.baseAvz) * spinBoost;
      p.avx *= 0.95; p.avy *= 0.95; p.avz *= 0.95;
    }
  }

  let lastTime = 0;
  function animate(time) {
    animationId = requestAnimationFrame(animate);
    const dt = lastTime ? (time - lastTime) / 1000 : 0.016;
    lastTime = time;

    mouse3D.lerp(mouseTarget, 0.1);

    // Track scroll velocity
    const currentScrollY = window.scrollY || 0;
    scrollVelocity += ((currentScrollY - lastScrollY) - scrollVelocity) * 0.15;
    lastScrollY = currentScrollY;

    if (isActive) {
      if (!hasAssembled) {
        updateAssembly(dt);
      } else {
        physicsStep(dt);
        // Continue updating camera zoom even after assembly
        camera.position.z += (28 - camera.position.z) * 0.02;
      }
    }

    renderer.render(scene, camera);
  }

  function checkActivation() {
    const section = document.getElementById('arsenal');
    if (!section) { isActive = true; return; }
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    isActive = rect.top < vh && rect.bottom > 0;

    // Calculate scroll progress: 0 when section enters bottom, 1 when fully centered
    if (isActive) {
      const sectionCenter = rect.top + rect.height * 0.5;
      const viewCenter = vh * 0.5;
      // Normalize: 1 when centered, 0 when at edges
      scrollProgress = Math.max(0, Math.min(1,
        1 - Math.abs(sectionCenter - viewCenter) / vh
      ));
    } else {
      scrollProgress = 0;
    }
  }

  /* ---- ScrollTrigger Integration ---- */
  function initScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Fallback: just use scroll listener
      window.addEventListener('scroll', checkActivation, { passive: true });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const section = document.getElementById('arsenal');
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',   // Start when 10% visible
      end: 'center center', // Fully assembled when centered
      scrub: true,
      onUpdate: (self) => {
        scrollProgress = self.progress;
        isActive = true;
      },
      onLeave: () => {
        isActive = true; // Keep rendering when scrolled past
        scrollProgress = 1;
      },
      onLeaveBack: () => {
        isActive = false;
        scrollProgress = 0;
      },
      onEnterBack: () => {
        isActive = true;
      }
    });

    // Secondary trigger: keep physics running while visible
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        isActive = self.isActive;
      }
    });
  }

  function onMouseMove(e) {
    if (!canvasContainer || !isActive) return;
    const rect = canvasContainer.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const viewHeight = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2;
    const viewWidth = viewHeight * camera.aspect;
    mouseTarget.set(ndcX * viewWidth * 0.5, ndcY * viewHeight * 0.5, 0);
  }

  function onMouseLeave() {
    mouseTarget.set(100, 100, 100);
  }

  function onResize() {
    if (!canvasContainer || !camera || !renderer) return;
    const w = canvasContainer.clientWidth || 800;
    const h = canvasContainer.clientHeight || 600;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function isMobile() { return window.innerWidth <= 768; }

  function init() {
    if (isMobile()) {
      initMobileFallback();
      return;
    }

    if (typeof THREE === 'undefined') {
      initMobileFallback();
      return;
    }

    mouse3D = new THREE.Vector3(100, 100, 100);
    mouseTarget = new THREE.Vector3(100, 100, 100);

    createMaterials();
    if (!initScene()) return;
    createSpheres();

    canvasContainer.addEventListener('mousemove', onMouseMove, { passive: true });
    canvasContainer.addEventListener('mouseleave', onMouseLeave, { passive: true });

    // Use ScrollTrigger if available, otherwise fallback
    initScrollTrigger();
    checkActivation();
    animate(0);
  }

  function initMobileFallback() {
    const container = document.getElementById('techstack-canvas');
    if (!container) return;
    container.classList.add('techstack-mobile-fallback');
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'techstack-mobile-grid';
    TECH_DATA.forEach((tech, i) => {
      const tag = document.createElement('div');
      tag.className = 'techstack-mobile-tag';
      tag.style.setProperty('--brand', tech.color);
      tag.style.animationDelay = `${i * 0.1}s`;
      const dot = document.createElement('span');
      dot.className = 'tech-dot';
      const name = document.createElement('span');
      name.textContent = tech.name;
      tag.appendChild(dot);
      tag.appendChild(name);
      grid.appendChild(tag);
    });
    container.appendChild(grid);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 50));
  } else {
    setTimeout(init, 50);
  }
})();
