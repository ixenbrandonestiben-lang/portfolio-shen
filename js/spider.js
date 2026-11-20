document.addEventListener('DOMContentLoaded', () => {
  const spiderCanvas = document.getElementById('spider-canvas');
  const ctx = spiderCanvas.getContext('2d');
  
  let width = spiderCanvas.width = window.innerWidth;
  let height = spiderCanvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = spiderCanvas.width = window.innerWidth;
    height = spiderCanvas.height = window.innerHeight;
  });

  // Estados de la araña
  const STATE = {
    WANDER: 'wander',
    CHASE: 'chase',
    EAT: 'eat',
    LEAVE: 'leave',
    WAIT: 'wait'
  };

  let currentState = STATE.WANDER;
  let mouse = { x: width / 2, y: height / 2 };
  let target = { x: Math.random() * width, y: Math.random() * height };
  
  // Configuración de la araña (Más grande)
  const spider = {
    x: width / 2,
    y: height / 2,
    size: 28, // Tamaño aumentado
    speed: 2,
    angle: 0
  };

  let chaseStartTime = Date.now();
  let eatTimer = null;

  // Rastrear el mouse
  window.addEventListener('mousemove', (e) => {
    if (currentState !== STATE.WAIT && currentState !== STATE.EAT) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
  });

  // Iniciar persecución después de 10 segundos
  setTimeout(() => {
    if (currentState === STATE.WANDER) {
      currentState = STATE.CHASE;
    }
  }, 10000);

  // Función para obtener un punto aleatorio en los bordes (para huir)
  function getRandomEdgePoint() {
    const edge = Math.floor(Math.random() * 4);
    switch(edge) {
      case 0: return { x: Math.random() * width, y: -50 }; // Arriba
      case 1: return { x: width + 50, y: Math.random() * height }; // Derecha
      case 2: return { x: Math.random() * width, y: height + 50 }; // Abajo
      case 3: return { x: -50, y: Math.random() * height }; // Izquierda
    }
  }

  // Función para obtener un punto aleatorio dentro de la pantalla (deambular)
  function getRandomWanderPoint() {
    return {
      x: 100 + Math.random() * (width - 200),
      y: 100 + Math.random() * (height - 200)
    };
  }

  function updateSpider() {
    // Obtener color dinámico del tema actual
    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#e7a856';

    let dx, dy, distance;

    switch (currentState) {
      case STATE.WANDER:
        dx = target.x - spider.x;
        dy = target.y - spider.y;
        distance = Math.hypot(dx, dy);
        
        if (distance < 10) {
          target = getRandomWanderPoint();
        } else {
          spider.x += (dx / distance) * (spider.speed * 0.5);
          spider.y += (dy / distance) * (spider.speed * 0.5);
          spider.angle = Math.atan2(dy, dx);
        }
        break;

      case STATE.CHASE:
        dx = mouse.x - spider.x;
        dy = mouse.y - spider.y;
        distance = Math.hypot(dx, dy);

        // Si atrapa el cursor (distancia menor a 35px)
        if (distance < 35) {
          currentState = STATE.EAT;
          document.body.classList.add('cursor-hidden'); // ¡Come el cursor!
          
          // Programar la huida y reaparición
          target = getRandomEdgePoint();
          currentState = STATE.LEAVE;
          
          eatTimer = setTimeout(() => {
            document.body.classList.remove('cursor-hidden'); // Reaparece el cursor
            currentState = STATE.WANDER;
            target = getRandomWanderPoint();
            // Reiniciar el ciclo de 10 segundos para la próxima persecución
            setTimeout(() => {
              if (currentState === STATE.WANDER) currentState = STATE.CHASE;
            }, 10000);
          }, 5000); // 5 segundos desaparecido
        } else {
          spider.x += (dx / distance) * (spider.speed * 1.5); // Más rápido al perseguir
          spider.y += (dy / distance) * (spider.speed * 1.5);
          spider.angle = Math.atan2(dy, dx);
        }
        break;

      case STATE.LEAVE:
        dx = target.x - spider.x;
        dy = target.y - spider.y;
        distance = Math.hypot(dx, dy);
        
        if (distance < 10) {
          // Llegó al borde, espera allí hasta que el timer de 5s la devuelva a WANDER
          currentState = STATE.WAIT;
        } else {
          spider.x += (dx / distance) * (spider.speed * 2); // Huye muy rápido
          spider.y += (dy / distance) * (spider.speed * 2);
          spider.angle = Math.atan2(dy, dx);
        }
        break;
        
      case STATE.WAIT:
        // Se queda quieta en el borde hasta que el timer la reactive
        break;
    }

    // Interacción con palabras clave (Zoom Words)
    const zoomWords = document.querySelectorAll('.zoom-word');
    zoomWords.forEach(word => {
      const rect = word.getBoundingClientRect();
      const wordCenterX = rect.left + rect.width / 2;
      const wordCenterY = rect.top + rect.height / 2;
      const distToWord = Math.hypot(spider.x - wordCenterX, spider.y - wordCenterY);
      
      // Si la araña está cerca (120px), resalta la palabra
      if (distToWord < 120) {
        word.classList.add('active-zoom');
      } else {
        word.classList.remove('active-zoom');
      }
    });

    return accentColor;
  }

  function drawSpider(accentColor) {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(spider.x, spider.y);
    ctx.rotate(spider.angle);

    // 1. Hilo de telaraña (solo si está arriba o moviéndose)
    if (spider.y > 50) {
      ctx.beginPath();
      ctx.moveTo(0, -spider.y); // Desde arriba de la pantalla
      ctx.lineTo(0, -spider.size);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 2. Cuerpo de la araña (con color del tema y transparencia)
    ctx.beginPath();
    ctx.arc(0, 0, spider.size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = accentColor + '30'; // 30% de opacidad en hex
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ojos brillantes (mecánicos)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(spider.size * 0.2, -spider.size * 0.15, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(spider.size * 0.2, spider.size * 0.15, 3, 0, Math.PI * 2); ctx.fill();

    // 3. Patas articuladas (8 patas, más grandes y mecánicas)
    const time = Date.now() * 0.008;
    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? -1 : 1; // 4 patas izquierdas, 4 derechas
      const legIndex = i % 4;
      
      // Ángulo base de cada pata
      const baseAngle = (legIndex - 1.5) * 0.4;
      // Movimiento de caminata (senoide)
      const walkOffset = Math.sin(time + legIndex) * 8;
      
      ctx.beginPath();
      ctx.moveTo(side * (spider.size * 0.3), 0); // Unión al cuerpo
      
      // Primera articulación
      const joint1X = side * (spider.size * 0.8) + walkOffset;
      const joint1Y = (baseAngle * spider.size * 1.2);
      ctx.lineTo(joint1X, joint1Y);
      
      // Segunda articulación (punta)
      const joint2X = side * (spider.size * 1.4) + (walkOffset * 1.5);
      const joint2Y = (baseAngle * spider.size * 1.8) + (side * 5);
      ctx.lineTo(joint2X, joint2Y);
      
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Puntas de las patas (pequeños círculos)
      ctx.beginPath();
      ctx.arc(joint2X, joint2Y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.restore();
    requestAnimationFrame(() => {
      const color = updateSpider();
      drawSpider(color);
    });
  }

  // Iniciar ciclo de animación
  requestAnimationFrame(() => {
    const color = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#e7a856';
    drawSpider(color);
  });
});