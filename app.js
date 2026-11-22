import * as THREE from 'three';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   1. HERO WEBGL SHADER 3D (DEPTH PARALLAX + SPECULAR METAL LIGHT)
   Usa fotografia arquitetônica real como textura PBR-like em GLSL
   ========================================================= */
function initHeroWebGL() {
  const canvas = document.getElementById('hero-webgl');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTexture: { value: null },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uImageRes: { value: new THREE.Vector2(16, 9) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTime: { value: 0 },
  };

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform vec2 uImageRes;
    uniform vec2 uMouse;
    uniform float uTime;
    varying vec2 vUv;

    vec2 coverUv(vec2 uv, vec2 screenRes, vec2 imgRes) {
      float s = screenRes.x / screenRes.y;
      float i = imgRes.x / imgRes.y;
      vec2 newUv = uv;
      if (s > i) {
        float scale = s / i;
        newUv.y = (uv.y - 0.5) / scale + 0.5;
      } else {
        float scale = i / s;
        newUv.x = (uv.x - 0.5) / scale + 0.5;
      }
      return newUv;
    }

    void main() {
      vec2 baseUv = coverUv(vUv, uResolution, uImageRes);

      // Profundidade 3D sutil baseada na luminância da fachada arquitetônica
      vec3 raw = texture2D(uTexture, baseUv).rgb;
      float lum = dot(raw, vec3(0.299, 0.587, 0.114));
      vec2 offset = (uMouse - 0.5) * (0.018 + lum * 0.018);

      // Zoom respiratório muito suave + parallax 3D
      vec2 uv = (baseUv - 0.5) * 0.96 + 0.5 - offset;
      vec3 col = texture2D(uTexture, clamp(uv, 0.002, 0.998)).rgb;

      // Reflexo especular metálico correndo sobre o alumínio conforme o mouse
      float dist = distance(vUv, uMouse);
      float sheen = smoothstep(0.45, 0.0, dist) * (0.14 + lum * 0.22);
      col += vec3(0.95, 0.80, 0.42) * sheen;

      // Pulso arquitetônico muito sutil nos pontos luminosos de LED
      float ledMask = smoothstep(0.72, 0.98, lum);
      col += col * ledMask * (0.08 + 0.06 * sin(uTime * 1.4));

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const loader = new THREE.TextureLoader();
  loader.load('assets/hero_fachada_widescreen.jpg', (tex) => {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    uniforms.uTexture.value = tex;
    uniforms.uImageRes.value.set(tex.image.width, tex.image.height);
  });

  const mat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  const targetMouse = new THREE.Vector2(0.65, 0.45);
  window.addEventListener('pointermove', (e) => {
    if (REDUCED_MOTION) return;
    targetMouse.set(e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    uniforms.uTime.value = REDUCED_MOTION ? 0 : clock.getElapsedTime();
    uniforms.uMouse.value.lerp(targetMouse, 0.055);
    if (uniforms.uTexture.value) {
      renderer.render(scene, camera);
    }
  }
  animate();
}

/* =========================================================
   2. MOSTRUÁRIO TÁTIL 3D DE CHAPAS DE ACM (TILT + REFLEXO METÁLICO)
   ========================================================= */
function initMetalPlates3D() {
  if (REDUCED_MOTION) return;
  document.querySelectorAll('[data-plate]').forEach((plate) => {
    plate.addEventListener('pointermove', (e) => {
      const r = plate.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const rx = ((y / r.height) - 0.5) * -14;
      const ry = ((x / r.width) - 0.5) * 14;
      plate.style.setProperty('--px', `${x}px`);
      plate.style.setProperty('--py', `${y}px`);
      plate.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });

    plate.addEventListener('pointerleave', () => {
      plate.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* =========================================================
   3. HEADER SCROLL + BRIEFING WHATSAPP (SEM PREÇOS)
   ========================================================= */
function initUI() {
  const topbar = document.getElementById('topbar');
  if (topbar) {
    const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const form = document.getElementById('brief-form');
  if (!form) return;

  const largura = document.getElementById('b-largura');
  const altura = document.getElementById('b-altura');
  const note = document.getElementById('brief-area-note');

  const updateArea = () => {
    const area = ((parseFloat(largura.value) || 0) * (parseFloat(altura.value) || 0)).toFixed(1).replace('.', ',');
    note.textContent = `Área aproximada: ${area} m² — análise técnica e proposta personalizada via WhatsApp.`;
  };

  largura.addEventListener('input', updateArea);
  altura.addEventListener('input', updateArea);
  updateArea();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('b-nome').value;
    const servico = document.getElementById('b-servico').value;
    const acabamento = document.getElementById('b-acabamento').value;
    const cidade = document.getElementById('b-cidade').value;
    const area = ((parseFloat(largura.value) || 0) * (parseFloat(altura.value) || 0)).toFixed(1).replace('.', ',');

    const msg = [
      `Olá! Vim pelo site da *Real Fachadas ACM & Gráfica Real Express* e gostaria de um projeto personalizado:`,
      `• *Cliente/Empresa:* ${nome}`,
      `• *Serviço:* ${servico}`,
      `• *Acabamento:* ${acabamento}`,
      `• *Medidas aprox.:* ${largura.value}m x ${altura.value}m (${area} m²)`,
      `• *Cidade:* ${cidade}`,
    ].join('\n');

    window.open(`https://wa.me/556336022156?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
}

initHeroWebGL();
initMetalPlates3D();
initUI();
