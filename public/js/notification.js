// Enhanced Notification System
// Provides toast-like notifications with auto-dismiss and animation

(function() {
  'use strict';

  const NOTIFICATION_CONFIG = {
    duration: 4000, // Auto-dismiss after 4 seconds
    position: 'top-right', // top-right, top-left, bottom-right, bottom-left
    maxStack: 5
  };

  let notificationStack = [];

  // Create notification element
  function createNotification(type, title, message, options = {}) {
    const {
      duration = NOTIFICATION_CONFIG.duration,
      icon = null,
      action = null
    } = options;

    const notification = document.createElement('div');
    notification.className = `notification-modal ${type}`;

    const iconSymbols = {
      success: SVGIcons?.getSuccess('24') || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      error: SVGIcons?.getError('24') || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning: SVGIcons?.getWarning('24') || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: SVGIcons?.getInfo('24') || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    notification.innerHTML = `
      <div class="notification-modal-content">
        <div class="notification-modal-icon">
          ${icon || iconSymbols[type] || '?'}
        </div>
        <div class="notification-modal-body">
          ${title ? `<div class="notification-modal-title">${escapeHtml(title)}</div>` : ''}
          ${message ? `<p class="notification-modal-message">${escapeHtml(message)}</p>` : ''}
        </div>
        <button class="notification-modal-close" aria-label="Close notification">
          ×
        </button>
      </div>
    `;

    // Close button handler
    const closeBtn = notification.querySelector('.notification-modal-close');
    closeBtn.addEventListener('click', () => dismissNotification(notification));

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => dismissNotification(notification), duration);
    }

    return notification;
  }

  // Show notification
  function showNotification(type, title, message, options = {}) {
    // Limit stack size
    if (notificationStack.length >= NOTIFICATION_CONFIG.maxStack) {
      const oldest = notificationStack.shift();
      oldest.remove();
    }

    const notification = createNotification(type, title, message, options);
    document.body.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.style.animation = 'slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });

    notificationStack.push(notification);
    return notification;
  }

  // Dismiss notification
  function dismissNotification(notification) {
    notification.style.animation = 'slideOutRight 0.3s ease forwards';
    
    setTimeout(() => {
      notification.remove();
      notificationStack = notificationStack.filter(n => n !== notification);
    }, 300);
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API
  const Notification = {
    success: (title, message, options) => showNotification('success', title, message, options),
    error: (title, message, options) => showNotification('error', title, message, options),
    warning: (title, message, options) => showNotification('warning', title, message, options),
    info: (title, message, options) => showNotification('info', title, message, options),
    show: showNotification,
    dismissAll: () => {
      notificationStack.forEach(n => dismissNotification(n));
      notificationStack = [];
    }
  };

  // Make globally available
  window.Notification = Notification;
  window.showNotification = showNotification;
  window.dismissNotification = dismissNotification;
})();
