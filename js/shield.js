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

  // 6. Screenshot & Screen Recording Protection
  // ------------------------------------------------

  // 6a. Block PrintScreen & Snipping Tool shortcuts
  document.addEventListener('keyup', function (e) {
    // PrintScreen key
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      // Overwrite clipboard with empty content
      navigator.clipboard.writeText('').catch(function () {});
      _flashShield();
    }
  });

  document.addEventListener('keydown', function (e) {
    // Win+Shift+S (Windows Snipping Tool)
    if (e.shiftKey && e.key === 'S' && (e.metaKey || e.getModifierState?.('OS'))) {
      e.preventDefault();
      _flashShield();
      return false;
    }
    // PrintScreen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      return false;
    }
  });

  // 6b. Blur content when tab/window loses focus (deters alt-tab screenshots)
  var _shieldOverlay = null;

  function _createShieldOverlay() {
    if (_shieldOverlay) return;
    _shieldOverlay = document.createElement('div');
    _shieldOverlay.id = 'shield-overlay';
    Object.assign(_shieldOverlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      zIndex: '2147483647',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      transition: 'opacity 0.15s ease',
      opacity: '0',
      pointerEvents: 'none'
    });
    _shieldOverlay.innerHTML =
      '<div style="text-align:center;">' +
        '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6C3CE1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' +
        '</svg>' +
        '<p style="color:#6C3CE1;font-family:Inter,sans-serif;font-size:14px;margin-top:12px;letter-spacing:2px;text-transform:uppercase;">Content Protected</p>' +
      '</div>';
    document.body.appendChild(_shieldOverlay);
  }

  function _showShield() {
    if (!_shieldOverlay) _createShieldOverlay();
    _shieldOverlay.style.display = 'flex';
    _shieldOverlay.style.pointerEvents = 'all';
    requestAnimationFrame(function () {
      _shieldOverlay.style.opacity = '1';
    });
    document.body.style.filter = 'blur(30px)';
  }

  function _hideShield() {
    if (!_shieldOverlay) return;
    _shieldOverlay.style.opacity = '0';
    document.body.style.filter = 'none';
    setTimeout(function () {
      if (_shieldOverlay) {
        _shieldOverlay.style.display = 'none';
        _shieldOverlay.style.pointerEvents = 'none';
      }
    }, 150);
  }

  // Flash shield briefly (for screenshot key presses)
  function _flashShield() {
    _showShield();
    setTimeout(_hideShield, 800);
  }

  // Visibility API — tab hidden/visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      _showShield();
    } else {
      _hideShield();
    }
  });

  // Window blur/focus (catches alt-tab, window switching)
  window.addEventListener('blur', function () {
    _showShield();
  });
  window.addEventListener('focus', function () {
    _hideShield();
  });

  // 6c. Inject print-blocking CSS (prevents print-to-PDF / screenshots via print)
  var _printCSS = document.createElement('style');
  _printCSS.textContent =
    '@media print {' +
      'body { display: none !important; }' +
      'html::after {' +
        'content: "⚠ This content is protected and cannot be printed.";' +
        'display: flex; align-items: center; justify-content: center;' +
        'height: 100vh; width: 100vw;' +
        'font-family: Inter, sans-serif; font-size: 20px; color: #6C3CE1;' +
        'position: fixed; top: 0; left: 0;' +
      '}' +
    '}';
  document.head.appendChild(_printCSS);

  // 6d. Permissions Policy meta (blocks browser-level screen capture API)
  var _permMeta = document.createElement('meta');
  _permMeta.httpEquiv = 'Permissions-Policy';
  _permMeta.content = 'display-capture=(), screen-wake-lock=()';
  document.head.appendChild(_permMeta);

  // 6e. Prevent screen capture via getDisplayMedia (if anyone tries programmatically)
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    var _origGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getDisplayMedia = function () {
      return Promise.reject(new DOMException('Screen capture is disabled.', 'NotAllowedError'));
    };
  }

  // 7. Dev tools detection via debugger timing
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

  // 8. Console warning message
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
