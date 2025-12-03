// Signin page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    Utils.initColorModeToggle();

    const signinForm = document.getElementById('signinForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Check for success message from URL (after verification)
    checkForSuccessMessage();

    // Form submission handler
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide previous messages
        Utils.hideMessage('errorMessage');
        Utils.hideMessage('successMessage');

        // Get form data
        const formData = {
            email: emailInput.value.trim().toLowerCase(),
            password: passwordInput.value
        };

        // Client-side validation
        const validationError = validateForm(formData);
        if (validationError) {
            Utils.showError('errorMessage', validationError);
            return;
        }

        // Show loading state
        Utils.showLoading('submitBtn', 'loading');

        // Make API request
        const result = await Utils.apiRequest(
            getApiUrl('SIGNIN'),
            'POST',
            formData
        );

        // Hide loading state
        Utils.hideLoading('submitBtn', 'loading');

        // Handle response
        if (result.success) {
            Utils.showSuccess('successMessage', result.data.message);

            // Store user data
            Utils.setLocalStorage('user', result.data.user);
            Utils.setLocalStorage('isAuthenticated', true);

            // Redirect to home page after 1 second
            setTimeout(() => {
                window.location.href = '/browse';
            }, 1000);
        } else {
            Utils.showError('errorMessage', result.data.message);
        }
    });

    // Clear error messages when user starts typing
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            Utils.hideMessage('errorMessage');
        });
    });

    // Real-time email validation
    emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        resetInputState(emailInput);

        if (email && !Utils.isValidEmail(email)) {
            setInputState(emailInput, 'error');
        }
    });
});

// Validate form data
function validateForm(data) {
    // Check if all fields are filled
    if (!data.email || !data.password) {
        return 'Email and password are required';
    }

    // Validate email format
    if (!Utils.isValidEmail(data.email)) {
        return 'Invalid email format';
    }

    return null;
}

// Check for success message from URL parameters
function checkForSuccessMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    
    if (success === 'verified') {
        Utils.showSuccess('successMessage', 'Account verified successfully! Please sign in.');
        
        // Clean URL (remove query parameters)
        if (window.history.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
}

function setInputState(element, state) {
    resetInputState(element);
    if (state) {
        element.classList.add(`input--${state}`);
    }
}

function resetInputState(element) {
    element.classList.remove('input--error', 'input--warning', 'input--success');
}