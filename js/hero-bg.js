/* =========================================
   HERO WEBGL GRADIENT MESH BACKGROUND
   Animated flowing gradient orbs with noise
   ========================================= */
(function () {
  'use strict';

  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (window.innerWidth <= 768) { initMobileGradient(); return; }

  const canvas = document.createElement('canvas');
  canvas.id = 'hero-webgl-bg';
  hero.insertBefore(canvas, hero.firstChild);

  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) { initMobileGradient(); return; }

  let mouseX = 0.5, mouseY = 0.5;
  let targetMouseX = 0.5, targetMouseY = 0.5;
  let animId;

  /* --- Shaders --- */
  const VERT = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}`;

  const FRAG = `
precision highp float;
uniform float u_t;
uniform vec2 u_res;
uniform vec2 u_mouse;

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289v2(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 perm(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
  i=mod289v2(i);
  vec3 p=perm(perm(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;
  vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float t=u_t*0.12;
  float n1=snoise(uv*2.5+t);
  float n2=snoise(uv*3.0-t*0.7);
  vec2 w=uv+vec2(n1,n2)*0.06;

  vec2 p1=vec2(0.3+sin(t*1.1)*0.25,0.35+cos(t*0.8)*0.25);
  vec2 p2=vec2(0.7+cos(t*0.9)*0.2,0.65+sin(t*1.2)*0.2);
  vec2 p3=vec2(0.5+sin(t*1.5)*0.15,0.25+cos(t*1.1)*0.2);
  vec2 p4=vec2(0.15+cos(t*0.7)*0.2,0.7+sin(t*0.9)*0.15);

  vec2 mp=(u_mouse-0.5)*0.06;

  float d1=smoothstep(0.6,0.0,length(w-p1-mp));
  float d2=smoothstep(0.5,0.0,length(w-p2+mp*0.5));
  float d3=smoothstep(0.55,0.0,length(w-p3-mp*0.3));
  float d4=smoothstep(0.45,0.0,length(w-p4+mp*0.7));

  vec3 c1=vec3(0.424,0.235,0.882);
  vec3 c2=vec3(0.945,0.459,0.627);
  vec3 c3=vec3(0.0,0.55,0.85);
  vec3 c4=vec3(0.12,0.08,0.35);

  vec3 col=vec3(0.039,0.039,0.039);
  col=mix(col,c4,d4*0.55);
  col=mix(col,c1,d1*0.38);
  col=mix(col,c2,d2*0.28);
  col=mix(col,c3,d3*0.22);

  float grain=snoise(gl_FragCoord.xy*0.5)*0.012;
  col+=grain;

  // Subtle vignette
  float vig=1.0-smoothstep(0.4,1.4,length(uv-0.5)*1.8);
  col*=mix(0.7,1.0,vig);

  gl_FragColor=vec4(col,1.0);
}`;

  /* --- GL Setup --- */
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[HeroBG] Shader error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) {
    canvas.remove();
    initMobileGradient();
    return;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[HeroBG] Program link error:', gl.getProgramInfoLog(prog));
    canvas.remove();
    initMobileGradient();
    return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_t');
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const rect = hero.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    targetMouseX = (e.clientX - r.left) / r.width;
    targetMouseY = 1.0 - (e.clientY - r.top) / r.height;
  });

  function render(t) {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    gl.uniform1f(uTime, t * 0.001);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animId = requestAnimationFrame(render);
  }
  animId = requestAnimationFrame(render);

  /* --- Mobile Fallback: CSS animated gradient --- */
  function initMobileGradient() {
    if (!hero) return;
    const div = document.createElement('div');
    div.id = 'hero-webgl-bg';
    div.classList.add('hero-bg-mobile');
    hero.insertBefore(div, hero.firstChild);
  }
})();
