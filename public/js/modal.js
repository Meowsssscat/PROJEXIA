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
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
    confirm: '?'
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

  // Make globally available
  window.Modal = Modal;
  window.showModal = showModal;

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalContainer);
  } else {
    initModalContainer();
  }
})();
