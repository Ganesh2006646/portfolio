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
    // Professional mini-icons for quick-reply chips
    rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/></svg>`,
  };

  // ---- CONTEXTUAL FOLLOW-UP SUGGESTIONS ----
  const FOLLOW_UP_MAP = [
    { keywords: ['project', 'riceagent', 'execucode', 'spectra', 'flip', 'hackathon', 'built', 'repo'], prompts: ['What tech stack did Ganesh use?', 'Tell me about another project', 'What hackathons has Ganesh won?'] },
    { keywords: ['skill', 'stack', 'python', 'flutter', 'react', 'javascript', 'ml', 'ai', 'framework', 'language'], prompts: ['What are his strongest skills?', 'What projects use this tech?', 'What certifications does Ganesh have?'] },
    { keywords: ['experience', 'intern', 'work', 'job', 'role', 'codsoft', 'unlox', 'ambassador', 'position'], prompts: ['What projects did he build during internships?', 'Is Ganesh open to new roles?', 'Tell me about his education'] },
    { keywords: ['contact', 'email', 'reach', 'connect', 'hire', 'linkedin', 'social'], prompts: ['What is his GitHub profile?', 'Where is Ganesh located?', 'Tell me about his background'] },
    { keywords: ['education', 'college', 'amrita', 'university', 'study', 'degree', 'btech'], prompts: ['What are his career goals?', 'What clubs or activities is he in?', 'Tell me about his projects'] },
    { keywords: ['goal', 'vision', 'future', 'plan', 'career', 'germany', 'msc'], prompts: ['What is The Linear Paradigm?', 'What is his engineering philosophy?', 'What skills is he building?'] },
    { keywords: ['philosophy', 'linear', 'paradigm', 'values', 'belief', 'mindset'], prompts: ['Tell me about a time he failed', 'Why should I hire Ganesh?', 'What drives him?'] },
  ];

  function getFollowUps(userText, botText) {
    const combined = ((userText || '') + ' ' + (botText || '')).toLowerCase();
    const matched = [];
    for (const entry of FOLLOW_UP_MAP) {
      for (const kw of entry.keywords) {
        if (combined.includes(kw)) {
          matched.push(...entry.prompts);
          break;
        }
      }
    }
    // Deduplicate, shuffle, pick 2
    const unique = [...new Set(matched)];
    const shuffled = shuffleArray(unique);
    return shuffled.slice(0, 2);
  }

  function renderFollowUps(userText, botText) {
    const prompts = getFollowUps(userText, botText);
    if (prompts.length === 0) return null;
    const wrapper = createEl('div', 'rag-followups');
    prompts.forEach(function (p) {
      const btn = createEl('button', 'rag-followup-chip', escapeHtml(p));
      btn.addEventListener('click', function () {
        wrapper.remove();
        handleSend(p);
      });
      wrapper.appendChild(btn);
    });
    return wrapper;
  }

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
  function isPortfolioLink(url) {
    if (!url) return false;
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith('#') || cleanUrl.startsWith('/') || cleanUrl.startsWith('.') || !cleanUrl.startsWith('http')) {
      return true;
    }
    try {
      const parsed = new URL(cleanUrl);
      return parsed.hostname === 'brandofganesh.vercel.app' || parsed.hostname === window.location.hostname;
    } catch (e) {
      return cleanUrl.includes('brandofganesh.vercel.app');
    }
  }

  function createLink(text, url) {
    const isSelf = isPortfolioLink(url);
    const target = isSelf ? '_self' : '_blank';
    const rel = isSelf ? '' : ' rel="noopener noreferrer"';
    return '<a href="' + url + '" target="' + target + '"' + rel + ' class="rag-md-link">' + text + '</a>';
  }

  // ---- RICH MARKDOWN PARSER ----
  function processInline(text) {
    let html = escapeHtml(text);
    // Markdown links [text](url) — must be processed BEFORE bold/italic
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, p1, p2) {
      return createLink(p1, p2);
    });
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic (single * not preceded/followed by *)
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="rag-inline-code">$1</code>');
    // Bare URLs (http/https) not already wrapped in an anchor tag
    html = html.replace(/(?<!href="|">)(https?:\/\/[^\s<]+)/g, function (match, p1) {
      return createLink(p1, p1);
    });
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
          history: historyForApi,
          visitorInfo: visitorInfo || null
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
        botBubble.innerHTML = parseMarkdown('I processed your question but received an empty response from the AI engine. 🤔 This can happen during high-traffic periods.\n\nPlease try asking again — I\'m ready for round two! 🔄');
      }

      // ---- CONTEXTUAL FOLLOW-UP SUGGESTIONS ----
      if (fullText) {
        const followUpEl = renderFollowUps(text, fullText);
        if (followUpEl) {
          messagesContainer.appendChild(followUpEl);
          scrollToBottom();
        }
      }

    } catch (err) {
      const existing = document.getElementById('rag-typing-indicator');
      if (existing) existing.remove();

      // ---- SMART ERROR INTERCEPTOR (10+ edge cases) ----
      const msg = (err.message || '').toLowerCase();
      let friendlyText = '';

      if (msg.includes('429') || msg.includes('quota') || msg.includes('limit') || msg.includes('capacity') || msg.includes('exhausted') || msg.includes('rate')) {
        // Case 1: API rate limit / quota exceeded
        friendlyText = 'Whoa, my neural circuits are overheating! 🧠🔥 The Gemini API limit has been temporarily exhausted — so many awesome visitors are chatting with me right now!\n\nGive it **30 seconds** and try again. Meanwhile, connect directly with Ganesh on [LinkedIn](https://www.linkedin.com/in/kankatala-ganesh-giridhar-071876322) or send a message via the [Contact Page](https://brandofganesh.vercel.app/contact.html)! 🚀';
      } else if (msg.includes('api key') || msg.includes('api_key') || msg.includes('apikey') || msg.includes('unauthorized') || msg.includes('401') || msg.includes('403') || msg.includes('forbidden')) {
        // Case 2: API key missing or invalid
        friendlyText = 'Oops! It looks like my access credentials need a quick refresh. 🔑 This is a backend configuration issue — not something you did wrong at all!\n\nGanesh will fix this shortly. In the meantime, feel free to explore the [Portfolio](https://brandofganesh.vercel.app) or reach out on [LinkedIn](https://www.linkedin.com/in/kankatala-ganesh-giridhar-071876322)! 💼';
      } else if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('deadline') || msg.includes('504') || msg.includes('aborted')) {
        // Case 3: Request timeout / gateway timeout
        friendlyText = 'My response pipeline took a little longer than expected and timed out. ⏱️ This usually happens when the server is under heavy load.\n\nPlease try sending your message again — it usually works on the second attempt! 🔄';
      } else if (msg.includes('network') || msg.includes('failed to fetch') || msg.includes('fetch') || msg.includes('err_internet') || msg.includes('offline') || msg.includes('dns')) {
        // Case 4: Network / connectivity issues
        friendlyText = 'Hmm, it looks like your internet connection hiccupped! 📡 I couldn\'t reach the server.\n\nCheck your Wi-Fi or mobile data and try again. If everything looks fine on your end, the server might be momentarily rebooting — just retry in a few seconds! 🌐';
      } else if (msg.includes('502') || msg.includes('503') || msg.includes('bad gateway') || msg.includes('service unavailable') || msg.includes('unreachable')) {
        // Case 5: Server down / bad gateway
        friendlyText = 'Oh! My home server at Vercel is temporarily taking a quick power nap. 😴💤 This is a brief infrastructure blip and usually resolves in under a minute.\n\nPlease try again shortly, or drop Ganesh a direct mail at **kankatalaganeshgiridhar@gmail.com**! 📬';
      } else if (msg.includes('too large') || msg.includes('payload') || msg.includes('413') || msg.includes('content length')) {
        // Case 6: Payload too large
        friendlyText = 'That\'s a really detailed question — so detailed that it exceeded my input buffer! 📦 Could you try rephrasing it in a shorter way?\n\nTip: Break complex questions into smaller parts and I\'ll handle each one perfectly! ✨';
      } else if (msg.includes('safety') || msg.includes('blocked') || msg.includes('content filter') || msg.includes('harm') || msg.includes('recitation')) {
        // Case 7: Content safety filter triggered
        friendlyText = 'My AI safety filters flagged something in that request. 🛡️ This is a protective measure to keep our conversation professional and helpful.\n\nCould you try rephrasing your question? I\'m here to help with anything about Ganesh\'s projects, skills, experience, or background! 💡';
      } else if (msg.includes('embedding') || msg.includes('vector') || msg.includes('dimension')) {
        // Case 8: Embedding generation failure
        friendlyText = 'My semantic search engine had a brief hiccup while converting your question into vectors. 🔢 This is rare and usually fixes itself.\n\nPlease try asking your question again! 🔄';
      } else if (msg.includes('json') || msg.includes('parse') || msg.includes('unexpected token') || msg.includes('syntax')) {
        // Case 9: Malformed response / JSON parse error
        friendlyText = 'I received a response but it got a little scrambled in transit. 📝 Think of it like a partially downloaded file.\n\nPlease retry your question — the next response should come through cleanly! ✅';
      } else if (msg.includes('cors') || msg.includes('origin') || msg.includes('cross-origin')) {
        // Case 10: CORS / cross-origin issues
        friendlyText = 'There\'s a cross-origin security policy preventing my connection. 🔒 This is a backend configuration detail that Ganesh can resolve quickly.\n\nIn the meantime, explore the [Projects Page](https://brandofganesh.vercel.app/work.html) directly! 🚀';
      } else if (msg.includes('ssl') || msg.includes('certificate') || msg.includes('tls') || msg.includes('handshake')) {
        // Case 11: SSL / certificate errors
        friendlyText = 'There seems to be a secure connection issue between your browser and my server. 🔐 Try refreshing the page or clearing your browser cache.\n\nIf the issue persists, try a different browser! 🌐';
      } else if (err.name === 'AbortError' || msg.includes('abort')) {
        // Case 12: Request was aborted
        friendlyText = 'The request was cancelled before I could finish responding. ✋ This sometimes happens with slow connections.\n\nNo worries — just ask again and I\'ll be right on it! ⚡';
      } else {
        // Case 13: Generic unknown error (catch-all)
        friendlyText = 'Hmm, my digital loops ran into an unexpected recursion! 🌀 Something went a bit sideways while fetching that answer.\n\nTry clicking the **refresh icon** in the header to restart our conversation, or dive directly into Ganesh\'s repositories on [GitHub](https://github.com/Ganesh2006646)! 💻';
      }

      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: friendlyText,
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
    triggerBtn.innerHTML =
      '<div class="rag-aura"></div>' +
      '<div class="rag-orbit-ring"></div>' +
      '<div class="rag-orb">' +
        '<div class="rag-orb-icon">' + ICONS.sparkle + '</div>' +
      '</div>';
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
      '<div class="rag-quick-replies">' +
      '<button class="rag-quick-chip" data-prompt="Show me Ganesh\'s projects, repositories, and live links!"><span class="rag-chip-icon">' + ICONS.rocket + '</span>See Projects</button>' +
      '<button class="rag-quick-chip" data-prompt="How can I contact Ganesh? What are his social links and email?"><span class="rag-chip-icon">' + ICONS.phone + '</span>Contact Ganesh</button>' +
      '<button class="rag-quick-chip" data-prompt="Tell me about Ganesh\'s LinkedIn profile and positions."><span class="rag-chip-icon">' + ICONS.linkedin + '</span>View LinkedIn</button>' +
      '</div>' +
      '<div class="rag-suggestions-label">Or ask a question:</div>' +
      '<div class="rag-suggestions-scroll">' +
      SUGGESTED_PROMPTS.map(function (p) { return '<button class="rag-suggestion-chip">' + escapeHtml(p) + '</button>'; }).join('') +
      '</div>';

    // Bind suggestion clicks
    setTimeout(function () {
      welcomeContainer.querySelectorAll('.rag-suggestion-chip').forEach(function (btn) {
        btn.addEventListener('click', function () { handleSend(btn.textContent); });
      });
      // Bind quick replies clicks in welcome
      welcomeContainer.querySelectorAll('.rag-quick-chip').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const prompt = btn.getAttribute('data-prompt');
          handleSend(prompt);
        });
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
