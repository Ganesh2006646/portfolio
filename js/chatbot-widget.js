/* ================================================
   RAG Chatbot Widget — Self-contained Vanilla JS
   Injects a floating RAG-powered AI assistant
   into any static HTML page.
   ================================================ */

(function () {
  'use strict';

  // ---- CONFIG ----
  const API_ENDPOINT = '/api/chat'; // Vercel serverless function
  const SUGGESTED_PROMPTS = [
    "What is RiceAgent Pro?",
    "What are Ganesh's core skills?",
    "Tell me about a time you failed",
    "What is Ganesh's 5-year vision?"
  ];
  const WELCOME_MESSAGE = "Hi, I'm Ganesh's AI Digital Twin — powered by a custom RAG pipeline over his personal knowledge base. Ask me about his projects, skills, philosophy, or anything a recruiter would want to know!";

  // ---- SVG ICONS ----
  const ICONS = {
    terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  };

  // ---- STATE ----
  let isOpen = false;
  let isLoading = false;
  let messages = [
    { id: 'welcome', sender: 'bot', text: WELCOME_MESSAGE, citations: [] }
  ];
  let msgCount = 1; // track message count for showing suggestions

  // ---- DOM REFS ----
  let triggerBtn, panel, messagesContainer, inputEl, sendBtn, suggestionsEl;

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

    // Bubble
    const bubble = createEl('div', 'rag-msg-bubble');
    // Simple markdown-like rendering: **bold** and newlines
    let html = escapeHtml(msg.text);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n/g, '<br>');
    bubble.innerHTML = html;
    wrapper.appendChild(bubble);

    // Citations
    if (msg.citations && msg.citations.length > 0) {
      const citsWrap = createEl('div', 'rag-citations');
      msg.citations.forEach(cit => {
        const pill = createEl('span', 'rag-citation-pill');
        const fileName = cit.source ? cit.source.split('/').pop() : cit.category;
        pill.innerHTML = `${ICONS.book}<span>${escapeHtml(fileName)}</span>`;
        pill.title = cit.context_header || '';
        citsWrap.appendChild(pill);
      });
      wrapper.appendChild(citsWrap);
    }

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

    const userMsg = { id: Date.now().toString(), sender: 'user', text: text.trim(), citations: [] };
    messages.push(userMsg);
    msgCount++;

    // Clear input
    if (inputEl) inputEl.value = '';
    updateSendButton();

    // Add user bubble to DOM
    messagesContainer.appendChild(renderMessage(userMsg));

    // Hide suggestions after first message
    if (suggestionsEl) suggestionsEl.style.display = 'none';

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

      // Remove typing
      typingEl.remove();

      if (response.ok) {
        const botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply || 'No response received.',
          citations: (data.citations || []).filter(c => c && c.source)
        };
        messages.push(botMsg);
        messagesContainer.appendChild(renderMessage(botMsg));
      } else {
        throw new Error(data.error || 'API request failed');
      }
    } catch (err) {
      // Remove typing if still present
      const existing = document.getElementById('rag-typing-indicator');
      if (existing) existing.remove();

      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Connection error: ${err.message || 'The server is unreachable. Please try again later.'}`,
        citations: []
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

  // ---- OPEN / CLOSE ----
  function openChat() {
    isOpen = true;
    triggerBtn.classList.add('hidden');
    panel.style.display = 'flex';
    panel.classList.remove('closing');
    // Reset animation
    panel.style.animation = 'none';
    panel.offsetHeight; // force reflow
    panel.style.animation = '';
    
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

    // Header
    const header = createEl('div', 'rag-chat-header');
    header.innerHTML = `
      <div class="rag-chat-header-left">
        <div class="rag-chat-avatar">
          ${ICONS.terminal}
          <div class="rag-status-dot"></div>
        </div>
        <div class="rag-chat-header-info">
          <h3>Ganesh's Digital Twin</h3>
          <p><span class="rag-sparkle">✦</span> RAG Pipeline Active</p>
        </div>
      </div>
    `;
    const closeBtn = createEl('button', 'rag-chat-close');
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.innerHTML = ICONS.close;
    closeBtn.addEventListener('click', closeChat);
    header.appendChild(closeBtn);

    // Messages
    messagesContainer = createEl('div', 'rag-chat-messages');
    // Render welcome message
    messagesContainer.appendChild(renderMessage(messages[0]));

    // Suggestions
    suggestionsEl = createEl('div', 'rag-suggestions');
    let suggestionsHTML = `
      <div class="rag-suggestions-label">${ICONS.compass} Suggested Topics</div>
      <div class="rag-suggestions-grid">
    `;
    SUGGESTED_PROMPTS.forEach(prompt => {
      suggestionsHTML += `<button class="rag-suggestion-btn">${escapeHtml(prompt)}</button>`;
    });
    suggestionsHTML += `</div>`;
    suggestionsEl.innerHTML = suggestionsHTML;

    // Bind suggestion clicks
    setTimeout(() => {
      suggestionsEl.querySelectorAll('.rag-suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => handleSend(btn.textContent));
      });
    }, 0);

    // Input area
    const inputArea = createEl('div', 'rag-chat-input-area');
    const inputWrap = createEl('div', 'rag-chat-input-wrap');

    inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.className = 'rag-chat-input';
    inputEl.placeholder = 'Ask about Ganesh\'s projects, skills...';
    inputEl.addEventListener('input', updateSendButton);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend(inputEl.value);
      }
    });

    sendBtn = createEl('button', 'rag-chat-send');
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.innerHTML = ICONS.send;
    sendBtn.disabled = true;
    sendBtn.addEventListener('click', () => handleSend(inputEl.value));

    inputWrap.appendChild(inputEl);
    inputWrap.appendChild(sendBtn);
    inputArea.appendChild(inputWrap);

    // Footer
    const footer = createEl('div', 'rag-chat-footer');
    footer.textContent = 'Powered by Custom RAG · Gemini Embedding-2';

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(messagesContainer);
    panel.appendChild(suggestionsEl);
    panel.appendChild(inputArea);
    panel.appendChild(footer);

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
