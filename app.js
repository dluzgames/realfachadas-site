import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Constrói letras caixa 3D geométricas ("REAL") reutilizáveis */
function createRealLetters(material) {
  const group = new THREE.Group();
  const bar = (w, h, x, y, d = 0.16) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, 0);
    return m;
  };

  // R
  const r = new THREE.Group();
  r.add(bar(0.11, 0.64, 0, 0));
  r.add(bar(0.32, 0.11, 0.16, 0.265));
  r.add(bar(0.32, 0.11, 0.16, 0.02));
  r.add(bar(0.11, 0.35, 0.30, 0.14));
  const rLeg = bar(0.11, 0.38, 0.24, -0.15);
  rLeg.rotation.z = 0.42;
  r.add(rLeg);
  group.add(r);

  // E
  const e = new THREE.Group();
  e.position.x = 0.72;
  e.add(bar(0.11, 0.64, 0, 0));
  e.add(bar(0.36, 0.11, 0.18, 0.265));
  e.add(bar(0.30, 0.10, 0.15, 0.0));
  e.add(bar(0.36, 0.11, 0.18, -0.265));
  group.add(e);

  // A
  const a = new THREE.Group();
  a.position.x = 1.48;
  const aL = bar(0.11, 0.66, 0.08, 0);
  aL.rotation.z = -0.22;
  const aR = bar(0.11, 0.66, 0.30, 0);
  aR.rotation.z = 0.22;
  a.add(aL, aR, bar(0.28, 0.10, 0.19, -0.06));
  group.add(a);

  // L
  const l = new THREE.Group();
  l.position.x = 2.24;
  l.add(bar(0.11, 0.64, 0, 0));
  l.add(bar(0.36, 0.11, 0.18, -0.265));
  group.add(l);

  return group;
}

/* =========================================================
   1. MAQUETE 3D INTERATIVA DO HERO COM UNREALBLOOMPASS REAL
   ========================================================= */
function initHeroFacade3D() {
  const box = document.getElementById('hero-stage-box');
  const canvas = document.getElementById('hero-facade-canvas');
  if (!box || !canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, box.clientWidth / box.clientHeight, 0.1, 100);
  camera.position.set(2.0, 1.25, 6.8);
  camera.lookAt(0, 0.22, 0);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(box.clientWidth, box.clientHeight),
    0.65,
    0.45,
    0.72
  );
  composer.addPass(bloomPass);

  const resize = () => {
    const w = box.clientWidth;
    const h = box.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  const building = new THREE.Group();
  scene.add(building);

  const acmMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0b2545'),
    metalness: 0.78,
    roughness: 0.24,
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0e131b,
    metalness: 0.65,
    roughness: 0.35,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xdce4ee,
    metalness: 0.92,
    roughness: 0.16,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a1c33,
    metalness: 0.15,
    roughness: 0.08,
    reflectivity: 0.95,
  });

  const ledMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f5c451'),
    emissive: new THREE.Color('#f5c451'),
    emissiveIntensity: 2.6,
    roughness: 0.2,
  });

  const letterMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: new THREE.Color('#f5c451'),
    emissiveIntensity: 0.95,
    metalness: 0.8,
    roughness: 0.18,
  });

  // Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.16, 3.6), frameMat);
  base.position.set(0, -1.45, 0);
  building.add(base);

  // Núcleo estrutural
  const core = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.7, 2.1), frameMat);
  core.position.set(0, -0.05, -0.2);
  building.add(core);

  // 6 Painéis ACM com frisos precisos
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.76, 0.15), acmMat);
      panel.position.set((col - 1) * 1.54, 0.48 + row * 0.82, 0.94);
      building.add(panel);
    }
  }

  // Pilares laterais
  [-2.24, 2.24].forEach((x) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.82, 0.44), acmMat);
    p.position.set(x, 0.02, 0.90);
    building.add(p);
  });

  // Marquise
  const marquee = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.15, 0.88), steelMat);
  marquee.position.set(0, -0.02, 1.16);
  building.add(marquee);

  // Vitrine
  const glass = new THREE.Mesh(new THREE.BoxGeometry(3.9, 1.32, 0.08), glassMat);
  glass.position.set(0, -0.74, 0.84);
  building.add(glass);

  [-1.3, 0, 1.3].forEach((x) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.34, 0.12), steelMat);
    m.position.set(x, -0.74, 0.86);
    building.add(m);
  });

  // Fitas LED com bloom real
  const ledTop = new THREE.Mesh(new THREE.BoxGeometry(4.64, 0.05, 0.05), ledMat);
  ledTop.position.set(0, 1.66, 1.04);
  const ledMid = new THREE.Mesh(new THREE.BoxGeometry(4.64, 0.042, 0.042), ledMat);
  ledMid.position.set(0, 0.08, 1.04);
  const ledLeft = new THREE.Mesh(new THREE.BoxGeometry(0.045, 1.62, 0.045), ledMat);
  ledLeft.position.set(-2.31, 0.87, 1.04);
  building.add(ledTop, ledMid, ledLeft);

  // Letras Caixa 3D "REAL"
  const letters = createRealLetters(letterMat);
  letters.position.set(-1.32, 0.56, 1.12);
  building.add(letters);

  // Luzes de estúdio
  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x090c11, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 6, 8);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x60a5fa, 1.35);
  fill.position.set(-5, 2, 6);
  scene.add(fill);

  const ledPoint = new THREE.PointLight(0xf5c451, 7, 8);
  ledPoint.position.set(0, 0.85, 2.0);
  building.add(ledPoint);

  // Interação arrastar
  let dragging = false;
  let px = 0;
  let py = 0;
  let rotY = -0.20;
  let rotX = 0.05;
  let tRotY = rotY;
  let tRotX = rotX;

  box.addEventListener('pointerdown', (e) => {
    dragging = true;
    px = e.clientX;
    py = e.clientY;
  });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    tRotY += (e.clientX - px) * 0.008;
    tRotX = Math.max(-0.22, Math.min(0.32, tRotX + (e.clientY - py) * 0.005));
    px = e.clientX;
    py = e.clientY;
  });

  // Troca de acabamento ao vivo
  document.querySelectorAll('#acm-swatches .swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#acm-swatches .swatch').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      acmMat.color.set(btn.dataset.acm);
      acmMat.metalness = parseFloat(btn.dataset.metal || '0.78');
    });
  });

  document.querySelectorAll('#led-swatches .swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#led-swatches .swatch').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const c = new THREE.Color(btn.dataset.led);
      ledMat.color.copy(c);
      ledMat.emissive.copy(c);
      letterMat.emissive.copy(c);
      ledPoint.color.copy(c);
    });
  });

  const clock = new THREE.Clock();
  function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    if (!dragging && !REDUCED_MOTION) {
      tRotY += Math.sin(t * 0.4) * 0.0007;
    }
    rotY += (tRotY - rotY) * 0.08;
    rotX += (tRotX - rotX) * 0.08;
    building.rotation.set(rotX, rotY, 0);
    composer.render();
  }
  loop();
}

/* =========================================================
   2. MOVIMENTO-ASSINATURA (O PICO): MONTAGEM 3D NO SCROLL
   Lê --progresso (0 -> 1) da seção [data-fx-fixa] em tempo real
   ========================================================= */
function initScrollAssembly3D() {
  const section = document.getElementById('montagem');
  const canvas = document.getElementById('scroll-assembly-canvas');
  if (!section || !canvas) return;

  const wrap = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
  camera.position.set(1.6, 1.0, 6.6);
  camera.lookAt(0, 0.35, 0);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(wrap.clientWidth, wrap.clientHeight),
    0.55,
    0.45,
    0.75
  );
  composer.addPass(bloom);

  const resize = () => {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  const rig = new THREE.Group();
  scene.add(rig);

  // Etapa 1: Estrutura metálica / chassi CNC (wireframe + vigas)
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.85,
    roughness: 0.3,
  });
  const chassis = new THREE.Group();
  for (let i = -2; i <= 2; i++) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.12), chassisMat);
    v.position.set(i * 1.1, 0.5, 0.55);
    chassis.add(v);
  }
  [-0.5, 0.5, 1.5].forEach((y) => {
    const h = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.08, 0.12), chassisMat);
    h.position.set(0, y, 0.55);
    chassis.add(h);
  });
  rig.add(chassis);

  // Etapa 2: 6 Painéis ACM que voam e encaixam na estrutura
  const acmMat = new THREE.MeshStandardMaterial({
    color: 0x0b2545,
    metalness: 0.82,
    roughness: 0.22,
  });
  const panels = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.78, 0.14), acmMat);
      const target = new THREE.Vector3((col - 1) * 1.50, 0.16 + row * 0.84, 0.74);
      const start = new THREE.Vector3((col - 1) * 3.1, 0.16 + (row === 0 ? -1.4 : 1.9), 2.8);
      mesh.position.copy(start);
      rig.add(mesh);
      panels.push({ mesh, start, target });
    }
  }

  // Etapa 3: Letras Caixa 3D + LED que acendem no final do scroll
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    emissive: 0xf5c451,
    emissiveIntensity: 0.0,
    roughness: 0.2,
  });
  const letterMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xf5c451,
    emissiveIntensity: 0.0,
    metalness: 0.85,
    roughness: 0.18,
  });

  const ledTop = new THREE.Mesh(new THREE.BoxGeometry(4.52, 0.055, 0.055), ledMat);
  ledTop.position.set(0, 1.44, 0.86);
  const ledBot = new THREE.Mesh(new THREE.BoxGeometry(4.52, 0.055, 0.055), ledMat);
  ledBot.position.set(0, -0.28, 0.86);
  rig.add(ledTop, ledBot);

  const letters = createRealLetters(letterMat);
  letters.position.set(-1.32, 0.42, 0.94);
  rig.add(letters);

  // Luzes
  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x090c11, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 8);
  scene.add(key);

  const ledGlow = new THREE.PointLight(0xf5c451, 0, 9);
  ledGlow.position.set(0, 0.6, 2.0);
  rig.add(ledGlow);

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function renderScroll() {
    requestAnimationFrame(renderScroll);
    const raw = parseFloat(getComputedStyle(section).getPropertyValue('--progresso')) || (REDUCED_MOTION ? 1 : 0);
    const p = REDUCED_MOTION ? 1 : clamp01(raw);

    // Rotação suave arquitetônica guiada pela rolagem
    rig.rotation.y = -0.38 + p * 0.52;
    rig.rotation.x = 0.08 - p * 0.06;

    // Etapa 1 (0 -> 0.30): chassi escala e firma
    const s1 = easeOut(clamp01(p / 0.28));
    chassis.scale.setScalar(0.85 + s1 * 0.15);

    // Etapa 2 (0.22 -> 0.66): painéis ACM encaixam na estrutura
    const s2 = easeOut(clamp01((p - 0.22) / 0.44));
    panels.forEach(({ mesh, start, target }) => {
      mesh.position.lerpVectors(start, target, s2);
      mesh.rotation.y = (1 - s2) * 0.45;
    });

    // Etapa 3 (0.62 -> 0.96): letras caixa emergem + LED acende com bloom real
    const s3 = easeOut(clamp01((p - 0.62) / 0.34));
    letters.position.z = 0.55 + s3 * 0.44;
    letters.scale.setScalar(0.7 + s3 * 0.3);
    ledMat.emissiveIntensity = s3 * 3.0;
    letterMat.emissiveIntensity = s3 * 1.1;
    ledGlow.intensity = s3 * 8.5;

    composer.render();
  }
  renderScroll();
}

/* =========================================================
   3. BRIEFING WHATSAPP (SEM PREÇOS)
   ========================================================= */
function initBriefForm() {
  const form = document.getElementById('brief-form');
  if (!form) return;

  const largura = document.getElementById('b-largura');
  const altura = document.getElementById('b-altura');
  const note = document.getElementById('brief-area-note');

  const updateArea = () => {
    const area = ((parseFloat(largura.value) || 0) * (parseFloat(altura.value) || 0)).toFixed(1).replace('.', ',');
    note.textContent = `Área aproximada informada: ${area} m² — proposta técnica personalizada via WhatsApp.`;
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

initHeroFacade3D();
initScrollAssembly3D();
initBriefForm();
