(() => {
  const toggle = document.getElementById('ai-chat-toggle');
  const box = document.getElementById('ai-chat-box');
  const closeBtn = document.getElementById('ai-chat-close');
  const input = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');
  const messages = document.getElementById('ai-chat-messages');
  const widget = document.getElementById('ai-chat-widget');
  const userId = widget?.dataset.userId || null;

  if (!toggle) return;

  toggle.addEventListener('click', () => box.classList.toggle('open'));
  closeBtn.addEventListener('click', () => box.classList.remove('open'));

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  sendBtn.addEventListener('click', sendMessage);

  function parseMarkdown(text) {
    // Escape HTML first
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Links: [label](url)
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Numbered list items: lines starting with "1. ", "2. ", etc.
    html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `ai-msg ${type}`;
    if (type === 'bot') {
      div.innerHTML = parseMarkdown(text);
    } else {
      div.textContent = text;
    }
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
    sendBtn.disabled = true;

    const typing = addMessage('Thinking...', 'bot typing');

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          userId: userId || undefined,
        })
      });
      
      const data = await res.json();
      typing.remove();

      if (res.ok) {
        addMessage(data.reply, 'bot');
      } else {
        addMessage(data.error || 'Something went wrong.', 'bot');
      }
    } catch (err) {
      typing.remove();
      addMessage('Could not reach the assistant. Try again later.', 'bot');
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }
})();
