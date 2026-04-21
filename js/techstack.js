/* =========================================
   TECHSTACK — 3D Physics Sphere Simulation
   Vanilla Three.js + Custom Particle Physics
   ========================================= */

(function () {
  'use strict';

  /* ---- Configuration ---- */
  const SPHERE_COUNT = 32;
  const SCALE_OPTIONS = [0.85, 1.15, 0.95, 1.05, 1.0];
  const MOUSE_RADIUS = 6.0; // wider reach
  const DAMPING = 0.96; // Less friction for longer glides
  const CENTER_PULL = 0.2; // Soft pull strength for the shell
  const TARGET_RADIUS = 3.5; // Diameter constraint of the cluster
  const MOUSE_PUSH = 28; // Explosive push on hover
  const COLLISION_BOUNCE = 0.25;
  const MAX_VELOCITY = 25; // Higher top speed

  /* Tech data — branded colors for canvas-drawn textures */
  const TECH_DATA = [
    { name: 'Python', color: '#3776AB' },
    { name: 'Java', color: '#ED8B00' },
    { name: 'JavaScript', color: '#F7DF1E' },
    { name: 'React', color: '#61DAFB' },
    { name: 'Next.js', color: '#888888' },
    { name: 'Node.js', color: '#339933' },
    { name: 'Express', color: '#888888' },
    { name: 'PostgreSQL', color: '#4169E1' },
    { name: 'MongoDB', color: '#47A248' },
    { name: 'Docker', color: '#2496ED' },
    { name: 'Flutter', color: '#02569B' },
    { name: 'Firebase', color: '#DD2C00' },
    { name: 'Git', color: '#F05032' },
    { name: 'FastAPI', color: '#009688' },
  ];

  /* ---- State ---- */
  let scene, camera, renderer;
  let particles = [];
  let isActive = false;
  let canvasContainer;
  let animationId;
  let mouse3D = new THREE.Vector3(100, 100, 100);
  let mouseTarget = new THREE.Vector3(100, 100, 100);
  let materialCache = [];
  let sharedGeometry;

  // Expose to window for debugging
  window.__TECHSTACK_PARTICLES__ = particles;

  function createTechTexture(techData, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const brandColor = techData.color;

    // Bright, crisp white base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Extremely soft shadow for roundness, but keep center pure white
    const gradient = ctx.createRadialGradient(
      size * 0.35, size * 0.35, 0,
      size * 0.5, size * 0.5, size * 0.65
    );
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.8, 'rgba(240,240,245,0.4)');
    gradient.addColorStop(1, 'rgba(210,210,215,0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Text Label - Super clear and crisp
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Use true casing or uppercase depending on aesthetic. We'll use crisp casing.
    const label = techData.name;

    // Significantly bump font size for legibility
    let fontSize = size * 0.22;
    if (label.length > 8) fontSize = size * 0.17;
    if (label.length > 10) fontSize = size * 0.14;

    // Use an ultra-thick, clear font
    ctx.font = `900 ${fontSize}px 'Inter', 'Segoe UI', Arial, sans-serif`;

    // Glowing brand halo to make text pop against white
    ctx.shadowColor = brandColor;
    ctx.shadowBlur = size * 0.05;
    ctx.fillStyle = '#0f172a'; // Deep crisp slate/black

    // Draw text 3 times: twice for the strong halo, once for solid clear body
    ctx.fillText(label, size * 0.5, size * 0.5);
    ctx.fillText(label, size * 0.5, size * 0.5);

    // Clear the glowing shadow & draw solid center core text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#050505'; // Near black
    ctx.fillText(label, size * 0.5, size * 0.5);
    ctx.restore();

    // Subtle edge ring to define the sphere clearly against black background
    ctx.strokeStyle = brandColor;
    ctx.lineWidth = size * 0.025;
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, size * 0.48, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 16;
    return texture;
  }

  function createMaterials() {
    TECH_DATA.forEach((tech) => {
      const texture = createTechTexture(tech, 512);
      const mat = new THREE.MeshPhysicalMaterial({
        map: texture,
        emissive: new THREE.Color('#ffffff'),
        emissiveMap: texture,
        emissiveIntensity: 0.1, // Slight brightening
        metalness: 0.0, // Pure matte white base
        roughness: 0.15, // Extremely sharp, glossy outer reflection
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });
      materialCache.push(mat);
    });
  }

  function initScene() {
    canvasContainer = document.getElementById('techstack-canvas');
    if (!canvasContainer) return false;

    // Wait until dimension is populated if 0
    let cw = canvasContainer.clientWidth || 800;
    let ch = canvasContainer.clientHeight || 600;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(32.5, cw / ch, 1, 100);
    // Adjusted camera position out a bit to ensure viewport framing
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(cw, ch);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
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

    // Provide default fallback variables for resize
    window.addEventListener('resize', onResize);
    // Trigger initial resize after a short delay to correct 0 height issues
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

      // Start clustered around the center safely to avoid flying off
      const spread = (range) => (Math.random() - 0.5) * range;
      mesh.position.set(spread(10), spread(10), spread(5));
      scene.add(mesh);

      particles.push({
        mesh,
        scale,
        vx: spread(1),
        vy: spread(1),
        vz: spread(1),
        avx: 0,
        avy: 0,
        avz: 0,
        // Persistent base rotation so they always spin smoothly
        baseAvx: (Math.random() - 0.5) * 0.015,
        baseAvy: (Math.random() - 0.5) * 0.015,
        baseAvz: (Math.random() - 0.5) * 0.015,
      });
    }
  }

  function physicsStep(dt) {
    if (dt > 0.05) dt = 0.05; // clamp delta time heavily

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const pos = p.mesh.position;

      // Ensure stable numbers
      if (isNaN(pos.x)) { pos.set(0, 0, 0); p.vx = p.vy = p.vz = 0; }

      // 1. Maintain a hollow sphere cluster (increase diameter)
      const dist = Math.max(0.1, pos.length());

      // Pull toward the shell radius instead of absolute center (0,0,0)
      const shellForce = (dist - TARGET_RADIUS) * CENTER_PULL * dt * 30;
      p.vx -= (pos.x / dist) * shellForce;
      p.vy -= (pos.y / dist) * shellForce;
      p.vz -= (pos.z / dist) * shellForce;

      // Add a slow orbital swirl around the center
      const swirlSpeed = 5.0 * dt;
      p.vx -= (pos.y / dist) * swirlSpeed;
      p.vy += (pos.x / dist) * swirlSpeed;

      // Natural jiggle
      const jiggle = 0.15;
      p.vx += (Math.random() - 0.5) * jiggle;
      p.vy += (Math.random() - 0.5) * jiggle;
      p.vz += (Math.random() - 0.5) * jiggle;

      // 2. Mouse repulsion
      const dx = pos.x - mouse3D.x;
      const dy = pos.y - mouse3D.y;
      const dz = pos.z - mouse3D.z;
      const mouseDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (mouseDist > 0.1 && mouseDist < MOUSE_RADIUS + p.scale * 1.5) { // Wider reach
        const pushForce = MOUSE_PUSH * dt / (mouseDist * mouseDist);
        p.vx += (dx / mouseDist) * pushForce * 40;
        p.vy += (dy / mouseDist) * pushForce * 40;
        p.vz += (dz / mouseDist) * pushForce * 15;

        // Add dynamic rotational spin upon mouse sweep
        p.avx += (Math.random() - 0.5) * pushForce * 0.2;
        p.avy += (Math.random() - 0.5) * pushForce * 0.2;
        p.avz += (Math.random() - 0.5) * pushForce * 0.2;
      }

      // 3. Simple Sphere collision
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        if (!q.mesh) continue;
        const qpos = q.mesh.position;

        const cx = pos.x - qpos.x;
        const cy = pos.y - qpos.y;
        const cz = pos.z - qpos.z;
        const cDist = Math.sqrt(cx * cx + cy * cy + cz * cz);
        const minDist = p.scale + q.scale + 0.12; // Slight buffer

        if (cDist > 0 && cDist < minDist) {
          const overlap = (minDist - cDist) * 0.5;
          const nx = cx / cDist;
          const ny = cy / cDist;
          const nz = cz / cDist;

          // Soft push apart
          const spring = 0.2;
          pos.x += nx * overlap * spring;
          pos.y += ny * overlap * spring;
          pos.z += nz * overlap * spring;
          qpos.x -= nx * overlap * spring;
          qpos.y -= ny * overlap * spring;
          qpos.z -= nz * overlap * spring;

          // Gentle impulse exchange to make them bounce and rotate off each other
          p.vx += nx * 0.3; p.vy += ny * 0.3; p.vz += nz * 0.3;
          q.vx -= nx * 0.3; q.vy -= ny * 0.3; q.vz -= nz * 0.3;

          p.avx += ny * 0.01; q.avx -= ny * 0.01;
          p.avy -= nx * 0.01; q.avy += nx * 0.01;
        }
      }

      // 4. Velocity cap and apply
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

      p.mesh.rotation.x += p.avx + p.baseAvx;
      p.mesh.rotation.y += p.avy + p.baseAvy;
      p.mesh.rotation.z += p.avz + p.baseAvz;
      p.avx *= 0.95; p.avy *= 0.95; p.avz *= 0.95;
    }
  }

  let lastTime = 0;
  function animate(time) {
    animationId = requestAnimationFrame(animate);
    const dt = lastTime ? (time - lastTime) / 1000 : 0.016;
    lastTime = time;

    mouse3D.lerp(mouseTarget, 0.1);

    if (isActive) {
      physicsStep(dt);
    }
    renderer.render(scene, camera);
  }

  function checkActivation() {
    const section = document.getElementById('arsenal');
    if (!section) {
      isActive = true; return;
    }
    const rect = section.getBoundingClientRect();
    isActive = rect.top < window.innerHeight && rect.bottom > 0;
  }

  function onMouseMove(e) {
    if (!canvasContainer || !isActive) return;
    const rect = canvasContainer.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const viewHeight = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2;
    const viewWidth = viewHeight * camera.aspect;
    // Map directly to camera plane at z=0
    mouseTarget.set(ndcX * viewWidth * 0.5, ndcY * viewHeight * 0.5, 0);
  }

  function onMouseLeave() {
    mouseTarget.set(100, 100, 100);
  }

  function onResize() {
    if (!canvasContainer || !camera || !renderer) return;
    // Prevent aspect ratio NaN errors
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
    createMaterials();
    if (!initScene()) return;
    createSpheres();

    canvasContainer.addEventListener('mousemove', onMouseMove, { passive: true });
    canvasContainer.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('scroll', checkActivation, { passive: true });

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
