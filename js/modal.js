// 🖼️ Modal de imagen global — Reutilizable por gravedad y proyectos
document.addEventListener('DOMContentLoaded', () => {
  const imageModal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image');
  const modalTitle = document.getElementById('image-modal-title');
  const modalClose = document.getElementById('modal-close');

  // Abrir modal (expuesto globalmente)
  window.openImageModal = function (src, title) {
    if (!imageModal || !modalImg) return;
    modalImg.src = src;
    modalImg.alt = title || 'Imagen ampliada';
    if (modalTitle) modalTitle.textContent = title || 'Imagen';
    imageModal.classList.add('open');
    imageModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  // Cerrar modal (expuesto globalmente)
  window.closeImageModal = function () {
    if (!imageModal) return;
    imageModal.classList.remove('open');
    imageModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Limpiar src para liberar memoria
    setTimeout(() => { if (modalImg) modalImg.src = ''; }, 300);
  };

  // Listeners de cierre
  if (modalClose) modalClose.addEventListener('click', window.closeImageModal);
  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) window.closeImageModal();
    });
  }

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && imageModal && imageModal.classList.contains('open')) {
      window.closeImageModal();
    }
  });
});