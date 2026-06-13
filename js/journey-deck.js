/* js/journey-deck.js — Journey path + collages + orbit, fully reversible */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  /* =============================================
     1. THREE.JS PARTICLE BACKGROUND
     ============================================= */
  const canvas = document.getElementById('journey-bg-canvas');
  if (canvas && window.THREE) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
    camera.position.z = 400;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const COUNT = 400;
    const pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
    const palette = [[.42,.24,.88],[.94,.46,.63],[.87,.57,.19],[.13,.59,.33],[.83,.21,.87]];
    for (let i = 0; i < COUNT; i++) {
      pos[i*3]=(Math.random()-.5)*900; pos[i*3+1]=(Math.random()-.5)*900; pos[i*3+2]=(Math.random()-.5)*500;
      const c = palette[~~(Math.random()*palette.length)];
      col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 2, vertexColors: true, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false });
    const pts = new THREE.Points(geo, mat); scene.add(pts);
    const lGeo = new THREE.BufferGeometry();
    const lPos = new Float32Array(100*100*6);
    lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    const lMat = new THREE.LineBasicMaterial({ color: 0x6C3CE1, transparent: true, opacity: 0.03, blending: THREE.AdditiveBlending, depthWrite: false });
    const lines = new THREE.LineSegments(lGeo, lMat); scene.add(lines);
    let mx=0, my=0;
    document.addEventListener('mousemove', e => { mx=(e.clientX/innerWidth-.5)*2; my=(e.clientY/innerHeight-.5)*2; });
    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      const t = clock.getElapsedTime(), p = geo.attributes.position.array;
      for (let i=0;i<COUNT;i++) { p[i*3+1]+=Math.sin(t*.3+i*.01)*.1; p[i*3]+=Math.cos(t*.2+i*.02)*.05; }
      geo.attributes.position.needsUpdate = true;
      let li=0;
      for (let i=0;i<100;i++) for (let j=i+1;j<100;j++) {
        const dx=p[i*3]-p[j*3],dy=p[i*3+1]-p[j*3+1],dz=p[i*3+2]-p[j*3+2];
        if(dx*dx+dy*dy+dz*dz<6400){lPos[li++]=p[i*3];lPos[li++]=p[i*3+1];lPos[li++]=p[i*3+2];lPos[li++]=p[j*3];lPos[li++]=p[j*3+1];lPos[li++]=p[j*3+2];}
      }
      lGeo.setDrawRange(0,li/3); lGeo.attributes.position.needsUpdate=true;
      pts.rotation.y+=(mx*.08-pts.rotation.y)*.015; pts.rotation.x+=(-my*.06-pts.rotation.x)*.015;
      lines.rotation.copy(pts.rotation); pts.rotation.y+=.0002;
      renderer.render(scene, camera);
    })();
    addEventListener('resize', () => { camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });
  }

  /* =============================================
     2. HERO — parallax + flair scatter
     ============================================= */
  const heroTitle = document.querySelector('.deck-hero-title');
  const heroSub = document.querySelector('.deck-hero-sub');
  const heroIndicator = document.querySelector('.scroll-indicator');
  const flairs = gsap.utils.toArray('.hero-flair');

  if (heroTitle) {
    gsap.fromTo(heroTitle, { yPercent: 0, scale: 1, opacity: 1 },
      { yPercent: -40, scale: 0.85, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.deck-hero', start: 'top top', end: 'bottom top', scrub: 0.3 }});
  }
  if (heroSub) {
    gsap.fromTo(heroSub, { yPercent: 0, opacity: 1 },
      { yPercent: -60, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.deck-hero', start: 'top top', end: '60% top', scrub: 0.3 }});
  }
  if (heroIndicator) {
    gsap.fromTo(heroIndicator, { opacity: 0.6 },
      { opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.deck-hero', start: '10% top', end: '30% top', scrub: 0.3 }});
  }
  flairs.forEach((f, i) => {
    const angle = (i / flairs.length) * Math.PI * 2;
    gsap.fromTo(f, { x: 0, y: 0, scale: 1, opacity: 0.6 },
      { x: Math.cos(angle) * 200, y: Math.sin(angle) * 150 - 100, scale: 0.3, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.deck-hero', start: 'top top', end: 'bottom top', scrub: 0.3 }});
  });

  /* =============================================
     3. SEC 1 — JOURNEY PATH (draw on scroll)
     ============================================= */
  const drawPath = document.querySelector('#journeyDrawPath');
  const traveler = document.querySelector('.sec-path__traveler');
  const milestones = gsap.utils.toArray('.sec-path__milestone');

  if (drawPath) {
    // Get total length and set initial dash
    const pathLen = drawPath.getTotalLength();
    gsap.set(drawPath, { strokeDasharray: pathLen, strokeDashoffset: pathLen });

    // Draw the path on scroll
    gsap.fromTo(drawPath,
      { strokeDashoffset: pathLen },
      { strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: '.sec-path', start: 'top 70%', end: 'bottom 20%', scrub: 0.4 }});
  }

  // Traveler follows the SVG path
  if (traveler && drawPath) {
    gsap.fromTo(traveler, { opacity: 1 },
      { motionPath: { path: drawPath, align: drawPath, alignOrigin: [0.5, 0.5], autoRotate: false },
        ease: 'none',
        scrollTrigger: { trigger: '.sec-path', start: 'top 70%', end: 'bottom 20%', scrub: 0.4 }});
  }

  // Milestones light up sequentially
  if (milestones.length) {
    milestones.forEach((m, i) => {
      const progress = i / (milestones.length - 1); // 0 to 1
      const startPct = 70 - (progress * 50); // staggered start
      gsap.fromTo(m,
        { opacity: 0.15, scale: 0.7 },
        { opacity: 1, scale: 1, ease: 'none',
          scrollTrigger: {
            trigger: '.sec-path',
            start: `top ${startPct}%`,
            end: `top ${startPct - 15}%`,
            scrub: 0.4,
          }});
    });
  }

  // Text reveal
  const pathText = document.querySelector('.sec-path__text');
  if (pathText) {
    gsap.fromTo(pathText.children,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: '.sec-path', start: 'top 75%', end: 'top 30%', scrub: 0.5 }});
  }

  /* =============================================
     4. SEC 2 — TEXT + COLLAGE REVEAL
     ============================================= */
  const windmillText = document.querySelector('.sec-windmill__text');
  if (windmillText) {
    gsap.fromTo(windmillText.children, { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: '.sec-windmill', start: 'top 70%', end: 'top 25%', scrub: 0.5 }});
  }
  const collage2 = gsap.utils.toArray('.sec-windmill .collage-item');
  if (collage2.length) {
    gsap.fromTo(collage2, { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, ease: 'none',
        scrollTrigger: { trigger: '.sec-windmill', start: 'top 70%', end: 'top 25%', scrub: 0.5 }});
  }

  /* =============================================
     5. SEC 3 — TEXT + COLLAGE REVEAL
     ============================================= */
  const flowText = document.querySelector('.sec-flow__text');
  if (flowText) {
    gsap.fromTo(flowText.children, { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: '.sec-flow', start: 'top 70%', end: 'top 25%', scrub: 0.5 }});
  }
  const collage3 = gsap.utils.toArray('.sec-flow .collage-item');
  if (collage3.length) {
    gsap.fromTo(collage3, { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, ease: 'none',
        scrollTrigger: { trigger: '.sec-flow', start: 'top 70%', end: 'top 25%', scrub: 0.5 }});
  }

  /* =============================================
     6. SEC 4 — ORBIT LOOP
     ============================================= */
  const orbitRings = gsap.utils.toArray('.sec-lever__ring');
  const orbitDots = gsap.utils.toArray('.sec-lever__orbit-dot');
  const orbitCenter = document.querySelector('.sec-lever__orbit-center');
  const orbitLabels = gsap.utils.toArray('.sec-lever__orbit-label');

  if (orbitRings.length) {
    orbitRings.forEach(ring => {
      gsap.fromTo(ring, { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: '.sec-lever', start: 'top 80%', end: 'top 30%', scrub: 0.5 }});
    });
  }
  if (orbitCenter) {
    gsap.fromTo(orbitCenter, { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '.sec-lever', start: 'top 70%', end: 'top 25%', scrub: 0.5 }});
  }
  if (orbitDots.length) {
    orbitDots.forEach((dot, i) => {
      gsap.fromTo(dot, { rotation: i * 120, opacity: 0 },
        { rotation: i * 120 + 360, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: '.sec-lever', start: 'top 80%', end: 'bottom 20%', scrub: 0.5 }});
    });
  }
  if (orbitLabels.length) {
    gsap.fromTo(orbitLabels, { y: 15, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: '.sec-lever', start: 'top 55%', end: 'top 15%', scrub: 0.5 }});
  }
  const leverText = document.querySelector('.sec-lever__text');
  if (leverText) {
    gsap.fromTo(leverText.children, { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: '.sec-lever', start: 'top 70%', end: 'top 25%', scrub: 0.5 }});
  }

  /* =============================================
     7. SEC 5 — PARALLAX FLAIR
     ============================================= */
  const pFlairs = gsap.utils.toArray('.sec-parallax__flair');
  pFlairs.forEach((f, i) => {
    const speeds = [80, -60, 100, -45, 70, -35, 55, -80];
    const speed = speeds[i] || 50;
    gsap.fromTo(f, { yPercent: speed }, { yPercent: -speed, ease: 'none',
      scrollTrigger: { trigger: '.sec-parallax', start: 'top bottom', end: 'bottom top', scrub: 0.3 }});
  });
  const pContent = document.querySelector('.sec-parallax__content');
  if (pContent) {
    gsap.fromTo(pContent.children, { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: '.sec-parallax', start: 'top 70%', end: 'top 20%', scrub: 0.5 }});
  }
});
