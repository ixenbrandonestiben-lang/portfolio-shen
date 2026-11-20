document.addEventListener('DOMContentLoaded', () => {
  const cube = document.getElementById('cube-element');
  const cubeCoords = document.getElementById('cube-coords');
  let rotX = -20, rotY = 25, isDragging = false, startX = 0, startY = 0;

  function updateCubeTransform() {
    cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    cubeCoords.textContent = `X: ${Math.round(rotX)}° | Y: ${Math.round(rotY)}°`;
  }
  updateCubeTransform();

  const cubeViewport = document.querySelector('.cube-viewport');
  cubeViewport.addEventListener('mousedown', e => { isDragging = true; startX = e.clientX; startY = e.clientY; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    rotY += (e.clientX - startX) * 0.45;
    rotX -= (e.clientY - startY) * 0.45;
    startX = e.clientX; startY = e.clientY;
    updateCubeTransform();
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  setInterval(() => {
    if (!isDragging) {
      rotY += 0.25;
      rotX = -20 + Math.sin(Date.now() * 0.001) * 8;
      updateCubeTransform();
    }
  }, 30);

  const techDetails = {
    python: { title: "Python", badge: "BACKEND & LÓGICA", desc: "Scripts de diagnóstico, parseo de datos y arquitectura de servicios eficientes.", meta: "STACK: PySerial, FastAPI, POO" },
    javascript: { title: "JavaScript", badge: "INTERACCIÓN", desc: "Manipulación de DOM de alto rendimiento, comunicación asíncrona y visualización reactiva.", meta: "STACK: ES6+, Canvas API, DOM" },
    htmlcss: { title: "HTML / CSS", badge: "ESTRUCTURA Y ESTILO", desc: "Maquetación semántica, diseño responsivo y animaciones de alto rendimiento.", meta: "STACK: Flexbox, Grid, Animaciones CSS" },
    sql: { title: "MySQL", badge: "DATOS", desc: "Diseño de bases de datos relacionales, consultas optimizadas y gestión de registros.", meta: "STACK: SQL, Normalización, Joins" },
    mecanica: { title: "Mecánica Automotriz", badge: "SISTEMAS FÍSICOS", desc: "Diagnóstico de inyección electrónica, tren motriz y tolerancias críticas.", meta: "STACK: OBD-II, Multímetro, Osciloscopio" },
    logica: { title: "Lógica de Resolución", badge: "CAUSA RAÍZ", desc: "Capacidad analítica para descomponer problemas complejos en pasos solucionables.", meta: "STACK: Pensamiento Algorítmico" }
  };

  const modal = document.getElementById('tech-modal');
  const modalClose = document.getElementById('modal-close-btn');
  
  document.querySelectorAll('.cube-face').forEach(face => {
    face.addEventListener('click', () => {
      const data = techDetails[face.dataset.tech];
      if (data) {
        document.getElementById('modal-badge').textContent = data.badge;
        document.getElementById('modal-title').textContent = data.title;
        document.getElementById('modal-desc').textContent = data.desc;
        document.getElementById('modal-meta').textContent = data.meta;
        modal.classList.add('open');
      }
    });
  });

  modalClose.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
});