document.addEventListener('DOMContentLoaded', () => {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.gs-reveal').forEach(elem => {
      gsap.from(elem, {
        scrollTrigger: { trigger: elem, start: 'top 88%', toggleActions: 'play none none none' },
        y: 35, opacity: 0, duration: 0.9, ease: 'power3.out'
      });
    });

    ScrollTrigger.create({
      trigger: '#habilidades',
      start: 'top 75%',
      onEnter: () => {
        document.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = bar.dataset.width;
        });
      }
    });
  }
});