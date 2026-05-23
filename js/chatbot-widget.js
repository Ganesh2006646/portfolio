/* ================================================
   RAG Chatbot Widget — Self-contained Vanilla JS
   Features: SSE Streaming, Rich Markdown, localStorage
   Persistence, Recruiter Onboarding, Chat Memory
   ================================================ */

(function () {
  'use strict';

  // ---- CONFIG ----
  const API_ENDPOINT = '/api/chat';
  const LOG_ENDPOINT = '/api/log-visitor';
  const LS_MESSAGES_KEY = 'rag-chat-messages';
  const LS_VISITOR_KEY = 'rag-visitor-info';

  const ALL_PROMPTS = [
    "What is RiceAgent Pro?",
    "What are Ganesh's core skills?",
    "Tell me about a time you failed",
    "What is Ganesh's 5-year vision?",
    "What hackathons has Ganesh done?",
    "Explain Ganesh's engineering philosophy",
    "What is ExecuCode?",
    "What tech stack does Ganesh use?",
    "Why should I hire Ganesh?",
    "What is The Linear Paradigm?",
    "Tell me about Spectra-Shield",
    "What is Ganesh's background?"
  ];

  // Shuffle and pick 4 random prompts each time
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const SUGGESTED_PROMPTS = shuffleArray(ALL_PROMPTS).slice(0, 4);

  // ---- SVG ICONS ----
  const ICONS = {
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    wand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v1"/><path d="M19 17v1"/><path d="M9 3H8"/><path d="M16 21h-1"/></svg>`,
    arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M16 3h5v5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 21H3v-5"/></svg>`,
    sparkle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5z"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  };

  // ---- STATE ----
  let isOpen = false;
  let isLoading = false;
  let messages = [];
  let visitorInfo = null; // { name, role }

  // ---- DOM REFS ----
  let triggerBtn, panel, welcomeContainer, onboardingContainer, messagesContainer, inputEl, sendBtn;

  // ---- LOCAL STORAGE ----
  function saveMessages() {
    try {
      localStorage.setItem(LS_MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) { /* localStorage may be unavailable */ }
  }

  function loadMessages() {
    try {
      const data = localStorage.getItem(LS_MESSAGES_KEY);
      if (data) {
        messages = JSON.parse(data);
        return messages.length > 0;
      }
    } catch (e) { /* ignore */ }
    return false;
  }

  function saveVisitor(info) {
    visitorInfo = info;
    try {
      localStorage.setItem(LS_VISITOR_KEY, JSON.stringify(info));
    } catch (e) { /* ignore */ }
  }

  function loadVisitor() {
    try {
      const data = localStorage.getItem(LS_VISITOR_KEY);
      if (data) {
        visitorInfo = JSON.parse(data);
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  }

  function clearStorage() {
    try {
      localStorage.removeItem(LS_MESSAGES_KEY);
    } catch (e) { /* ignore */ }
  }

  // ---- HELPERS ----
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function createEl(tag, className, innerHTML) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  }

  // ---- RICH MARKDOWN PARSER ----
  function processInline(text) {
    let html = escapeHtml(text);
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic (single * not preceded/followed by *)
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="rag-inline-code">$1</code>');
    return html;
  }

  function parseMarkdown(text) {
    if (!text) return '';

    // Extract code blocks first to protect them
    const codeBlocks = [];
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, function (match, lang, code) {
      const id = '\x00CODEBLOCK_' + codeBlocks.length + '\x00';
      codeBlocks.push({ lang: lang || 'text', code: code.trimEnd() });
      return id;
    });

    const lines = text.split('\n');
    const htmlParts = [];
    let inList = false;
    let listType = '';

    function closeList() {
      if (inList) {
        htmlParts.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = '';
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for code block placeholder
      const codeMatch = line.match(/^\x00CODEBLOCK_(\d+)\x00$/);
      if (codeMatch) {
        closeList();
        const block = codeBlocks[parseInt(codeMatch[1])];
        const langLabel = block.lang;
        const escapedCode = escapeHtml(block.code);
        htmlParts.push(
          '<div class="rag-code-block">' +
          '<div class="rag-code-header">' +
          '<span class="rag-code-lang">' + escapeHtml(langLabel) + '</span>' +
          '<button class="rag-copy-btn" onclick="navigator.clipboard.writeText(this.closest(\'.rag-code-block\').querySelector(\'code\').textContent).then(function(){var b=event.target;b.textContent=\'Copied!\';setTimeout(function(){b.textContent=\'Copy\'},1500)})">Copy</button>' +
          '</div>' +
          '<pre><code>' + escapedCode + '</code></pre>' +
          '</div>'
        );
        continue;
      }

      // Headers
      if (line.startsWith('#### ')) {
        closeList();
        htmlParts.push('<h5 class="rag-md-h4">' + processInline(line.slice(5)) + '</h5>');
        continue;
      }
      if (line.startsWith('### ')) {
        closeList();
        htmlParts.push('<h4 class="rag-md-h3">' + processInline(line.slice(4)) + '</h4>');
        continue;
      }
      if (line.startsWith('## ')) {
        closeList();
        htmlParts.push('<h3 class="rag-md-h2">' + processInline(line.slice(3)) + '</h3>');
        continue;
      }

      // Unordered list (- or *)
      const ulMatch = line.match(/^(\s*)[\-\*]\s+(.*)/);
      if (ulMatch) {
        if (!inList || listType !== 'ul') {
          closeList();
          htmlParts.push('<ul class="rag-md-list">');
          inList = true;
          listType = 'ul';
        }
        htmlParts.push('<li>' + processInline(ulMatch[2]) + '</li>');
        continue;
      }

      // Ordered list
      const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/);
      if (olMatch) {
        if (!inList || listType !== 'ol') {
          closeList();
          htmlParts.push('<ol class="rag-md-list">');
          inList = true;
          listType = 'ol';
        }
        htmlParts.push('<li>' + processInline(olMatch[3]) + '</li>');
        continue;
      }

      // Empty line — close list or add spacing
      if (line.trim() === '') {
        closeList();
        // Don't add excessive breaks
        if (htmlParts.length > 0 && !htmlParts[htmlParts.length - 1].endsWith('</ul>') && !htmlParts[htmlParts.length - 1].endsWith('</ol>')) {
          htmlParts.push('<div class="rag-md-spacer"></div>');
        }
        continue;
      }

      // Regular text line
      closeList();
      htmlParts.push('<p class="rag-md-p">' + processInline(line) + '</p>');
    }

    closeList();
    return htmlParts.join('');
  }

  // ---- RENDER MESSAGE ----
  function renderMessage(msg) {
    const wrapper = createEl('div', 'rag-msg ' + msg.sender);
    const bubble = createEl('div', 'rag-msg-bubble');

    if (msg.sender === 'user') {
      bubble.innerHTML = escapeHtml(msg.text);
    } else {
      bubble.innerHTML = parseMarkdown(msg.text);
    }

    wrapper.appendChild(bubble);
    return wrapper;
  }

  // ---- RENDER TYPING INDICATOR ----
  function renderTyping() {
    const el = createEl('div', 'rag-typing');
    el.id = 'rag-typing-indicator';
    el.innerHTML = '<div class="rag-typing-dot"></div><div class="rag-typing-dot"></div><div class="rag-typing-dot"></div>';
    return el;
  }

  // ---- SCROLL TO BOTTOM ----
  function scrollToBottom() {
    if (messagesContainer) {
      requestAnimationFrame(function () {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    }
  }

  // ---- BUILD HISTORY FOR GEMINI API ----
  function buildHistory() {
    const history = [];
    let expectedRole = 'user';
    for (const msg of messages) {
      if (msg.text.startsWith('Connection error:')) continue;
      const role = msg.sender === 'user' ? 'user' : 'model';
      if (role === expectedRole) {
        history.push({
          role: role,
          parts: [{ text: msg.text }]
        });
        expectedRole = role === 'user' ? 'model' : 'user';
      }
    }
    // Ensure history ends with a model message
    if (history.length > 0 && history[history.length - 1].role === 'user') {
      history.pop();
    }
    // Limit to last 10 messages (5 turns)
    return history.slice(-10);
  }

  // ---- SEND MESSAGE (SSE Streaming) ----
  async function handleSend(text) {
    if (!text || !text.trim() || isLoading) return;

    // Transition from welcome/onboarding to messages
    if (welcomeContainer && welcomeContainer.style.display !== 'none') {
      welcomeContainer.style.display = 'none';
    }
    if (onboardingContainer && onboardingContainer.style.display !== 'none') {
      onboardingContainer.style.display = 'none';
    }
    if (messagesContainer) {
      messagesContainer.style.display = 'flex';
    }

    const userMsg = { id: Date.now().toString(), sender: 'user', text: text.trim() };
    messages.push(userMsg);

    // Clear input
    if (inputEl) inputEl.value = '';
    updateSendButton();

    // Add user bubble to DOM
    messagesContainer.appendChild(renderMessage(userMsg));

    // Build history BEFORE adding the current message to history
    // (the current message is sent separately as the prompt)
    const historyForApi = buildHistory();
    // Remove the last user message from history since it's the current prompt
    if (historyForApi.length > 0 && historyForApi[historyForApi.length - 1].role === 'user') {
      historyForApi.pop();
    }

    // Show typing indicator
    isLoading = true;
    updateSendButton();
    const typingEl = renderTyping();
    messagesContainer.appendChild(typingEl);
    scrollToBottom();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyForApi
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(function () { return {}; });
        throw new Error(errData.error || 'API request failed (' + response.status + ')');
      }

      // Remove typing indicator
      typingEl.remove();

      // Create bot bubble for streaming
      const botWrapper = createEl('div', 'rag-msg bot');
      const botBubble = createEl('div', 'rag-msg-bubble rag-streaming');
      botWrapper.appendChild(botBubble);
      messagesContainer.appendChild(botWrapper);
      scrollToBottom();

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);

          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              fullText += parsed.text;
              botBubble.innerHTML = parseMarkdown(fullText);
              scrollToBottom();
            }
          } catch (parseErr) {
            // Skip malformed chunks
            if (parseErr.message && !parseErr.message.includes('JSON')) {
              throw parseErr; // Re-throw actual errors
            }
          }
        }
      }

      // Remove streaming cursor
      botBubble.classList.remove('rag-streaming');

      // Store bot message
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: fullText || 'No response received.',
      };
      messages.push(botMsg);

      // If fullText was empty, render fallback
      if (!fullText) {
        botBubble.innerHTML = parseMarkdown('No response received.');
      }

    } catch (err) {
      const existing = document.getElementById('rag-typing-indicator');
      if (existing) existing.remove();

      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Connection error: ' + (err.message || 'The server is unreachable. Please try again later.'),
      };
      messages.push(errMsg);
      messagesContainer.appendChild(renderMessage(errMsg));
    } finally {
      isLoading = false;
      updateSendButton();
      saveMessages();
      scrollToBottom();
    }
  }

  // ---- UPDATE SEND BUTTON STATE ----
  function updateSendButton() {
    if (sendBtn) {
      sendBtn.disabled = isLoading || !(inputEl && inputEl.value.trim());
    }
  }

  // ---- RESET CONVERSATION ----
  function resetChat() {
    messages = [];
    isLoading = false;
    clearStorage();

    if (messagesContainer) {
      messagesContainer.innerHTML = '';
      messagesContainer.style.display = 'none';
    }

    if (welcomeContainer) {
      // Update greeting if visitor info exists
      updateWelcomeGreeting();
      welcomeContainer.style.display = 'flex';
    }

    if (inputEl) inputEl.value = '';
    updateSendButton();
  }

  // ---- UPDATE WELCOME GREETING ----
  function updateWelcomeGreeting() {
    if (!welcomeContainer) return;
    const heading = welcomeContainer.querySelector('.rag-welcome-heading');
    const subheading = welcomeContainer.querySelector('.rag-welcome-subheading');

    if (visitorInfo && visitorInfo.name) {
      heading.textContent = 'Hi ' + visitorInfo.name + '!';
      subheading.innerHTML = 'What would you like to know about <span class="rag-highlight">Ganesh</span>?';
    } else {
      heading.textContent = 'Hi there!';
      subheading.innerHTML = 'What\'s on <span class="rag-highlight">your mind</span>?';
    }
  }

  // ---- ONBOARDING SUBMIT ----
  function handleOnboardingSubmit(nameInput, roleInput) {
    const name = nameInput.value.trim();
    const role = roleInput.value.trim();

    if (!name) {
      nameInput.style.borderColor = 'rgba(239, 68, 68, 0.6)';
      nameInput.focus();
      return;
    }

    // Save visitor info
    saveVisitor({ name: name, role: role || 'Not specified' });

    // Log to Google Sheets (fire-and-forget)
    fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, role: role || 'Not specified' }),
    }).catch(function () { /* silent fail */ });

    // Transition: hide onboarding, show welcome with personalized greeting
    if (onboardingContainer) onboardingContainer.style.display = 'none';
    updateWelcomeGreeting();
    if (welcomeContainer) welcomeContainer.style.display = 'flex';

    setTimeout(function () {
      if (inputEl) inputEl.focus();
    }, 300);
  }

  // ---- SKIP ONBOARDING ----
  function handleOnboardingSkip() {
    saveVisitor({ name: '', role: '' });
    if (onboardingContainer) onboardingContainer.style.display = 'none';
    if (welcomeContainer) welcomeContainer.style.display = 'flex';
    setTimeout(function () {
      if (inputEl) inputEl.focus();
    }, 300);
  }

  // ---- OPEN / CLOSE ----
  function openChat() {
    isOpen = true;
    triggerBtn.classList.add('hidden');
    panel.style.display = 'flex';
    panel.classList.remove('closing');
    panel.style.animation = 'none';
    panel.offsetHeight; // Force reflow
    panel.style.animation = '';

    const hasVisitor = loadVisitor();
    const hasMessages = messages.length > 0;

    if (hasMessages) {
      // Restore messages view
      if (onboardingContainer) onboardingContainer.style.display = 'none';
      if (welcomeContainer) welcomeContainer.style.display = 'none';
      if (messagesContainer) {
        messagesContainer.style.display = 'flex';
        // Restore message DOM if needed
        if (messagesContainer.children.length === 0) {
          messages.forEach(function (msg) {
            messagesContainer.appendChild(renderMessage(msg));
          });
        }
        scrollToBottom();
      }
    } else if (!hasVisitor) {
      // First time visitor — show onboarding
      if (onboardingContainer) onboardingContainer.style.display = 'flex';
      if (welcomeContainer) welcomeContainer.style.display = 'none';
      if (messagesContainer) messagesContainer.style.display = 'none';
    } else {
      // Returning visitor, no messages — show welcome
      if (onboardingContainer) onboardingContainer.style.display = 'none';
      updateWelcomeGreeting();
      if (welcomeContainer) welcomeContainer.style.display = 'flex';
      if (messagesContainer) messagesContainer.style.display = 'none';
    }

    setTimeout(function () {
      if (inputEl) inputEl.focus();
    }, 400);
  }

  function closeChat() {
    panel.classList.add('closing');
    setTimeout(function () {
      isOpen = false;
      panel.style.display = 'none';
      panel.classList.remove('closing');
      triggerBtn.classList.remove('hidden');
    }, 280);
  }

  // ---- BUILD UI ----
  function buildWidget() {
    // --- Trigger Button ---
    triggerBtn = createEl('button', 'rag-chat-trigger');
    triggerBtn.setAttribute('aria-label', 'Open AI Chat');
    triggerBtn.innerHTML = ICONS.chat + '<div class="rag-ping"></div>';
    triggerBtn.addEventListener('click', openChat);

    // --- Chat Panel ---
    panel = createEl('div', 'rag-chat-panel');
    panel.style.display = 'none';

    // Header — minimal and clean
    const header = createEl('div', 'rag-chat-header');
    header.innerHTML =
      '<div class="rag-chat-header-left">' +
      '<div class="rag-header-sparkle">' + ICONS.sparkle + '</div>' +
      '<span class="rag-header-title">Ask Ganesh\'s AI</span>' +
      '</div>';

    const headerActions = createEl('div', 'rag-chat-header-actions');

    const resetBtn = createEl('button', 'rag-chat-reset');
    resetBtn.setAttribute('aria-label', 'Reset');
    resetBtn.innerHTML = ICONS.refresh;
    resetBtn.addEventListener('click', resetChat);

    const closeBtn = createEl('button', 'rag-chat-close');
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = ICONS.close;
    closeBtn.addEventListener('click', closeChat);

    headerActions.appendChild(resetBtn);
    headerActions.appendChild(closeBtn);
    header.appendChild(headerActions);

    // --- Onboarding Container ---
    onboardingContainer = createEl('div', 'rag-onboarding-container');
    onboardingContainer.style.display = 'none';
    onboardingContainer.innerHTML =
      '<div class="rag-sphere-wrap"><div class="rag-sphere"></div></div>' +
      '<h2 class="rag-welcome-heading">Welcome!</h2>' +
      '<p class="rag-onboarding-subtitle">I\'m Ganesh\'s AI Digital Twin. Before we begin, who do I have the pleasure of speaking with?</p>' +
      '<div class="rag-onboarding-form">' +
      '<div class="rag-onboarding-field">' +
      '<span class="rag-onboarding-icon">' + ICONS.user + '</span>' +
      '<input type="text" class="rag-onboarding-input" id="rag-visitor-name" placeholder="Your name" autocomplete="off" />' +
      '</div>' +
      '<div class="rag-onboarding-field">' +
      '<span class="rag-onboarding-icon">' + ICONS.briefcase + '</span>' +
      '<input type="text" class="rag-onboarding-input" id="rag-visitor-role" placeholder="Your role (e.g., Recruiter, Student, Developer)" autocomplete="off" />' +
      '</div>' +
      '<button class="rag-onboarding-submit">Start Chatting</button>' +
      '<button class="rag-onboarding-skip">Skip</button>' +
      '</div>';

    // Bind onboarding events
    setTimeout(function () {
      var nameInput = onboardingContainer.querySelector('#rag-visitor-name');
      var roleInput = onboardingContainer.querySelector('#rag-visitor-role');
      var submitBtn = onboardingContainer.querySelector('.rag-onboarding-submit');
      var skipBtn = onboardingContainer.querySelector('.rag-onboarding-skip');

      if (submitBtn) {
        submitBtn.addEventListener('click', function () {
          handleOnboardingSubmit(nameInput, roleInput);
        });
      }
      if (skipBtn) {
        skipBtn.addEventListener('click', handleOnboardingSkip);
      }
      // Enter key in role field triggers submit
      if (roleInput) {
        roleInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') handleOnboardingSubmit(nameInput, roleInput);
        });
      }
      if (nameInput) {
        nameInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') roleInput.focus();
        });
        nameInput.addEventListener('input', function () {
          nameInput.style.borderColor = '';
        });
      }
    }, 0);

    // --- Welcome Container ---
    welcomeContainer = createEl('div', 'rag-welcome-container');
    welcomeContainer.style.display = 'none';
    welcomeContainer.innerHTML =
      '<div class="rag-sphere-wrap"><div class="rag-sphere"></div></div>' +
      '<h2 class="rag-welcome-heading">Hi there!</h2>' +
      '<p class="rag-welcome-subheading">What\'s on <span class="rag-highlight">your mind</span>?</p>' +
      '<div class="rag-suggestions-scroll">' +
      SUGGESTED_PROMPTS.map(function (p) { return '<button class="rag-suggestion-chip">' + escapeHtml(p) + '</button>'; }).join('') +
      '</div>';

    // Bind suggestion clicks
    setTimeout(function () {
      welcomeContainer.querySelectorAll('.rag-suggestion-chip').forEach(function (btn) {
        btn.addEventListener('click', function () { handleSend(btn.textContent); });
      });
    }, 0);

    // --- Messages Container ---
    messagesContainer = createEl('div', 'rag-chat-messages');
    messagesContainer.style.display = 'none';

    // --- Input Area ---
    const inputArea = createEl('div', 'rag-chat-input-area');
    const inputRow = createEl('div', 'rag-chat-input-row');
    const wandIcon = createEl('span', 'rag-wand-icon', ICONS.wand);

    inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.className = 'rag-chat-input';
    inputEl.placeholder = 'Ask me anything...';
    inputEl.addEventListener('input', updateSendButton);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend(inputEl.value);
      }
    });

    sendBtn = createEl('button', 'rag-chat-send-btn');
    sendBtn.setAttribute('aria-label', 'Send');
    sendBtn.innerHTML = ICONS.arrowUp;
    sendBtn.disabled = true;
    sendBtn.addEventListener('click', function () { handleSend(inputEl.value); });

    inputRow.appendChild(wandIcon);
    inputRow.appendChild(inputEl);
    inputRow.appendChild(sendBtn);
    inputArea.appendChild(inputRow);

    // --- Assemble Panel ---
    panel.appendChild(header);
    panel.appendChild(onboardingContainer);
    panel.appendChild(welcomeContainer);
    panel.appendChild(messagesContainer);
    panel.appendChild(inputArea);

    // Inject into page
    document.body.appendChild(triggerBtn);
    document.body.appendChild(panel);

    // --- Load persisted state ---
    loadVisitor();
    loadMessages();
  }

  // ---- INIT ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }

})();
