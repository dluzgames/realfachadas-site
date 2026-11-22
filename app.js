import * as THREE from 'three';

/* =========================================================
   1. FUNDO 3D ARQUITETÔNICO SUTIL (Three.js)
   ========================================================= */
function initBackground3D() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 14);

  const group = new THREE.Group();
  scene.add(group);

  // Painéis metálicos arquitetônicos sutis em profundidade
  const panelGeo = new THREE.BoxGeometry(1.6, 0.9, 0.06);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x0f2747,
    metalness: 0.85,
    roughness: 0.25,
    transparent: true,
    opacity: 0.32,
  });

  const panels = [];
  const positions = [
    [-7.5, 3.2, -4],
    [7.8, 3.6, -5],
    [-6.2, -3.4, -3],
    [6.5, -2.8, -4],
    [0.5, 4.5, -6],
    [-2.5, -4.6, -5],
  ];

  positions.forEach(([x, y, z], i) => {
    const mesh = new THREE.Mesh(panelGeo, panelMat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(0.2 * i, 0.4 * i, 0.1 * i);
    group.add(mesh);
    panels.push({ mesh, baseY: y, speed: 0.35 + i * 0.08, phase: i * 1.1 });
  });

  const amb = new THREE.AmbientLight(0x8da9c4, 0.8);
  scene.add(amb);

  const goldLight = new THREE.PointLight(0xd4af37, 14, 30);
  goldLight.position.set(4, 3, 6);
  scene.add(goldLight);

  const blueLight = new THREE.PointLight(0x2563eb, 12, 30);
  blueLight.position.set(-6, -3, 5);
  scene.add(blueLight);

  let targetX = 0;
  let targetY = 0;
  window.addEventListener('pointermove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 1.2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.8;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    panels.forEach((p) => {
      p.mesh.position.y = p.baseY + Math.sin(t * p.speed + p.phase) * 0.35;
      p.mesh.rotation.y += 0.002;
    });
    group.rotation.y += (targetX * 0.15 - group.rotation.y) * 0.04;
    group.rotation.x += (targetY * 0.12 - group.rotation.x) * 0.04;
    renderer.render(scene, camera);
  }
  animate();
}

/* =========================================================
   2. MAQUETE 3D INTERATIVA DA FACHADA EM ACM + LED (Three.js)
   ========================================================= */
function initFacade3D() {
  const viewport = document.getElementById('stage-viewport');
  const canvas = document.getElementById('facade-canvas');
  if (!viewport || !canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, viewport.clientWidth / viewport.clientHeight, 0.1, 100);
  camera.position.set(2.1, 1.35, 6.9);
  camera.lookAt(0, 0.25, 0);

  const resize = () => {
    const w = viewport.clientWidth;
    const h = viewport.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  // Grupo principal da maquete arquitetônica
  const building = new THREE.Group();
  scene.add(building);

  // Materiais PBR
  const acmMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0b2545'),
    metalness: 0.72,
    roughness: 0.28,
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x101720,
    metalness: 0.65,
    roughness: 0.35,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xd8e2ec,
    metalness: 0.92,
    roughness: 0.18,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x091a2e,
    metalness: 0.15,
    roughness: 0.08,
    transmission: 0.25,
    reflectivity: 0.95,
  });

  const ledMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f5c451'),
    emissive: new THREE.Color('#f5c451'),
    emissiveIntensity: 3.2,
    roughness: 0.2,
  });

  const letterMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: new THREE.Color('#f5c451'),
    emissiveIntensity: 0.45,
    metalness: 0.85,
    roughness: 0.18,
  });

  // Base / Calçada arquitetônica
  const base = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.18, 3.8), darkTrimMat);
  base.position.set(0, -1.45, 0);
  building.add(base);

  // Corpo estrutural do prédio
  const core = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.7, 2.2), darkTrimMat);
  core.position.set(0, -0.05, -0.2);
  building.add(core);

  // Painéis modulares de ACM com frisos reais (3 colunas x 2 linhas)
  const panelW = 1.48;
  const panelH = 0.76;
  const gap = 0.06;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const px = (col - 1) * (panelW + gap);
      const py = 0.48 + row * (panelH + gap);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(panelW, panelH, 0.14), acmMaterial);
      panel.position.set(px, py, 0.96);
      building.add(panel);
    }
  }

  // Pilares laterais em ACM
  [-2.22, 2.22].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.8, 0.42), acmMaterial);
    pillar.position.set(x, 0.02, 0.92);
    building.add(pillar);
  });

  // Marquise metálica projetada em aço escovado
  const marquee = new THREE.Mesh(new THREE.BoxGeometry(4.85, 0.16, 0.88), steelMat);
  marquee.position.set(0, -0.02, 1.18);
  building.add(marquee);

  // Vitrine de vidro inferior
  const glass = new THREE.Mesh(new THREE.BoxGeometry(3.9, 1.32, 0.08), glassMat);
  glass.position.set(0, -0.74, 0.86);
  building.add(glass);

  // Perfis de alumínio na vitrine
  [-1.3, 0, 1.3].forEach((x) => {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.34, 0.12), steelMat);
    mullion.position.set(x, -0.74, 0.88);
    building.add(mullion);
  });

  // Fitas de LED perimetrais (superior e sob a marquise)
  const ledTop = new THREE.Mesh(new THREE.BoxGeometry(4.62, 0.055, 0.055), ledMaterial);
  ledTop.position.set(0, 1.66, 1.04);
  building.add(ledTop);

  const ledMid = new THREE.Mesh(new THREE.BoxGeometry(4.62, 0.045, 0.045), ledMaterial);
  ledMid.position.set(0, 0.08, 1.04);
  building.add(ledMid);

  const ledLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.62, 0.05), ledMaterial);
  ledLeft.position.set(-2.3, 0.87, 1.04);
  building.add(ledLeft);

  // Letras Caixa 3D geométricas estilizadas ("REAL") em alto relevo na fachada
  const lettersGroup = new THREE.Group();
  lettersGroup.position.set(-1.35, 0.56, 1.12);
  building.add(lettersGroup);

  const bar = (w, h, x, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.14), letterMaterial);
    m.position.set(x, y, 0);
    return m;
  };

  // Letra R
  const letterR = new THREE.Group();
  letterR.add(bar(0.11, 0.62, 0, 0));
  letterR.add(bar(0.32, 0.11, 0.16, 0.255));
  letterR.add(bar(0.32, 0.11, 0.16, 0.02));
  letterR.add(bar(0.11, 0.34, 0.30, 0.14));
  const rLeg = bar(0.11, 0.38, 0.24, -0.15);
  rLeg.rotation.z = 0.42;
  letterR.add(rLeg);
  lettersGroup.add(letterR);

  // Letra E
  const letterE = new THREE.Group();
  letterE.position.x = 0.72;
  letterE.add(bar(0.11, 0.62, 0, 0));
  letterE.add(bar(0.36, 0.11, 0.18, 0.255));
  letterE.add(bar(0.30, 0.10, 0.15, 0.0));
  letterE.add(bar(0.36, 0.11, 0.18, -0.255));
  lettersGroup.add(letterE);

  // Letra A
  const letterA = new THREE.Group();
  letterA.position.x = 1.48;
  const aLeft = bar(0.11, 0.65, 0.08, 0);
  aLeft.rotation.z = -0.22;
  const aRight = bar(0.11, 0.65, 0.30, 0);
  aRight.rotation.z = 0.22;
  letterA.add(aLeft, aRight, bar(0.28, 0.10, 0.19, -0.06));
  lettersGroup.add(letterA);

  // Letra L
  const letterL = new THREE.Group();
  letterL.position.x = 2.24;
  letterL.add(bar(0.11, 0.62, 0, 0));
  letterL.add(bar(0.36, 0.11, 0.18, -0.255));
  lettersGroup.add(letterL);

  // Iluminação cênica (realça o metálico do ACM e as letras 3D)
  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 1.35));
  scene.add(new THREE.AmbientLight(0x94a9c4, 0.9));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
  keyLight.position.set(4, 6, 8);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x60a5fa, 1.6);
  fillLight.position.set(-5, 2, 6);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xd4af37, 1.4);
  rimLight.position.set(6, 4, -4);
  scene.add(rimLight);

  const ledGlowLight = new THREE.PointLight(0xf5c451, 9, 9);
  ledGlowLight.position.set(0, 0.85, 2.0);
  building.add(ledGlowLight);

  // Interação: arrastar para girar a maquete
  let isDragging = false;
  let prevX = 0;
  let prevY = 0;
  let rotY = -0.22;
  let rotX = 0.05;
  let targetRotY = rotY;
  let targetRotX = rotX;

  viewport.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    prevX = e.clientX;
    prevY = e.clientY;
    targetRotY += dx * 0.008;
    targetRotX = Math.max(-0.22, Math.min(0.35, targetRotX + dy * 0.005));
  });

  // Controles de cor do ACM e LED em tempo real
  document.querySelectorAll('#acm-swatches .swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#acm-swatches .swatch').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      acmMaterial.color.set(btn.dataset.acm);
      acmMaterial.metalness = parseFloat(btn.dataset.metal || '0.72');
    });
  });

  document.querySelectorAll('#led-swatches .swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#led-swatches .swatch').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const col = new THREE.Color(btn.dataset.led);
      ledMaterial.color.copy(col);
      ledMaterial.emissive.copy(col);
      letterMaterial.emissive.copy(col);
      ledGlowLight.color.copy(col);
    });
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (!isDragging) {
      targetRotY += Math.sin(t * 0.45) * 0.0008;
    }
    rotY += (targetRotY - rotY) * 0.08;
    rotX += (targetRotX - rotX) * 0.08;
    building.rotation.y = rotY;
    building.rotation.x = rotX;
    building.position.y = Math.sin(t * 1.1) * 0.06;
    renderer.render(scene, camera);
  }
  animate();
}

/* =========================================================
   3. EFEITO TILT 3D NOS CARDS + BRILHO METÁLICO
   ========================================================= */
function initTiltCards() {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -9;
      const ry = ((x / rect.width) - 0.5) * 9;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* =========================================================
   4. SIMULADOR DE ORÇAMENTO + WHATSAPP + MENU MOBILE
   ========================================================= */
function initUI() {
  const menuBtn = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-links');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  const form = document.getElementById('quote-form');
  if (!form) return;

  const servico = document.getElementById('q-servico');
  const acabamento = document.getElementById('q-acabamento');
  const largura = document.getElementById('q-largura');
  const altura = document.getElementById('q-altura');
  const cidade = document.getElementById('q-cidade');
  const nome = document.getElementById('q-nome');

  const updateSummary = () => {
    const l = parseFloat(largura.value) || 0;
    const a = parseFloat(altura.value) || 0;
    const area = (l * a).toFixed(1).replace('.', ',');
    document.getElementById('sum-servico').textContent = servico.value;
    document.getElementById('sum-acabamento').textContent = acabamento.value;
    document.getElementById('sum-area').textContent = `${area} m² (${l}m × ${a}m)`;
    document.getElementById('sum-cidade').textContent = cidade.value || 'Paraíso do Tocantins - TO';
  };

  [servico, acabamento, largura, altura, cidade].forEach((el) => el.addEventListener('input', updateSummary));
  updateSummary();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const l = parseFloat(largura.value) || 0;
    const a = parseFloat(altura.value) || 0;
    const area = (l * a).toFixed(1).replace('.', ',');
    const msg = [
      `Olá! Vim pelo site da *Real Fachadas ACM & Gráfica Real Express* e gostaria de um orçamento:`,
      `• *Cliente/Empresa:* ${nome.value}`,
      `• *Serviço:* ${servico.value}`,
      `• *Acabamento:* ${acabamento.value}`,
      `• *Medidas aprox.:* ${l}m x ${a}m (${area} m²)`,
      `• *Cidade:* ${cidade.value || 'Paraíso do Tocantins - TO'}`,
    ].join('\n');

    window.open(`https://wa.me/556336022156?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
}

initBackground3D();
initFacade3D();
initTiltCards();
initUI();
