// Signup page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    Utils.initColorModeToggle();

    const signupForm = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullName');
    const programSelect = document.getElementById('program');
    const yearSelect = document.getElementById('year');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Form submission handler
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide previous messages
        Utils.hideMessage('errorMessage');
        Utils.hideMessage('successMessage');

        // Get form data
        const formData = {
            fullName: fullNameInput.value.trim(),
            program: programSelect.value,
            year: yearSelect.value,
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
            getApiUrl('SIGNUP'),
            'POST',
            formData
        );

        // Hide loading state
        Utils.hideLoading('submitBtn', 'loading');

        // Handle response
        if (result.success) {
            Utils.showSuccess('successMessage', result.data.message);

            // Store email for confirmation page
            Utils.setLocalStorage('verificationEmail', formData.email);

            // Redirect to confirmation page after 2 seconds
            setTimeout(() => {
                window.location.href = '/confirmation';
            }, 2000);
        } else {
            Utils.showError('errorMessage', result.data.message);
        }
    });

    // Real-time email validation
    emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        resetInputState(emailInput);

        if (email && !Utils.isValidLSPUEmail(email)) {
            setInputState(emailInput, 'error');
            Utils.showError('errorMessage', 'Please use your LSPU institutional email');
        } else {
            Utils.hideMessage('errorMessage');
        }
    });

    // Real-time password validation
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const validation = Utils.validatePassword(password);
        resetInputState(passwordInput);

        if (password.length > 0 && !validation.isValid) {
            setInputState(passwordInput, 'warning');
        } else if (validation.isValid) {
            setInputState(passwordInput, 'success');
        }
    });

    // Clear error messages when user starts typing
    [fullNameInput, programSelect, yearSelect, emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            Utils.hideMessage('errorMessage');
            resetInputState(input);
        });
    });

    [programSelect, yearSelect].forEach(select => {
        select.addEventListener('change', () => {
            Utils.hideMessage('errorMessage');
            resetInputState(select);
        });
    });
});

// Validate form data
function validateForm(data) {
    // Check if all fields are filled
    if (!data.fullName || !data.program || !data.year || !data.email || !data.password) {
        return 'All fields are required';
    }

    // Validate full name (at least 2 characters)
    if (data.fullName.length < 2) {
        return 'Full name must be at least 2 characters';
    }

    // Validate program
    if (!['BSIT', 'BSIS', 'BSCS'].includes(data.program)) {
        return 'Please select a valid program';
    }

    // Validate year
    if (!['1st', '2nd', '3rd', '4th'].includes(data.year)) {
        return 'Please select a valid year level';
    }

    // Validate email format
    if (!Utils.isValidEmail(data.email)) {
        return 'Invalid email format';
    }

    // Validate LSPU email
    if (!Utils.isValidLSPUEmail(data.email)) {
        return 'Please use your LSPU institutional email (@lspu.edu.ph)';
    }

    // Validate password
    const passwordValidation = Utils.validatePassword(data.password);
    if (!passwordValidation.isValid) {
        return passwordValidation.errors[0];
    }

    return null;
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