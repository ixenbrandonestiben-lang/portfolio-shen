document.addEventListener('DOMContentLoaded', () => {
  const snippets = {
    filosofia: `// Mi filosofía de desarrollo\nconst desarrollador = {\n  origen: "Taller Mecánico",\n  enfoque: "Causa Raíz",\n  metodo: "Diagnóstico -> Lógica -> Solución",\n  mentalidad: "Aprender, corregir, mejorar."\n};\n\nconsole.log("Cada línea de código tiene un propósito.");`,
    objetivo: `# Objetivo Profesional\nCombinar la lógica, la precisión y el análisis \naprendidos en la mecánica automotriz con la \nprogramación. \n\nTengo la base sólida, la disciplina y el enfoque \ncorrecto para crecer y construir un futuro donde \nmi trabajo hable por sí mismo.`
  };

  let currentLang = 'filosofia';
  let snippetText = snippets[currentLang];
  let charIndex = 0;
  const ideTarget = document.getElementById('ide-target');

  function typeWriter() {
    if (charIndex < snippetText.length) {
      ideTarget.textContent += snippetText.charAt(charIndex);
      charIndex++;
      setTimeout(typeWriter, 30);
    }
  }

  document.querySelectorAll('.ide-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ide-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentLang = tab.dataset.lang;
      snippetText = snippets[currentLang];
      charIndex = 0;
      ideTarget.textContent = '';
      typeWriter();
    });
  });

  typeWriter();
});