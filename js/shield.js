/* =========================================
   SOURCE CODE SHIELD — Lightweight
   Tasteful console branding only.
   No destructive behaviors.
   ========================================= */

(function () {
  'use strict';

  // Keep production console quiet; enable with ?debug=1 when needed.
  var _debugConsole = new URLSearchParams(window.location.search).has('debug');
  if (_debugConsole) {
    console.log(
      '%cGanesh Giridhar - Portfolio',
      'color: #6C3CE1; font-size: 16px; font-weight: 700; font-family: system-ui;'
    );
    console.log(
      '%cAI Systems Engineer & Product Builder\nhttps://github.com/Ganesh2006646',
      'color: #8A8B96; font-size: 12px; font-weight: 400; font-family: system-ui;'
    );
  }

  // Inject print-blocking CSS (reasonable — prevents casual print-to-PDF)
  var _printCSS = document.createElement('style');
  _printCSS.textContent =
    '@media print {' +
      'body::before {' +
        'content: "© ' + new Date().getFullYear() + ' Kankatala Ganesh Giridhar — ganeshgiridhar.dev";' +
        'display: block; text-align: center; padding: 1rem;' +
        'font-family: system-ui; font-size: 12px; color: #6C3CE1;' +
      '}' +
    '}';
  document.head.appendChild(_printCSS);

})();
