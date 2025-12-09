// Modern Modal System
// Provides unified modal/dialog, alert, confirm, prompt functionality

(function() {
  'use strict';

  // Modal types and configs
  const MODAL_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
    CONFIRM: 'confirm',
    PROMPT: 'prompt',
    CUSTOM: 'custom'
  };

  const ICON_TYPES = {
    success: SVGIcons?.getSuccess('32') || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error: SVGIcons?.getError('32') || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    info: SVGIcons?.getInfo('32') || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    warning: SVGIcons?.getWarning('32') || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    confirm: SVGIcons?.getWarning('32') || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
  };

  const ICON_COLORS = {
    success: '#10b981',    // Green
    error: '#ef4444',      // Red
    info: '#3b82f6',       // Blue
    warning: '#f59e0b',    // Amber
    confirm: '#f59e0b'     // Amber
  };

  // Global modal container
  let modalContainer = null;
  let currentModal = null;

  // Initialize modal container
  function initModalContainer() {
    if (modalContainer) return;

    modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 50000;
      display: none;
    `;
    document.body.appendChild(modalContainer);
  }

  // Create modal HTML structure
  function createModalElement(options) {
    const {
      type = MODAL_TYPES.INFO,
      title = '',
      message = '',
      icon = null,
      buttons = [],
      inputs = [],
      customContent = null,
      size = 'md' // sm, md, lg
    } = options;

    const sizeClass = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg'
    }[size] || 'max-w-md';

    const modal = document.createElement('div');
    modal.className = 'modern-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-dialog ${sizeClass}">
        <div class="modal-content">
          ${icon || type !== MODAL_TYPES.CUSTOM ? `
            <div class="modal-icon ${type}">
              ${icon || ICON_TYPES[type] || ''}
            </div>
          ` : ''}
          
          ${title ? `<h2 class="modal-title">${title}</h2>` : ''}
          
          ${message ? `<p class="modal-message">${escapeHtml(message)}</p>` : ''}
          
          ${customContent || ''}
          
          ${inputs.length > 0 ? `
            <div class="modal-inputs">
              ${inputs.map((input, i) => `
                <div class="modal-input-group">
                  ${input.label ? `<label class="modal-input-label">${input.label}</label>` : ''}
                  <input 
                    type="${input.type || 'text'}"
                    placeholder="${input.placeholder || ''}"
                    class="modal-input"
                    data-input-index="${i}"
                    ${input.value ? `value="${escapeHtml(input.value)}"` : ''}
                  />
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="modal-actions">
            ${buttons.map((btn, i) => `
              <button 
                class="modal-btn modal-btn-${btn.type || 'secondary'} ${btn.class || ''}"
                data-action="${i}"
              >
                ${btn.label || 'OK'}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    return modal;
  }

  // Show modal
  function showModal(options) {
    return new Promise((resolve) => {
      initModalContainer();

      const modal = createModalElement(options);
      currentModal = {
        element: modal,
        resolve,
        inputs: options.inputs || [],
        callbacks: options.buttons || []
      };

      modalContainer.innerHTML = '';
      modalContainer.appendChild(modal);
      modalContainer.style.display = 'flex';
      modalContainer.style.alignItems = 'center';
      modalContainer.style.justifyContent = 'center';

      // Trigger animation
      requestAnimationFrame(() => {
        modal.classList.add('active');
      });

      // Setup event listeners
      setupModalEvents(modal, resolve);
    });
  }

  // Setup modal event listeners
  function setupModalEvents(modal, resolve) {
    // Close on overlay click
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        closeModal(resolve, null);
      });
    }

    // Button clicks
    const buttons = modal.querySelectorAll('.modal-btn');
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const callback = currentModal.callbacks[index];
        const inputValues = getInputValues(modal);
        closeModal(resolve, {
          action: index,
          callback: callback,
          inputs: inputValues
        });
      });
    });

    // ESC key to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleEsc);
        closeModal(resolve, null);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Focus first input if present
    const firstInput = modal.querySelector('.modal-input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  // Get input values from modal
  function getInputValues(modal) {
    const inputs = modal.querySelectorAll('.modal-input');
    return Array.from(inputs).map(input => input.value);
  }

  // Close modal
  function closeModal(resolve, result) {
    if (!currentModal) return;

    const modal = currentModal.element;
    modal.classList.remove('active');

    setTimeout(() => {
      if (modalContainer) {
        modalContainer.style.display = 'none';
      }
      currentModal = null;
      resolve(result);
    }, 300);
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API
  const Modal = {
    // Show basic alert
    alert: async (message, title = 'Alert', type = 'info') => {
      return showModal({
        type,
        title,
        message,
        buttons: [{ label: 'OK', type: 'primary' }]
      });
    },

    // Show confirmation dialog
    confirm: async (message, title = 'Confirm', confirmText = 'Confirm', cancelText = 'Cancel') => {
      const result = await showModal({
        type: MODAL_TYPES.CONFIRM,
        title,
        message,
        buttons: [
          { label: cancelText, type: 'secondary' },
          { label: confirmText, type: 'primary' }
        ]
      });
      return result?.action === 1;
    },

    // Show success message
    success: async (message, title = 'Success') => {
      return showModal({
        type: MODAL_TYPES.SUCCESS,
        title,
        message,
        buttons: [{ label: 'OK', type: 'primary' }]
      });
    },

    // Show error message
    error: async (message, title = 'Error') => {
      return showModal({
        type: MODAL_TYPES.ERROR,
        title,
        message,
        buttons: [{ label: 'OK', type: 'primary' }]
      });
    },

    // Show warning message
    warning: async (message, title = 'Warning') => {
      return showModal({
        type: MODAL_TYPES.WARNING,
        title,
        message,
        buttons: [{ label: 'OK', type: 'primary' }]
      });
    },

    // Show info message
    info: async (message, title = 'Information') => {
      return showModal({
        type: MODAL_TYPES.INFO,
        title,
        message,
        buttons: [{ label: 'OK', type: 'primary' }]
      });
    },

    // Show prompt for user input
    prompt: async (message, title = 'Enter Value', defaultValue = '', inputType = 'text') => {
      const result = await showModal({
        type: MODAL_TYPES.PROMPT,
        title,
        message,
        inputs: [{ type: inputType, value: defaultValue }],
        buttons: [
          { label: 'Cancel', type: 'secondary' },
          { label: 'OK', type: 'primary' }
        ]
      });
      return result?.action === 1 ? result.inputs[0] : null;
    },

    // Show custom modal
    show: (options) => {
      return showModal(options);
    }
  };

  // ========================================
  // TOAST NOTIFICATION SYSTEM - MINIMALIST & PROFESSIONAL
  // ========================================
  let toastContainer = null;

  // Initialize toast container - Top Center
  function initToastContainer() {
    if (toastContainer) return;

    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      top: 5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 60000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
      width: auto;
      max-width: 90vw;
    `;
    document.body.appendChild(toastContainer);
  }

  // Create toast element - Minimalist Design
  function createToast(options) {
    const {
      type = 'info',
      message = '',
      duration = 3000,
      title = ''
    } = options;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconColor = ICON_COLORS[type] || ICON_COLORS.info;
    const icon = ICON_TYPES[type] || ICON_TYPES.info;
    
    // Minimalist styling
    toast.style.cssText = `
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 8px;
      padding: 0.75rem 1rem;
      min-width: 280px;
      max-width: 420px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
      pointer-events: auto;
      transform: translateY(-20px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      backdrop-filter: blur(8px);
    `;

    // Compact content
    const content = title 
      ? `<div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; color: hsl(var(--foreground)); font-size: 0.875rem; margin-bottom: 0.125rem;">${escapeHtml(title)}</div>
          <div style="color: hsl(var(--muted-foreground)); font-size: 0.8rem; line-height: 1.4;">${escapeHtml(message)}</div>
        </div>`
      : `<div style="flex: 1; min-width: 0; color: hsl(var(--foreground)); font-size: 0.875rem; line-height: 1.4;">${escapeHtml(message)}</div>`;

    toast.innerHTML = `
      <div style="
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        background: ${iconColor}20;
        color: ${iconColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        font-weight: 600;
        flex-shrink: 0;
      ">
        ${icon}
      </div>
      ${content}
      <button style="
        background: none;
        border: none;
        color: hsl(var(--muted-foreground));
        cursor: pointer;
        font-size: 1.125rem;
        line-height: 1;
        padding: 0.25rem;
        width: 1.25rem;
        height: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
        border-radius: 4px;
        opacity: 0.6;
      " class="toast-close" onmouseover="this.style.opacity='1'; this.style.background='hsl(var(--muted) / 0.3)'" onmouseout="this.style.opacity='0.6'; this.style.background='none'">×</button>
    `;

    return { toast, duration };
  }

  // Show toast notification - Slide down from top
  function showToast(options) {
    initToastContainer();

    const { toast, duration } = createToast(options);
    toastContainer.appendChild(toast);

    // Trigger slide down animation
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      removeToast(toast);
    });

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(toast);
      }, duration);
    }

    return toast;
  }

  // Remove toast - Slide up
  function removeToast(toast) {
    toast.style.transform = 'translateY(-20px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  // Toast API
  const Toast = {
    success: (message, title = 'Success', duration = 4000) => {
      return showToast({ type: 'success', message, title, duration });
    },

    error: (message, title = 'Error', duration = 5000) => {
      return showToast({ type: 'error', message, title, duration });
    },

    warning: (message, title = 'Warning', duration = 4000) => {
      return showToast({ type: 'warning', message, title, duration });
    },

    info: (message, title = 'Info', duration = 4000) => {
      return showToast({ type: 'info', message, title, duration });
    },

    show: (options) => {
      return showToast(options);
    }
  };

  // Make globally available
  window.Modal = Modal;
  window.showModal = showModal;
  window.Toast = Toast;

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initModalContainer();
      initToastContainer();
    });
  } else {
    initModalContainer();
    initToastContainer();
  }
})();
