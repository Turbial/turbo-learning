/**
 * LLM Chat Widget — v1.0.0
 * Embeddable chat component for any OpenAI-compatible API.
 * No framework dependencies. Drop-in via <script> tag.
 *
 * Usage:
 *   <script src="chat-widget.js"></script>
 *   <script>
 *     LLMChatWidget.init({
 *       endpoint: 'https://api.deepseek.com/v1/chat/completions',
 *       apiKey: 'sk-...',
 *       model: 'deepseek-chat',
 *     });
 *   </script>
 *
 * Or auto-init via a container element:
 *   <div id="llm-chat" data-endpoint="..." data-api-key="..." data-model="..."></div>
 */

(function (global) {
  'use strict';

  // ── Configuration ────────────────────────────────────────
  const DEFAULTS = {
    endpoint: '',
    apiKey: '',
    model: 'deepseek-chat',
    systemPrompt: 'You are a helpful, concise assistant.',
    maxTokens: 2048,
    temperature: 0.7,
    placeholder: 'Type a message...',
    title: 'AI Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'inline'
    theme: 'light',           // 'light' | 'dark'
    containerId: null,        // mount into existing element instead of floating
    launcherSize: 56,         // px, floating mode only
    windowWidth: 380,         // px
    windowHeight: 560,        // px
    streamingTimeoutMs: 30000,
  };

  let config = { ...DEFAULTS };

  // ── DOM State ────────────────────────────────────────────
  let root = null;
  let isOpen = false;
  let messages = [];
  let isStreaming = false;
  let controller = null;

  // ── Markdown (light) ─────────────────────────────────────
  function renderMarkdown(text) {
    if (!text) return '';
    let html = text
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Lists
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return '<p>' + html + '</p>';
  }

  // ── Build UI ─────────────────────────────────────────────
  function buildCSS() {
    const css = `
      .llm-chat-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .llm-chat-root * { box-sizing: border-box; }

      /* Floating launcher */
      .llm-chat-launcher {
        position: fixed;
        z-index: 99998;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .llm-chat-launcher:hover { transform: scale(1.06); box-shadow: 0 6px 24px rgba(0,0,0,0.2); }
      .llm-chat-launcher svg { width: 26px; height: 26px; }

      /* Chat window */
      .llm-chat-window {
        position: fixed;
        z-index: 99999;
        border-radius: 14px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        transition: opacity 0.25s, transform 0.25s;
      }
      .llm-chat-window.hidden { opacity: 0; transform: translateY(16px) scale(0.96); pointer-events: none; }
      .llm-chat-window.visible { opacity: 1; transform: translateY(0) scale(1); }

      /* Inline mode */
      .llm-chat-inline {
        border-radius: 14px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border: 1px solid #e0e0e0;
        height: 100%;
        min-height: 400px;
      }

      /* Header */
      .llm-chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        font-weight: 600;
        font-size: 15px;
        user-select: none;
      }
      .llm-chat-header-btns { display: flex; gap: 4px; }
      .llm-chat-header-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 18px;
        line-height: 1;
        transition: background 0.15s;
      }

      /* Messages */
      .llm-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        scroll-behavior: smooth;
      }
      .llm-chat-msg {
        display: flex;
        gap: 10px;
        max-width: 88%;
        animation: llm-fade-in 0.25s ease;
      }
      @keyframes llm-fade-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      .llm-chat-msg.user { align-self: flex-end; flex-direction: row-reverse; }
      .llm-chat-msg.assistant { align-self: flex-start; }
      .llm-chat-avatar {
        width: 32px; height: 32px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }
      .llm-chat-bubble {
        padding: 10px 14px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.55;
        word-break: break-word;
      }
      .llm-chat-bubble p { margin: 0; }
      .llm-chat-bubble p + p { margin-top: 8px; }
      .llm-chat-bubble pre {
        margin: 8px 0 0;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        overflow-x: auto;
      }
      .llm-chat-bubble code { font-size: 13px; }
      .llm-chat-bubble h1, .llm-chat-bubble h2, .llm-chat-bubble h3 { margin: 8px 0 4px; font-size: 15px; }
      .llm-chat-bubble ul { margin: 4px 0; padding-left: 20px; }
      .llm-chat-bubble li { margin: 2px 0; }
      .llm-chat-typing { align-self: flex-start; padding: 10px 18px; border-radius: 16px; display: flex; gap: 4px; }
      .llm-chat-typing span {
        width: 7px; height: 7px; border-radius: 50%;
        animation: llm-bounce 1.4s infinite ease-in-out both;
      }
      .llm-chat-typing span:nth-child(1) { animation-delay: -0.32s; }
      .llm-chat-typing span:nth-child(2) { animation-delay: -0.16s; }
      @keyframes llm-bounce { 0%,80%,100% { transform:scale(0.6); } 40% { transform:scale(1); } }

      /* Input */
      .llm-chat-input-area {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid;
        align-items: flex-end;
      }
      .llm-chat-input {
        flex: 1;
        border: 1px solid;
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        max-height: 120px;
        line-height: 1.4;
        outline: none;
        transition: border-color 0.2s;
      }
      .llm-chat-send {
        width: 40px; height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: transform 0.15s, opacity 0.15s;
      }
      .llm-chat-send:disabled { opacity: 0.4; cursor: default; }
      .llm-chat-send:not(:disabled):hover { transform: scale(1.06); }
      .llm-chat-send svg { width: 18px; height: 18px; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildThemeCSS() {
    const isDark = config.theme === 'dark';
    const themeCSS = `
      .llm-chat-root {
        --bg: ${isDark ? '#1a1a2e' : '#ffffff'};
        --bg-secondary: ${isDark ? '#16213e' : '#f7f7f8'};
        --text: ${isDark ? '#e8e8ed' : '#1a1a1a'};
        --text-secondary: ${isDark ? '#9ca3af' : '#666'};
        --border: ${isDark ? '#2d2d44' : '#e5e5e5'};
        --bubble-user: ${isDark ? '#059669' : '#047857'};
        --bubble-user-text: #ffffff;
        --bubble-assistant: ${isDark ? '#1e3a2f' : '#ecfdf5'};
        --bubble-assistant-text: ${isDark ? '#d1fae5' : '#1a1a1a'};
        --accent: #059669;
        --typing-dot: ${isDark ? '#9ca3af' : '#999'};
      }
      .llm-chat-root .llm-chat-launcher { background: var(--accent); color: #fff; }
      .llm-chat-root .llm-chat-window,
      .llm-chat-root .llm-chat-inline { background: var(--bg); }
      .llm-chat-root .llm-chat-header { background: var(--accent); color: #fff; }
      .llm-chat-root .llm-chat-header-btn { color: rgba(255,255,255,0.7); }
      .llm-chat-root .llm-chat-header-btn:hover { background: rgba(255,255,255,0.15); }
      .llm-chat-root .llm-chat-messages { background: var(--bg-secondary); }
      .llm-chat-root .llm-chat-bubble.user { background: var(--bubble-user); color: var(--bubble-user-text); }
      .llm-chat-root .llm-chat-bubble.assistant { background: var(--bubble-assistant); color: var(--bubble-assistant-text); }
      .llm-chat-root .llm-chat-bubble pre { background: ${isDark ? '#0d0d1a' : '#e8e8ed'}; }
      .llm-chat-root .llm-chat-typing { background: var(--bubble-assistant); }
      .llm-chat-root .llm-chat-typing span { background: var(--typing-dot); }
      .llm-chat-root .llm-chat-input-area { border-color: var(--border); }
      .llm-chat-root .llm-chat-input { background: var(--bg); color: var(--text); border-color: var(--border); }
      .llm-chat-root .llm-chat-input:focus { border-color: var(--accent); }
      .llm-chat-root .llm-chat-send { background: var(--accent); color: #fff; }
    `;
    const style = document.createElement('style');
    style.textContent = themeCSS;
    document.head.appendChild(style);
  }

  function buildDOM() {
    root = document.createElement('div');
    root.className = 'llm-chat-root';
    document.body.appendChild(root);

    buildThemeCSS();

    const isInline = config.position === 'inline' || config.containerId;

    if (isInline) {
      const container = config.containerId
        ? document.getElementById(config.containerId)
        : root;
      if (!container && config.containerId) {
        console.warn('[LLMChatWidget] Container #' + config.containerId + ' not found, using body');
      }
      (config.containerId && container ? container : root).innerHTML = buildChatWindow(true);
      const win = (config.containerId && container ? container : root).querySelector('.llm-chat-inline');
      // Auto-open in inline mode
      const msgs = win.querySelector('.llm-chat-messages');
      addWelcomeMessage(msgs);
      bindEvents(win);
    } else {
      // Floating mode
      root.innerHTML = buildLauncher() + buildChatWindow(false);
      const launcher = root.querySelector('.llm-chat-launcher');
      const win = root.querySelector('.llm-chat-window');

      // Position launcher
      if (config.position === 'bottom-left') {
        launcher.style.left = '20px';
        launcher.style.bottom = '20px';
        win.style.left = '20px';
        win.style.bottom = '84px';
      } else {
        launcher.style.right = '20px';
        launcher.style.bottom = '20px';
        win.style.right = '20px';
        win.style.bottom = '84px';
      }

      launcher.style.width = config.launcherSize + 'px';
      launcher.style.height = config.launcherSize + 'px';
      win.style.width = config.windowWidth + 'px';
      win.style.height = config.windowHeight + 'px';
      win.classList.add('hidden');

      launcher.addEventListener('click', () => toggleChat(win));
      win.querySelector('.llm-chat-header-btn[data-action="close"]')
        .addEventListener('click', () => toggleChat(win));

      addWelcomeMessage(win.querySelector('.llm-chat-messages'));
      bindEvents(win);
    }
  }

  function buildLauncher() {
    return `
      <div class="llm-chat-launcher" title="${escAttr(config.title)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>`;
  }

  function buildChatWindow(inline) {
    const cls = inline ? 'llm-chat-inline' : 'llm-chat-window hidden';
    return `
      <div class="${cls}" style="${inline ? '' : 'width:' + config.windowWidth + 'px;height:' + config.windowHeight + 'px;'}">
        <div class="llm-chat-header">
          <span>${escHtml(config.title)}</span>
          <div class="llm-chat-header-btns">
            ${inline ? '' : '<button class="llm-chat-header-btn" data-action="close" title="Close">✕</button>'}
          </div>
        </div>
        <div class="llm-chat-messages"></div>
        <div class="llm-chat-input-area">
          <textarea class="llm-chat-input" placeholder="${escAttr(config.placeholder)}" rows="1"></textarea>
          <button class="llm-chat-send" title="Send">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>`;
  }

  function addWelcomeMessage(container) {
    if (!config.welcomeMessage) return;
    container.innerHTML = `
      <div class="llm-chat-msg assistant">
        <div class="llm-chat-avatar">🤖</div>
        <div class="llm-chat-bubble assistant">${renderMarkdown(config.welcomeMessage)}</div>
      </div>`;
    messages = [{ role: 'assistant', content: config.welcomeMessage }];
  }

  function bindEvents(win) {
    const input = win.querySelector('.llm-chat-input');
    const sendBtn = win.querySelector('.llm-chat-send');
    const msgsContainer = win.querySelector('.llm-chat-messages');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input, msgsContainer, sendBtn);
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    sendBtn.addEventListener('click', () => sendMessage(input, msgsContainer, sendBtn));
  }

  function toggleChat(win) {
    isOpen = !isOpen;
    if (isOpen) {
      win.classList.remove('hidden');
      win.classList.add('visible');
      win.querySelector('.llm-chat-input').focus();
    } else {
      win.classList.add('hidden');
      win.classList.remove('visible');
    }
  }

  // ── API ──────────────────────────────────────────────────
  async function sendMessage(input, container, sendBtn) {
    const text = input.value.trim();
    if (!text || isStreaming) return;

    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;
    isStreaming = true;

    // Add user message
    addMessage(container, 'user', text);
    messages.push({ role: 'user', content: text });

    // Add typing indicator
    const typingEl = addTyping(container);
    scrollBottom(container);

    // Build request
    const reqMessages = [
      { role: 'system', content: config.systemPrompt },
      ...messages,
    ];

    controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.streamingTimeoutMs);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (config.apiKey) headers['Authorization'] = 'Bearer ' + config.apiKey;

      const res = await fetch(config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.model,
          messages: reqMessages,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = 'API error ' + res.status;
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error?.message || errJson.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      // Remove typing
      if (typingEl) typingEl.remove();

      // Streaming read
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      let bubbleEl = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              if (!bubbleEl) {
                bubbleEl = addMessage(container, 'assistant', assistantContent);
              } else {
                bubbleEl.innerHTML = renderMarkdown(assistantContent);
              }
              scrollBottom(container);
            }
          } catch (_) {}
        }
      }

      // Handle any remaining buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data: ') && trimmed.slice(6) !== '[DONE]') {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              if (bubbleEl) bubbleEl.innerHTML = renderMarkdown(assistantContent);
            }
          } catch (_) {}
        }
      }

      // Fallback: if no streaming content, try non-streaming parse
      if (!assistantContent && bubbleEl) {
        bubbleEl.innerHTML = renderMarkdown('_(no response received)_');
        assistantContent = '_(no response received)_';
      }

      messages.push({ role: 'assistant', content: assistantContent });

    } catch (err) {
      clearTimeout(timeout);
      if (typingEl) typingEl.remove();
      if (err.name === 'AbortError') {
        addMessage(container, 'assistant', '⏱️ _Request timed out. Please try again._');
        messages.push({ role: 'assistant', content: 'Request timed out.' });
      } else {
        addMessage(container, 'assistant', '⚠️ _Error: ' + escHtml(err.message) + '_');
        messages.push({ role: 'assistant', content: 'Error: ' + err.message });
      }
    }

    isStreaming = false;
    sendBtn.disabled = false;
    controller = null;
    input.focus();
  }

  function addMessage(container, role, content) {
    const div = document.createElement('div');
    div.className = 'llm-chat-msg ' + role;
    const avatar = role === 'user' ? '👤' : '🤖';
    div.innerHTML = `
      <div class="llm-chat-avatar">${avatar}</div>
      <div class="llm-chat-bubble ${role}">${renderMarkdown(content)}</div>`;
    container.appendChild(div);
    return div.querySelector('.llm-chat-bubble');
  }

  function addTyping(container) {
    const div = document.createElement('div');
    div.className = 'llm-chat-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    return div;
  }

  function scrollBottom(container) {
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function escAttr(s) {
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Public API ───────────────────────────────────────────
  function init(userConfig) {
    config = { ...DEFAULTS, ...userConfig };
    if (!config.endpoint) {
      console.error('[LLMChatWidget] endpoint is required');
      return;
    }
    buildCSS();
    buildDOM();
    return {
      open: () => { if (!isOpen && root) { const w = root.querySelector('.llm-chat-window'); if (w) toggleChat(w); } },
      close: () => { if (isOpen && root) { const w = root.querySelector('.llm-chat-window'); if (w) toggleChat(w); } },
      destroy: () => { if (root) { root.remove(); root = null; messages = []; } },
      addMessage: (role, content) => { messages.push({ role, content }); },
    };
  }

  // ── Auto-init from DOM ───────────────────────────────────
  function autoInit() {
    const el = document.getElementById('llm-chat');
    if (!el) return;
    const dataConfig = {
      endpoint: el.dataset.endpoint,
      apiKey: el.dataset.apiKey,
      model: el.dataset.model || DEFAULTS.model,
      systemPrompt: el.dataset.systemPrompt || DEFAULTS.systemPrompt,
      title: el.dataset.title || DEFAULTS.title,
      theme: el.dataset.theme || DEFAULTS.theme,
      position: el.dataset.position || 'inline',
      containerId: 'llm-chat',
    };
    if (dataConfig.endpoint) init(dataConfig);
  }

  // ── Export ───────────────────────────────────────────────
  global.LLMChatWidget = { init, DEFAULTS };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})(window);
