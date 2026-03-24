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

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `ai-msg ${type}`;
    div.textContent = text;
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
          context: {
            projectId: widget?.dataset.projectId || undefined
          }
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
