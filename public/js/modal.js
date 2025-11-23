/**
 * Global Modal Utility for PROJEXIA
 * Replaces all alert() and confirm() with professional modals
 */

const Modal = {
    
    /**
     * Show alert modal
     * @param {String} message - Message to display
     * @param {String} type - 'success', 'error', 'warning', 'info'
     */
    alert: function(message, type = 'info') {
        return new Promise((resolve) => {
            const modal = this.createAlertModal(message, type);
            document.body.appendChild(modal);
            
            setTimeout(() => modal.classList.add('active'), 10);
            
            const closeModal = () => {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                    resolve();
                }, 300);
            };
            
            modal.querySelector('.modal-btn-ok').addEventListener('click', closeModal);
            modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
            
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            });
        });
    },
    
    /**
     * Show confirm modal
     * @param {String} message - Message to display
     * @param {String} confirmText - Text for confirm button (default: 'Confirm')
     * @param {String} cancelText - Text for cancel button (default: 'Cancel')
     */
    confirm: function(message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            const modal = this.createConfirmModal(message, confirmText, cancelText);
            document.body.appendChild(modal);
            
            setTimeout(() => modal.classList.add('active'), 10);
            
            const closeModal = (result) => {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                    resolve(result);
                }, 300);
            };
            
            modal.querySelector('.modal-btn-confirm').addEventListener('click', () => closeModal(true));
            modal.querySelector('.modal-btn-cancel').addEventListener('click', () => closeModal(false));
            modal.querySelector('.modal-overlay').addEventListener('click', () => closeModal(false));
            
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closeModal(false);
                    document.removeEventListener('keydown', escHandler);
                }
            });
        });
    },
    
    /**
     * Create alert modal HTML
     */
    createAlertModal: function(message, type) {
        const modal = document.createElement('div');
        modal.className = 'global-modal';
        
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const colors = {
            success: '#28a745',
            error: '#c9362e',
            warning: '#ffc107',
            info: '#667eea'
        };
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-box">
                <div class="modal-icon modal-icon-${type}" style="background: ${colors[type]}">
                    ${icons[type]}
                </div>
                <div class="modal-message">${message}</div>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-ok" style="background: ${colors[type]}">OK</button>
                </div>
            </div>
        `;
        
        return modal;
    },
    
    /**
     * Create confirm modal HTML
     */
    createConfirmModal: function(message, confirmText, cancelText) {
        const modal = document.createElement('div');
        modal.className = 'global-modal';
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-box">
                <div class="modal-icon modal-icon-warning" style="background: #ffc107">
                    ?
                </div>
                <div class="modal-message">${message}</div>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-cancel">${cancelText}</button>
                    <button class="modal-btn modal-btn-confirm">${confirmText}</button>
                </div>
            </div>
        `;
        
        return modal;
    }
};

// Make Modal globally available
window.Modal = Modal;
