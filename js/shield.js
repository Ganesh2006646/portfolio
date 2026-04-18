/* =========================================
   SOURCE CODE SHIELD
   Prevents casual copying of source code
   ========================================= */

(function () {
  'use strict';

  // 1. Disable right-click context menu
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  // 2. Disable keyboard shortcuts for dev tools & view-source
  document.addEventListener('keydown', function (e) {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I (Dev Tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }

    // Ctrl+S (Save Page)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }

    // Ctrl+A (Select All) — optional, prevents bulk copy
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      return false;
    }

    // Ctrl+C (Copy) — block copy on non-input elements
    if (e.ctrlKey && e.key === 'c') {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        return false;
      }
    }

    // Ctrl+P (Print)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      return false;
    }
  });

  // 3. Disable text selection (except in form fields)
  document.addEventListener('selectstart', function (e) {
    const tag = e.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return true;
    e.preventDefault();
    return false;
  });

  // 4. Disable drag
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
    return false;
  });

  // 5. Disable copy event (except in form fields)
  document.addEventListener('copy', function (e) {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return true;
    e.preventDefault();
    return false;
  });

  // 6. Dev tools detection via debugger timing
  (function detectDevTools() {
    const threshold = 160;
    setInterval(function () {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > threshold) {
        document.body.innerHTML = '';
        document.title = '⚠';
      }
    }, 4000);
  })();

  // 7. Console warning message
  console.log(
    '%c⚠ STOP',
    'color: #FF0000; font-size: 48px; font-weight: 900; text-shadow: 2px 2px 0 #000;'
  );
  console.log(
    '%cThis is a protected portfolio. Source code inspection is not permitted.',
    'color: #F0F1FA; font-size: 14px; font-weight: 400;'
  );
  console.log(
    '%c© ' + new Date().getFullYear() + ' Kankatala Ganesh Giridhar. All rights reserved.',
    'color: #6C3CE1; font-size: 12px;'
  );

})();
