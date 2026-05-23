/* ================================================
   RAG Chatbot Widget — Self-contained Vanilla JS
   Injects a floating RAG-powered AI assistant
   into any static HTML page.
   ================================================ */

(function () {
  'use strict';

  // ---- CONFIG ----
  const API_ENDPOINT = '/api/chat'; // Vercel serverless function
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
  const WELCOME_MESSAGE = "Hi! I'm Ganesh's AI Digital Twin — ask me about his projects, skills, philosophy, or anything a recruiter would want to know!";

  // ---- SVG ICONS ----
  const ICONS = {
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    wand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v1"/><path d="M19 17v1"/><path d="M9 3H8"/><path d="M16 21h-1"/></svg>`,
    arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M16 3h5v5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 21H3v-5"/></svg>`,
    sparkle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5z"/></svg>`,
  };

  // ---- STATE ----
  let isOpen = false;
  let isLoading = false;
  let messages = [];
  let msgCount = 0;

  // ---- DOM REFS ----
  let triggerBtn, panel, welcomeContainer, messagesContainer, inputEl, sendBtn;

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

  // ---- RENDER MESSAGE ----
  function renderMessage(msg) {
    const wrapper = createEl('div', `rag-msg ${msg.sender}`);
    const bubble = createEl('div', 'rag-msg-bubble');
    let html = escapeHtml(msg.text);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n/g, '<br>');
    bubble.innerHTML = html;
    wrapper.appendChild(bubble);
    // No citations shown — clean output
    return wrapper;
  }

  // ---- RENDER TYPING INDICATOR ----
  function renderTyping() {
    const el = createEl('div', 'rag-typing');
    el.id = 'rag-typing-indicator';
    el.innerHTML = `<div class="rag-typing-dot"></div><div class="rag-typing-dot"></div><div class="rag-typing-dot"></div>`;
    return el;
  }

  // ---- SCROLL TO BOTTOM ----
  function scrollToBottom() {
    if (messagesContainer) {
      requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    }
  }

  // ---- SEND MESSAGE ----
  async function handleSend(text) {
    if (!text || !text.trim() || isLoading) return;

    // Transition from welcome screen to messages screen
    if (welcomeContainer && welcomeContainer.style.display !== 'none') {
      welcomeContainer.style.display = 'none';
      if (messagesContainer) {
        messagesContainer.style.display = 'flex';
      }
    }

    const userMsg = { id: Date.now().toString(), sender: 'user', text: text.trim() };
    messages.push(userMsg);
    msgCount++;

    // Clear input
    if (inputEl) inputEl.value = '';
    updateSendButton();

    // Add user bubble to DOM
    messagesContainer.appendChild(renderMessage(userMsg));

    // Show typing
    isLoading = true;
    updateSendButton();
    const typingEl = renderTyping();
    messagesContainer.appendChild(typingEl);
    scrollToBottom();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await response.json();
      typingEl.remove();

      if (response.ok) {
        const botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply || 'No response received.',
        };
        messages.push(botMsg);
        messagesContainer.appendChild(renderMessage(botMsg));
      } else {
        throw new Error(data.error || 'API request failed');
      }
    } catch (err) {
      const existing = document.getElementById('rag-typing-indicator');
      if (existing) existing.remove();

      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Connection error: ${err.message || 'The server is unreachable. Please try again later.'}`,
      };
      messages.push(errMsg);
      messagesContainer.appendChild(renderMessage(errMsg));
    } finally {
      isLoading = false;
      updateSendButton();
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
    msgCount = 0;
    isLoading = false;

    if (messagesContainer) {
      messagesContainer.innerHTML = '';
      messagesContainer.style.display = 'none';
    }

    if (welcomeContainer) {
      welcomeContainer.style.display = 'flex';
    }

    if (inputEl) inputEl.value = '';
    updateSendButton();
  }

  // ---- OPEN / CLOSE ----
  function openChat() {
    isOpen = true;
    triggerBtn.classList.add('hidden');
    panel.style.display = 'flex';
    panel.classList.remove('closing');
    panel.style.animation = 'none';
    panel.offsetHeight;
    panel.style.animation = '';

    if (messages.length === 0) {
      if (welcomeContainer) welcomeContainer.style.display = 'flex';
      if (messagesContainer) messagesContainer.style.display = 'none';
    } else {
      if (welcomeContainer) welcomeContainer.style.display = 'none';
      if (messagesContainer) messagesContainer.style.display = 'flex';
    }

    setTimeout(() => {
      if (inputEl) inputEl.focus();
    }, 400);
  }

  function closeChat() {
    panel.classList.add('closing');
    setTimeout(() => {
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
    triggerBtn.innerHTML = `${ICONS.chat}<div class="rag-ping"></div>`;
    triggerBtn.addEventListener('click', openChat);

    // --- Chat Panel ---
    panel = createEl('div', 'rag-chat-panel');
    panel.style.display = 'none';

    // Header — minimal and clean
    const header = createEl('div', 'rag-chat-header');
    header.innerHTML = `
      <div class="rag-chat-header-left">
        <div class="rag-header-sparkle">${ICONS.sparkle}</div>
        <span class="rag-header-title">Ask Ganesh's AI</span>
      </div>
    `;

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

    // Welcome Container
    welcomeContainer = createEl('div', 'rag-welcome-container');
    welcomeContainer.innerHTML = `
      <div class="rag-sphere-wrap">
        <div class="rag-sphere"></div>
      </div>
      <h2 class="rag-welcome-heading">Hi there!</h2>
      <p class="rag-welcome-subheading">What's on <span class="rag-highlight">your mind</span>?</p>
      <div class="rag-suggestions-scroll">
        ${SUGGESTED_PROMPTS.map(p => `<button class="rag-suggestion-chip">${escapeHtml(p)}</button>`).join('')}
      </div>
    `;

    // Bind suggestion clicks
    setTimeout(() => {
      welcomeContainer.querySelectorAll('.rag-suggestion-chip').forEach(btn => {
        btn.addEventListener('click', () => handleSend(btn.textContent));
      });
    }, 0);

    // Messages
    messagesContainer = createEl('div', 'rag-chat-messages');
    messagesContainer.style.display = 'none';

    // Input area — single row: wand + input + send
    const inputArea = createEl('div', 'rag-chat-input-area');
    const inputRow = createEl('div', 'rag-chat-input-row');

    const wandIcon = createEl('span', 'rag-wand-icon', ICONS.wand);

    inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.className = 'rag-chat-input';
    inputEl.placeholder = 'Ask me anything...';
    inputEl.addEventListener('input', updateSendButton);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend(inputEl.value);
      }
    });

    sendBtn = createEl('button', 'rag-chat-send-btn');
    sendBtn.setAttribute('aria-label', 'Send');
    sendBtn.innerHTML = ICONS.arrowUp;
    sendBtn.disabled = true;
    sendBtn.addEventListener('click', () => handleSend(inputEl.value));

    inputRow.appendChild(wandIcon);
    inputRow.appendChild(inputEl);
    inputRow.appendChild(sendBtn);
    inputArea.appendChild(inputRow);

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(welcomeContainer);
    panel.appendChild(messagesContainer);
    panel.appendChild(inputArea);

    // Inject into page
    document.body.appendChild(triggerBtn);
    document.body.appendChild(panel);
  }

  // ---- INIT ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }

})();
