document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gravity-canvas');
  const ctx = canvas.getContext('2d');
  const btnDrop = document.getElementById('btn-drop');
  const btnGravity = document.getElementById('btn-gravity');
  const btnDelete = document.getElementById('btn-delete');
  const gravityLabel = document.getElementById('gravity-label');
  const gravityState = document.getElementById('gravity-state');
  const imgCount = document.getElementById('img-count');

  let width, height;
  let images = [];
  let gravityMode = 'normal';
  let imageIndex = 0;

  const imageList = [
    { src: 'img/arte.jpg', title: 'Arte' },
    { src: 'img/autosDeportivos.jpg', title: 'Autos Deportivos' },
    { src: 'img/calistenia.jpg', title: 'Calistenia' },
    { src: 'img/canchaFut.jpg', title: 'Cancha de Fútbol' },
    { src: 'img/cieloCasa1.jpg', title: 'Cielo desde Casa' },
    { src: 'img/cieloRojoCompleto.jpg', title: 'Cielo Rojo' },
    { src: 'img/CrecimientoPersonal.jpg', title: 'Crecimiento Personal' },
    { src: 'img/faro.jpg', title: 'Faro' },
    { src: 'img/faro2.jpg', title: 'Faro Encendido' },
    { src: 'img/frolRoja.jpg', title: 'Flor Roja' },
    { src: 'img/futSala.jpg', title: 'Fútbol Sala' },
    { src: 'img/lluvia.jpg', title: 'Lluvia' },
    { src: 'img/moto.jpg', title: 'Moto' },
    { src: 'img/motosAltaCilindrada.jpg', title: 'Motos de Alta Cilindrada' },
    { src: 'img/musica.jpg', title: 'Música' },
    { src: 'img/pintura.jpg', title: 'Pintura' },
    { src: 'img/valonFutboll.jpg', title: 'Balón de Fútbol' },
    { src: 'img/yo.jpg', title: 'Yo' },
    { src: 'img/yoTarde.jpg', title: 'Yo al Atardecer' }
  ];

  const SHAPES = ['circle', 'rounded', 'hexagon', 'blob'];

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    width = canvas.width;
    height = canvas.height;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class PhysicsImage {
    constructor(src, title, x, y) {
      this.img = new Image();
      this.img.src = src;
      this.title = title;
      this.src = src;
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = 0;
      this.rotation = Math.random() * Math.PI * 2;
      this.vr = (Math.random() - 0.5) * 0.03;
      this.scale = 1;
      this.deleting = false;
      this.loaded = false;
      this.friction = 0.98;
      this.restitution = 0.6;

      const baseSize = 80 + Math.random() * 80;
      this.targetSize = baseSize;
      this.currentSize = 0;
      this.entryAnimation = true;

      this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

      // 🆕 Animación de "pop" al hacer clic
      this.popAnimation = false;
      this.popScale = 1;

      this.img.onload = () => {
        this.loaded = true;
        const aspect = this.img.width / this.img.height;
        if (aspect > 1) {
          this.w = this.targetSize;
          this.h = this.targetSize / aspect;
        } else {
          this.h = this.targetSize;
          this.w = this.targetSize * aspect;
        }
        this.radius = Math.max(this.w, this.h) / 2;
      };

      this.img.onerror = () => {
        console.warn(`No se pudo cargar: ${src}`);
      };
    }

    update() {
      if (this.entryAnimation) {
        this.currentSize += (this.targetSize - this.currentSize) * 0.1;
        if (Math.abs(this.currentSize - this.targetSize) < 1) {
          this.currentSize = this.targetSize;
          this.entryAnimation = false;
        }
        if (this.loaded) {
          const aspect = this.img.width / this.img.height;
          if (aspect > 1) {
            this.w = this.currentSize;
            this.h = this.currentSize / aspect;
          } else {
            this.h = this.currentSize;
            this.w = this.currentSize * aspect;
          }
          this.radius = Math.max(this.w, this.h) / 2;
        }
      }

      // 🆕 Animación de pop
      if (this.popAnimation) {
        this.popScale += (1.3 - this.popScale) * 0.3;
        if (Math.abs(this.popScale - 1.3) < 0.05) {
          this.popAnimation = false;
        }
      } else if (this.popScale > 1) {
        this.popScale += (1 - this.popScale) * 0.15;
      }

      if (this.deleting) {
        this.scale -= 0.04;
        if (this.scale <= 0) return false;
        return true;
      }

      if (!this.loaded) return true;

      if (gravityMode === 'normal') {
        this.vy += 0.5;
      }

      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.vr;

      if (gravityMode === 'normal') {
        const bottomLimit = height - this.h / 2;
        if (this.y > bottomLimit) {
          this.y = bottomLimit;
          this.vy *= -this.restitution;
          this.vx *= this.friction;
          this.vr *= 0.9;
          if (Math.abs(this.vy) < 1) this.vy = 0;
        }
      }

      if (this.x < this.w / 2) {
        this.x = this.w / 2;
        this.vx *= -this.restitution;
      } else if (this.x > width - this.w / 2) {
        this.x = width - this.w / 2;
        this.vx *= -this.restitution;
      }

      if (this.y < this.h / 2) {
        this.y = this.h / 2;
        this.vy *= -this.restitution;
      }

      if (gravityMode === 'zero') {
        this.vx *= 0.999;
        this.vy *= 0.999;
      }

      return true;
    }

    // 🆕 Verificar si un punto (x, y) está dentro de la imagen
    // Usa transformación inversa para respetar la rotación
    hitTest(pointX, pointY) {
      // Transformar el punto al espacio local de la imagen
      const dx = pointX - this.x;
      const dy = pointY - this.y;
      const cos = Math.cos(-this.rotation);
      const sin = Math.sin(-this.rotation);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      // Usar el radio circular como aproximación (suficiente y performante)
      const dist = Math.hypot(localX, localY);
      return dist <= this.radius;
    }

    drawGlassShape() {
      const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      // 🆕 Aplicar escala de pop
      const finalScale = this.scale * this.popScale;
      ctx.scale(finalScale, finalScale);

      ctx.beginPath();
      this.drawShapePath();
      ctx.clip();

      const gradient = ctx.createLinearGradient(-this.w/2, -this.h/2, this.w/2, this.h/2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(-this.w, -this.h, this.w * 2, this.h * 2);

      ctx.shadowBlur = 0;
      ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h / 3);

      ctx.restore();

      // Borde glass
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(finalScale, finalScale);

      ctx.beginPath();
      this.drawShapePath();

      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 20;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.stroke();

      ctx.restore();
    }

    // 🆕 Helper para dibujar el path según la forma
    drawShapePath() {
      switch (this.shape) {
        case 'circle':
          ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
          break;
        case 'rounded':
          const r = 15;
          ctx.moveTo(-this.w/2 + r, -this.h/2);
          ctx.lineTo(this.w/2 - r, -this.h/2);
          ctx.quadraticCurveTo(this.w/2, -this.h/2, this.w/2, -this.h/2 + r);
          ctx.lineTo(this.w/2, this.h/2 - r);
          ctx.quadraticCurveTo(this.w/2, this.h/2, this.w/2 - r, this.h/2);
          ctx.lineTo(-this.w/2 + r, this.h/2);
          ctx.quadraticCurveTo(-this.w/2, this.h/2, -this.w/2, this.h/2 - r);
          ctx.lineTo(-this.w/2, -this.h/2 + r);
          ctx.quadraticCurveTo(-this.w/2, -this.h/2, -this.w/2 + r, -this.h/2);
          break;
        case 'hexagon':
          const hexRadius = this.radius * 0.9;
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = hexRadius * Math.cos(angle);
            const y = hexRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
        case 'blob':
          const blobRadius = this.radius * 0.85;
          ctx.moveTo(0, -blobRadius);
          ctx.bezierCurveTo(blobRadius * 0.8, -blobRadius * 0.8, blobRadius, -blobRadius * 0.3, blobRadius, 0);
          ctx.bezierCurveTo(blobRadius, blobRadius * 0.3, blobRadius * 0.8, blobRadius * 0.8, 0, blobRadius);
          ctx.bezierCurveTo(-blobRadius * 0.8, blobRadius * 0.8, -blobRadius, blobRadius * 0.3, -blobRadius, 0);
          ctx.bezierCurveTo(-blobRadius, -blobRadius * 0.3, -blobRadius * 0.8, -blobRadius * 0.8, 0, -blobRadius);
          break;
      }
    }

    draw() {
      if (!this.loaded) return;
      this.drawGlassShape();
    }
  }

  function resolveCollisions() {
    for (let i = 0; i < images.length; i++) {
      if (images[i].deleting) continue;
      for (let j = i + 1; j < images.length; j++) {
        if (images[j].deleting) continue;

        const a = images[i];
        const b = images[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;

          const dvx = a.vx - b.vx;
          const dvy = a.vy - b.vy;
          const dotProduct = dvx * nx + dvy * ny;

          if (dotProduct > 0) {
            a.vx -= dotProduct * nx * 0.9;
            a.vy -= dotProduct * ny * 0.9;
            b.vx += dotProduct * nx * 0.9;
            b.vy += dotProduct * ny * 0.9;

            a.vr += (Math.random() - 0.5) * 0.02;
            b.vr += (Math.random() - 0.5) * 0.02;
          }
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    if (gravityMode === 'normal') {
      const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
      ctx.strokeStyle = accent + '40';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, height - 2);
      ctx.lineTo(width, height - 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    images = images.filter(img => img.update());
    resolveCollisions();
    images.forEach(img => img.draw());

    imgCount.textContent = images.filter(i => !i.deleting).length;

    requestAnimationFrame(animate);
  }
  animate();

  // 🆕 Detección de clics en el canvas
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Iterar en orden inverso (la imagen "más arriba" primero)
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      if (!img.deleting && img.loaded && img.hitTest(clickX, clickY)) {
        // Activar animación de pop
        img.popAnimation = true;

        // Abrir modal con la imagen
        window.openImageModal(img.src, img.title);
        break; // Solo seleccionar una imagen
      }
    }
  });

  // 🆕 Cambiar cursor al pasar sobre una imagen
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let hovering = false;
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      if (!img.deleting && img.loaded && img.hitTest(mouseX, mouseY)) {
        hovering = true;
        break;
      }
    }
    canvas.style.cursor = hovering ? 'pointer' : 'default';
  });

  // 🎮 Controles
  btnDrop.addEventListener('click', () => {
    const imgData = imageList[imageIndex % imageList.length];
    const x = 100 + Math.random() * (width - 200);
    const y = 50;
    images.push(new PhysicsImage(imgData.src, imgData.title, x, y));
    imageIndex++;
  });

  btnGravity.addEventListener('click', () => {
    if (gravityMode === 'normal') {
      gravityMode = 'zero';
      gravityLabel.textContent = 'Gravedad: Cero';
      gravityState.textContent = 'CERO';
      btnGravity.classList.add('active');
      images.forEach(img => {
        if (!img.deleting) {
          img.vx += (Math.random() - 0.5) * 2;
          img.vy -= Math.random() * 3 + 1;
        }
      });
    } else {
      gravityMode = 'normal';
      gravityLabel.textContent = 'Gravedad: Normal';
      gravityState.textContent = 'NORMAL';
      btnGravity.classList.remove('active');
    }
  });

  btnDelete.addEventListener('click', () => {
    const activeImages = images.filter(img => !img.deleting);
    if (activeImages.length > 0) {
      activeImages[0].deleting = true;
    }
  });
});