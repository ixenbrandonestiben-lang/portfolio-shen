document.addEventListener('DOMContentLoaded', () => {
  const spiderCanvas = document.getElementById('scrapling-spider-canvas');
  if (!spiderCanvas) return;

  const sCtx = spiderCanvas.getContext('2d');
  let sW, sH;

  // 📏 Ajustar canvas a la altura TOTAL del documento (no solo el viewport)
  function resizeCanvas() {
    sW = spiderCanvas.width = window.innerWidth;
    sH = spiderCanvas.height = Math.max(
      document.body.scrollHeight, 
      document.documentElement.scrollHeight, 
      window.innerHeight
    );
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', resizeCanvas); // Por si el contenido cambia dinámicamente

  // 🕷️ Estado principal de la araña (Coordenadas absolutas de la página)
  const spider = {
    x: sW * 0.5,
    y: window.innerHeight * 0.5, // Empieza en el viewport inicial
    angle: Math.PI * 0.8,
    speed: 0,
    targetX: sW * 0.5,
    targetY: window.innerHeight * 0.8,
    wanderTimer: 0,
    legs: []
  };

  // Configuración de 8 patas con paso alternado (tripod gait)
  const legConfigs = [
    { side: -1, baseAngle: -0.55, reach: 58, group: 0 },
    { side:  1, baseAngle:  0.55, reach: 58, group: 1 },
    { side: -1, baseAngle: -1.15, reach: 66, group: 1 },
    { side:  1, baseAngle:  1.15, reach: 66, group: 0 },
    { side: -1, baseAngle: -1.85, reach: 66, group: 0 },
    { side:  1, baseAngle:  1.85, reach: 66, group: 1 },
    { side: -1, baseAngle: -2.45, reach: 60, group: 1 },
    { side:  1, baseAngle:  2.45, reach: 60, group: 0 }
  ];

  // Inicializar patas
  legConfigs.forEach((cfg) => {
    const worldAngle = spider.angle + cfg.baseAngle;
    const fx = spider.x + Math.cos(worldAngle) * cfg.reach;
    const fy = spider.y + Math.sin(worldAngle) * cfg.reach;
    spider.legs.push({
      ...cfg,
      footX: fx, footY: fy, startX: fx, startY: fy,
      goalX: fx, goalY: fy, stepProgress: 1, stepping: false
    });
  });

  // 🖱️ Hacer clic en cualquier espacio libre atrae a la araña
  window.addEventListener('pointerdown', (e) => {
    // Ignorar clics en elementos interactivos para no romper la UX
    if (e.target.closest('button, a, input, .ide-tab, .cube-face, .book-nav, .gravity-btn')) return;
    
    // Convertir coordenadas del viewport a coordenadas absolutas de la página
    spider.targetX = e.clientX;
    spider.targetY = e.clientY + window.scrollY; 
    spider.wanderTimer = 260;
  });

  // 🔄 Bucle de animación
  function updateAndDrawSpider() {
    requestAnimationFrame(updateAndDrawSpider);

    sCtx.clearRect(0, 0, sW, sH);

    // TRUCO PROFESIONAL: Trasladar el contexto para que el dibujo coincida con el scroll
    sCtx.save();
    sCtx.translate(0, -window.scrollY);

    // Elegir nuevo destino autónomo periódicamente
    spider.wanderTimer--;
    const dx = spider.targetX - spider.x;
    const dy = spider.targetY - spider.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 28 || spider.wanderTimer <= 0) {
      // Limitar el deambular a los límites del documento
      const maxY = sH - 220;
      spider.targetX = 90 + Math.random() * Math.max(200, sW - 180);
      spider.targetY = 110 + Math.random() * Math.max(200, maxY);
      spider.wanderTimer = 180 + Math.floor(Math.random() * 180);
    }

    // Girar suavemente hacia el objetivo y avanzar
    const desiredAngle = Math.atan2(dy, dx);
    let angleDiff = desiredAngle - spider.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    spider.angle += angleDiff * 0.055;
    const targetSpeed = dist > 24 ? Math.min(2.35, dist * 0.025) : 0;
    spider.speed += (targetSpeed - spider.speed) * 0.08;

    spider.x += Math.cos(spider.angle) * spider.speed;
    spider.y += Math.sin(spider.angle) * spider.speed;

    // Obtener colores dinámicos del tema
    const styles = getComputedStyle(document.documentElement);
    const accentColor = styles.getPropertyValue('--accent').trim() || '#e7a856';
    const limeColor = styles.getPropertyValue('--lime').trim() || '#c4d384';

    const anyGroup0Stepping = spider.legs.some((l) => l.group === 0 && l.stepping);
    const anyGroup1Stepping = spider.legs.some((l) => l.group === 1 && l.stepping);

    // Actualizar y dibujar patas
    spider.legs.forEach((leg) => {
      const idealAngle = spider.angle + leg.baseAngle;
      const idealX = spider.x + Math.cos(idealAngle) * leg.reach + Math.cos(spider.angle) * (spider.speed * 10);
      const idealY = spider.y + Math.sin(idealAngle) * leg.reach + Math.sin(spider.angle) * (spider.speed * 10);

      const footError = Math.hypot(idealX - leg.footX, idealY - leg.footY);
      const otherGroupBusy = leg.group === 0 ? anyGroup1Stepping : anyGroup0Stepping;

      if (!leg.stepping && footError > 30 && !otherGroupBusy) {
        leg.stepping = true;
        leg.stepProgress = 0;
        leg.startX = leg.footX;
        leg.startY = leg.footY;
        leg.goalX = idealX;
        leg.goalY = idealY;
      }

      let lift = 0;
      if (leg.stepping) {
        leg.stepProgress += 0.14;
        if (leg.stepProgress >= 1) {
          leg.stepProgress = 1;
          leg.stepping = false;
        }
        const t = leg.stepProgress;
        leg.footX = leg.startX + (leg.goalX - leg.startX) * t;
        leg.footY = leg.startY + (leg.goalY - leg.startY) * t;
        lift = Math.sin(t * Math.PI) * 10; // Arco de elevación
      }

      const hipX = spider.x + Math.cos(spider.angle + leg.baseAngle * 0.7) * 11;
      const hipY = spider.y + Math.sin(spider.angle + leg.baseAngle * 0.7) * 11;
      const midX = (hipX + leg.footX) * 0.5 + Math.cos(idealAngle) * 10;
      const midY = (hipY + leg.footY) * 0.5 + Math.sin(idealAngle) * 10 - 12 - lift;

      sCtx.beginPath();
      sCtx.moveTo(hipX, hipY);
      sCtx.lineTo(midX, midY);
      sCtx.lineTo(leg.footX, leg.footY - lift * 0.3);
      sCtx.strokeStyle = leg.stepping ? accentColor : 'rgba(241, 240, 232, 0.72)';
      sCtx.lineWidth = 2.1;
      sCtx.lineCap = 'round';
      sCtx.lineJoin = 'round';
      sCtx.stroke();

      sCtx.fillStyle = accentColor;
      sCtx.beginPath();
      sCtx.arc(midX, midY, 2.3, 0, Math.PI * 2);
      sCtx.fill();

      sCtx.fillStyle = limeColor;
      sCtx.beginPath();
      sCtx.arc(leg.footX, leg.footY, 2, 0, Math.PI * 2);
      sCtx.fill();
    });

    // Dibujar cuerpo (Cefalotórax y Abdomen)
    sCtx.save();
    sCtx.translate(spider.x, spider.y);
    sCtx.rotate(spider.angle);

    // Abdomen
    sCtx.fillStyle = '#181b17';
    sCtx.strokeStyle = accentColor;
    sCtx.lineWidth = 2;
    sCtx.beginPath();
    sCtx.ellipse(-13, 0, 12, 9, 0, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.stroke();

    // Núcleo luminoso
    sCtx.fillStyle = limeColor;
    sCtx.beginPath();
    sCtx.arc(-13, 0, 3.5, 0, Math.PI * 2);
    sCtx.fill();

    // Cabeza
    sCtx.fillStyle = '#10120f';
    sCtx.strokeStyle = '#f1f0e8';
    sCtx.lineWidth = 1.8;
    sCtx.beginPath();
    sCtx.ellipse(4, 0, 9, 7, 0, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.stroke();

    // Sensores ópticos
    sCtx.fillStyle = accentColor;
    sCtx.beginPath();
    sCtx.arc(10, -3, 2, 0, Math.PI * 2);
    sCtx.arc(10, 3, 2, 0, Math.PI * 2);
    sCtx.fill();

    sCtx.restore(); // Fin del dibujo del cuerpo
    sCtx.restore(); // Fin del translate del scroll

    // 🔍 Interacción con Zoom Words (Adaptado a coordenadas absolutas)
    const zoomWords = document.querySelectorAll('.zoom-word');
    zoomWords.forEach(word => {
      const rect = word.getBoundingClientRect();
      // Convertir posición del viewport a absoluta
      const wordCenterX = rect.left + rect.width / 2;
      const wordCenterY = rect.top + window.scrollY + rect.height / 2;
      
      const distToWord = Math.hypot(spider.x - wordCenterX, spider.y - wordCenterY);
      if (distToWord < 120) {
        word.classList.add('active-zoom');
      } else {
        word.classList.remove('active-zoom');
      }
    });
  }

  updateAndDrawSpider();
});