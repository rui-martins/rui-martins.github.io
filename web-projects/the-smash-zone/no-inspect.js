/* Dissuasão de inspeção: bloqueia menu de contexto e atalhos das DevTools.
   Nota: isto é apenas cosmético — não impede ver o código por Ctrl+U noutro
   separador, DevTools abertos antes de navegar, ou download direto do URL. */
(function () {
  'use strict';

  // Botão direito / menu de contexto
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  document.addEventListener('keydown', function (e) {
    const key = e.key.toUpperCase();

    // F12
    if (key === 'F12') {
      e.preventDefault();
      return;
    }

    // Ctrl+Shift+I / J / C (DevTools, consola, inspetor de elementos)
    if (e.ctrlKey && e.shiftKey && (key === 'I' || key === 'J' || key === 'C')) {
      e.preventDefault();
      return;
    }

    // Ctrl+U (ver código-fonte) e Ctrl+S (guardar página)
    if (e.ctrlKey && !e.shiftKey && (key === 'U' || key === 'S')) {
      e.preventDefault();
      return;
    }

    // Equivalentes em macOS (Cmd+Opt+I/J/C, Cmd+U, Cmd+S)
    if (e.metaKey && ((e.altKey && (key === 'I' || key === 'J' || key === 'C')) || key === 'U' || key === 'S')) {
      e.preventDefault();
    }
  });
})();
