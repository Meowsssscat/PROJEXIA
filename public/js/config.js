// Initialize color mode immediately (before page renders)
(function() {
    const savedMode = localStorage.getItem('colorMode') || 'light';
    document.documentElement.setAttribute('data-color-mode', savedMode);
})();

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000',
    ENDPOINTS: {
        SIGNUP: '/api/auth/signup',
        SIGNIN: '/api/auth/signin',
        VERIFY_OTP: '/api/auth/verify-otp'
    }
};

// Get full API URL
function getApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS[endpoint];
}

// Common utility functions
const Utils = {
    // Show error message
    showError: (elementId, message) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    },

    // Show success message
    showSuccess: (elementId, message) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    },

    // Hide message
    hideMessage: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    },

    // Show loading state
    showLoading: (buttonId, loadingId) => {
        const button = document.getElementById(buttonId);
        const loading = document.getElementById(loadingId);
        if (button) button.disabled = true;
        if (loading) loading.style.display = 'block';
    },

    // Hide loading state
    hideLoading: (buttonId, loadingId) => {
        const button = document.getElementById(buttonId);
        const loading = document.getElementById(loadingId);
        if (button) button.disabled = false;
        if (loading) loading.style.display = 'none';
    },

    // Validate email format
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate LSPU email
    isValidLSPUEmail: (email) => {
        return email.endsWith('@lspu.edu.ph');
    },

    // Validate password strength
    validatePassword: (password) => {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Store data in localStorage
    setLocalStorage: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('LocalStorage error:', error);
            return false;
        }
    },

    // Get data from localStorage
    getLocalStorage: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('LocalStorage error:', error);
            return null;
        }
    },

    // Remove data from localStorage
    removeLocalStorage: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('LocalStorage error:', error);
            return false;
        }
    },

    // Initialize color mode from localStorage
    initColorMode: () => {
        const savedMode = localStorage.getItem('colorMode') || 'light';
        document.documentElement.setAttribute('data-color-mode', savedMode);
    },

    // Toggle color mode
    toggleColorMode: () => {
        const currentMode = document.documentElement.getAttribute('data-color-mode') || 'light';
        const newMode = currentMode === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-color-mode', newMode);
        localStorage.setItem('colorMode', newMode);
        return newMode;
    },

    initColorModeToggle: () => {
        const toggle = document.getElementById('colorModeToggle');
        if (!toggle) return;

        const label = toggle.querySelector('.site-header__toggle-label');
        const updateLabel = (mode) => {
            if (label) {
                label.textContent = mode === 'dark'
                    ? 'Light Mode (Placeholder)'
                    : 'Dark Mode (Placeholder)';
            }
        };

        toggle.addEventListener('click', () => {
            const currentMode = toggle.getAttribute('data-mode') || 'light';
            const nextMode = currentMode === 'light' ? 'dark' : 'light';
            toggle.setAttribute('data-mode', nextMode);
            updateLabel(nextMode);
        });

        updateLabel(toggle.getAttribute('data-mode') || 'light');
    },

    // Make API request
    apiRequest: async (url, method = 'GET', data = null) => {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            const responseData = await response.json();

            return {
                success: response.ok,
                status: response.status,
                data: responseData
            };
        } catch (error) {
            console.error('API request error:', error);
            return {
                success: false,
                status: 0,
                data: { message: 'Network error. Please check your connection.' }
            };
        }
    }
};