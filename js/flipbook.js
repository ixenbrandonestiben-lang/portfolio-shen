document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // 📋 DATOS DE PROYECTOS — Edita/Agrega aquí. El libro se solo.
  // ============================================================
  const projects = [
    {
      slot: '01',
      category: 'FRONTEND // DISPONIBLE',
      title: 'Karenflix',
      desc: 'Plataforma de streaming con interfaz tipo catálogo, diseño responsivo y navegación fluida. Construida con enfoque en experiencia de usuario y arquitectura limpia.',
      tech: 'HTML · CSS · JavaScript . express . Node.js',
      image: 'img/karenflix.png',
      url: 'https://github.com/ixenbrandonestiben-lang/karenflix-frontend',
      status: 'ESTADO: DISPONIBLE'
    },
    {
      slot: '02',
      category: 'FRONTEND // DISPONIBLE',
      title: 'Biblioteca villa',
      desc: ' Desde aquí puedes explorar libros, iniciar sesión y usar las herramientas de la biblioteca.',
      tech: 'HTML . CSS . Javascript . express . Node.js',
      image: 'img/biblioteca-villa.png',
      url: 'https://github.com/ixenbrandonestiben-lang/gestion-libros-bliblioteca-frontend',
      status: 'ESTADO: DISPONIBLE'
    },
    {
      slot: '03',
      category: 'FRONTEND // DISPONIBLE',
      title: 'Simulador de Neurona Artificial',
      desc: 'Simulador interactivo y visual paso a paso de una neurona artificial que muestra en tiempo real cómo se combinan la entrada, el peso, el sesgo y la función de activación para generar una salidA.',
      tech: 'HTML . CSS . Javascript',
      image: 'img/simulador-neurona-ia.png',
      url: 'https://github.com/ixenbrandonestiben-lang/artificial-neuron-simulator',
      status: 'ESTADO: DISPONIBLE.'
    },
    {
      slot: '04',
      category: 'FRONTEND // DISPONIBLE',
      title: 'BEE',
      desc: 'Chatbot amigable, con personalidad chapina.',
      tech: 'HTML . CSS . Javascript',
      image: 'img/bee.png',
      url: 'https://github.com/ixenbrandonestiben-lang/bee',
      status: 'ESTADO: CONSTRUCCIÓN'
    }
  ];

  // ============================================================
  // 🏗️ RENDERIZADO DINÁMICO DE SPREADS
  // ============================================================
  const spreadsContainer = document.getElementById('book-spreads');
  const spreads = [];

  // Agrupar proyectos de 2 en 2
  for (let i = 0; i < projects.length; i += 2) {
    const left = projects[i];
    const right = projects[i + 1];
    const spread = buildSpread(left, right);
    spreads.push(spread);
    spreadsContainer.appendChild(spread);
  }

  function buildSpread(left, right) {
    const spread = document.createElement('div');
    spread.className = 'book-spread';
    spread.style.display = 'none';

    spread.innerHTML = `
      ${buildPage(left, 'left')}
      ${right ? buildPage(right, 'right') : ''}
    `;
    return spread;
  }

  function buildPage(p, side) {
    if (!p) return '';
    const mediaBlock = p.image
      ? `<div class="blueprint-media" data-image="${p.image}" data-title="${p.title}">
           <img src="${p.image}" alt="${p.title}" loading="lazy"/>
           <div class="blueprint-media-zoom">
             <i data-lucide="maximize-2" style="width:16px;height:16px"></i>
           </div>
         </div>`
      : `<div class="blueprint-slot">[ ${p.tech} ]</div>`;

    const actionBlock = p.url
      ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary blueprint-btn">
           <span>Ver Proyecto</span>
           <i data-lucide="external-link" style="width:14px;height:14px"></i>
         </a>`
      : `<span class="blueprint-btn-disabled mono">PRÓXIMAMENTE</span>`;

    return `
      <div class="book-page ${side}">
        <div class="blueprint-card">
          <div>
            <span class="mono" style="font-size:10px; color:var(--accent);">${p.category}</span>
            <h3 style="font-family:'Syne'; font-size:22px; margin:8px 0;">${p.title}</h3>
            <p class="mono" style="font-size:12px; color:var(--text-muted);">${p.desc}</p>
          </div>
          ${mediaBlock}
          <div class="blueprint-footer">
            <span class="mono" style="font-size:10px;">${p.status}</span>
            ${actionBlock}
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================
  // 🧭 NAVEGACIÓN ENTRE SPREADS
  // ============================================================
  const btnPrev = document.getElementById('book-prev');
  const btnNext = document.getElementById('book-next');
  const bookIndicator = document.getElementById('book-indicator');
  let currentSpread = 0;

  function setSpread(index) {
    currentSpread = (index + spreads.length) % spreads.length;
    spreads.forEach((s, i) => {
      s.style.display = i === currentSpread ? 'grid' : 'none';
    });
    const pageStart = currentSpread * 2 + 1;
    const pageEnd = Math.min(pageStart + 1, projects.length);
    bookIndicator.textContent = `PÁGINAS ${pageStart} - ${pageEnd} // ${projects.length}`;
  }

  btnPrev.addEventListener('click', () => setSpread(currentSpread - 1));
  btnNext.addEventListener('click', () => setSpread(currentSpread + 1));

  // Mostrar el primer spread
  setSpread(0);

  // ============================================================
  // 🖼️ CLIC EN PORTADA → ABRIR MODAL DE IMAGEN
  // ============================================================
  spreadsContainer.addEventListener('click', (e) => {
    const media = e.target.closest('.blueprint-media');
    if (media && window.openImageModal) {
      window.openImageModal(media.dataset.image, media.dataset.title);
    }
  });

  // Re-renderizar iconos Lucide (los generados dinámicamente)
  if (window.lucide) lucide.createIcons();
});