document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const themeModeBtn = document.getElementById('themeModeBtn');
    const modeText = document.getElementById('modeText');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    
    const changePasswordModal = document.getElementById('changePasswordModal');
    const closeChangePasswordModal = document.getElementById('closeChangePasswordModal');
    const cancelChangePassword = document.getElementById('cancelChangePassword');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const deleteAccountForm = document.getElementById('deleteAccountForm');

    // ===============================
    // THEME MODE TOGGLE
    // ===============================
    if (themeModeBtn) {
        // Check current mode
        updateModeButton();

        themeModeBtn.addEventListener('click', () => {
            // Toggle color mode
            const currentMode = document.documentElement.getAttribute('data-color-mode') || 
                               localStorage.getItem('colorMode') || 
                               'light';
            const newMode = currentMode === 'dark' ? 'light' : 'dark';
            
            // Apply new mode
            document.documentElement.setAttribute('data-color-mode', newMode);
            localStorage.setItem('colorMode', newMode);
            
            // Update button
            updateModeButton();
        });
    }

    function updateModeButton() {
        const currentMode = document.documentElement.getAttribute('data-color-mode') || 
                           localStorage.getItem('colorMode') || 
                           'light';
        
        if (currentMode === 'dark') {
            modeText.textContent = 'Light Mode';
            themeModeBtn.querySelector('.mode-icon').innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            `;
        } else {
            modeText.textContent = 'Dark Mode';
            themeModeBtn.querySelector('.mode-icon').innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            `;
        }
    }

    // ===============================
    // CHANGE PASSWORD MODAL
    // ===============================
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            changePasswordModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Reinitialize password toggles for modal inputs
            if (typeof initPasswordToggles === 'function') {
                setTimeout(() => initPasswordToggles(), 100);
            }
        });
    }

    if (closeChangePasswordModal) {
        closeChangePasswordModal.addEventListener('click', closeChangePasswordModalFn);
    }

    if (cancelChangePassword) {
        cancelChangePassword.addEventListener('click', closeChangePasswordModalFn);
    }

    if (changePasswordModal) {
        changePasswordModal.addEventListener('click', (e) => {
            if (e.target === changePasswordModal) {
                closeChangePasswordModalFn();
            }
        });
    }

    function closeChangePasswordModalFn() {
        changePasswordModal.classList.remove('active');
        document.body.style.overflow = '';
        changePasswordForm.reset();
    }

    // ===============================
    // CHANGE PASSWORD FORM
    // ===============================
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPasswordChange').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (!currentPassword || !newPassword || !confirmNewPassword) {
                await Modal.alert('Please fill in all fields', 'warning');
                return;
            }

            if (newPassword.length < 8) {
                await Modal.alert('New password must be at least 8 characters long', 'warning');
                return;
            }

            if (newPassword !== confirmNewPassword) {
                await Modal.alert('New passwords do not match', 'error');
                return;
            }

            const submitBtn = changePasswordForm.querySelector('.btn-confirm-change');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Changing...';

            try {
                const response = await fetch('/forgot-password/change', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ currentPassword, newPassword })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    await Modal.alert('Password changed successfully!', 'success');
                    closeChangePasswordModalFn();
                } else {
                    await Modal.alert(data.error || 'Failed to change password', 'error');
                }
            } catch (error) {
                console.error('Error changing password:', error);
                await Modal.alert('Failed to change password. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Change Password';
            }
        });
    }

    // ===============================
    // DELETE ACCOUNT MODAL
    // ===============================
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            deleteModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', closeModal);
    }

    if (cancelDelete) {
        cancelDelete.addEventListener('click', closeModal);
    }

    // Close modal on outside click
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                closeModal();
            }
        });
    }

    function closeModal() {
        deleteModal.classList.remove('active');
        document.body.style.overflow = '';
        deleteAccountForm.reset();
    }

    // ===============================
    // DELETE ACCOUNT FORM
    // ===============================
    if (deleteAccountForm) {
        deleteAccountForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('confirmPassword').value;

            if (!password) {
                await Modal.alert('Please enter your password', 'warning');
                return;
            }

            const confirmDelete = await Modal.confirm(
                '⚠️ FINAL WARNING ⚠️\n\nThis will PERMANENTLY delete your account and ALL your data.\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?',
                'Delete Forever',
                'Cancel'
            );

            if (!confirmDelete) return;

            const submitBtn = deleteAccountForm.querySelector('.btn-confirm-delete');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Deleting...';

            try {
                const response = await fetch('/settings/delete-account', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    await Modal.alert('Your account has been deleted successfully.', 'success');
                    
                    // Clear local storage
                    localStorage.clear();
                    
                    // Redirect to signin
                    window.location.href = '/signin';
                } else {
                    await Modal.alert(data.error || 'Failed to delete account. Please try again.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Delete My Account';
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                await Modal.alert('Failed to delete account. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Delete My Account';
            }
        });
    }

    // ===============================
    // ESC KEY TO CLOSE MODALS
    // ===============================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (deleteModal.classList.contains('active')) {
                closeModal();
            }
            if (changePasswordModal.classList.contains('active')) {
                closeChangePasswordModalFn();
            }
        }
    });

    console.log('Settings page initialized');
});
