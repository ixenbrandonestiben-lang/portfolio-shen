document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-year').textContent = new Date().getFullYear();
  if (window.lucide) lucide.createIcons();

  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  function setMobileMenu(open) {
    if (!mobileToggle || !mobileNav) return;
    mobileNav.classList.toggle('open', open);
    mobileToggle.setAttribute('aria-expanded', String(open));
    mobileToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
            const isOpen = !mobileNav.classList.contains('open');
      setMobileMenu(isOpen);
      // Actualizar el icono de Lucide
      mobileToggle.querySelector('i').setAttribute('data-lucide', isOpen ? 'x' : 'menu');
      lucide.createIcons();
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMobileMenu(false));
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setMobileMenu(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) setMobileMenu(false);
    });
  }

  const themeDots = document.querySelectorAll('.theme-dot');
  themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      themeDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      document.body.setAttribute('data-theme', dot.dataset.color);
    });
  });
});