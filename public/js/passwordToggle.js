// Password Toggle Utility
// Automatically adds show/hide password functionality to all password inputs

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggles();
});

function initPasswordToggles() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        // Skip if already has toggle
        if (input.parentElement.classList.contains('password-wrapper')) {
            return;
        }
        
        // Wrap input in a container
        const wrapper = document.createElement('div');
        wrapper.className = 'password-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle';
        toggleBtn.setAttribute('aria-label', 'Show password');
        toggleBtn.innerHTML = `
            <svg class="eye-icon eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <svg class="eye-icon eye-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
        
        wrapper.appendChild(toggleBtn);
        
        // Toggle functionality
        toggleBtn.addEventListener('click', () => {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            
            const eyeOff = toggleBtn.querySelector('.eye-off');
            const eyeOn = toggleBtn.querySelector('.eye-on');
            
            if (isPassword) {
                eyeOff.style.display = 'none';
                eyeOn.style.display = 'block';
                toggleBtn.setAttribute('aria-label', 'Hide password');
            } else {
                eyeOff.style.display = 'block';
                eyeOn.style.display = 'none';
                toggleBtn.setAttribute('aria-label', 'Show password');
            }
        });
    });
}

// Export for use in dynamic forms
if (typeof window !== 'undefined') {
    window.initPasswordToggles = initPasswordToggles;
}
