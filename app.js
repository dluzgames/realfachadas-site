const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. Profundidade 3D suave no Mosaico de Obras Reais do Hero */
function initHeroMosaic3D() {
  if (REDUCED_MOTION) return;
  const mosaic = document.getElementById('hero-mosaic-3d');
  if (!mosaic) return;

  mosaic.addEventListener('pointermove', (e) => {
    const r = mosaic.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
    mosaic.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  mosaic.addEventListener('pointerleave', () => {
    mosaic.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

/* 2. Mostruário Tátil 3D de Chapas de ACM (tilt + brilho metálico) */
function initMetalPlates3D() {
  if (REDUCED_MOTION) return;
  document.querySelectorAll('[data-plate]').forEach((plate) => {
    plate.addEventListener('pointermove', (e) => {
      const r = plate.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const rx = ((y / r.height) - 0.5) * -13;
      const ry = ((x / r.width) - 0.5) * 13;
      plate.style.setProperty('--px', `${x}px`);
      plate.style.setProperty('--py', `${y}px`);
      plate.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
    });

    plate.addEventListener('pointerleave', () => {
      plate.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* 3. Briefing Técnico WhatsApp (sem preços) */
function initBriefForm() {
  const form = document.getElementById('brief-form');
  if (!form) return;

  const largura = document.getElementById('b-largura');
  const altura = document.getElementById('b-altura');
  const note = document.getElementById('brief-area-note');

  const updateArea = () => {
    const area = ((parseFloat(largura.value) || 0) * (parseFloat(altura.value) || 0)).toFixed(1).replace('.', ',');
    note.textContent = `Área aproximada: ${area} m² — análise técnica personalizada via WhatsApp.`;
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
      `Olá! Vim pelo site da *Gráfica Real Express & Real Fachadas ACM* e gostaria de um projeto personalizado:`,
      `• *Cliente/Empresa:* ${nome}`,
      `• *Serviço:* ${servico}`,
      `• *Acabamento:* ${acabamento}`,
      `• *Medidas aprox.:* ${largura.value}m x ${altura.value}m (${area} m²)`,
      `• *Cidade:* ${cidade}`,
    ].join('\n');

    const canal = document.getElementById('b-canal')?.value || '5563984498130';
    window.open(`https://wa.me/${canal}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
}

initHeroMosaic3D();
initMetalPlates3D();
initBriefForm();
