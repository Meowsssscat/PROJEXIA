// Confirmation page JavaScript

let attemptsRemaining = 3;
let userEmail = '';

document.addEventListener('DOMContentLoaded', () => {
    Utils.initColorModeToggle();

    const confirmationForm = document.getElementById('confirmationForm');
    const otpInput = document.getElementById('otp');
    const emailDisplay = document.getElementById('emailDisplay');
    const attemptsInfo = document.getElementById('attemptsInfo');

    // Get email from localStorage
    userEmail = Utils.getLocalStorage('verificationEmail');
    
    // If no email found, redirect to signup
    if (!userEmail) {
        window.location.href = '/signup';
        return;
    }

    // Display email
    emailDisplay.textContent = userEmail;

    // Form submission handler
    confirmationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide previous messages
        Utils.hideMessage('errorMessage');
        Utils.hideMessage('successMessage');

        const otp = otpInput.value.trim();

        // Client-side validation
        const validationError = validateOTP(otp);
        if (validationError) {
            Utils.showError('errorMessage', validationError);
            return;
        }

        // Show loading state
        Utils.showLoading('submitBtn', 'loading');

        // Make API request
        const result = await Utils.apiRequest(
            getApiUrl('VERIFY_OTP'),
            'POST',
            { email: userEmail, otp: otp }
        );

        // Hide loading state
        Utils.hideLoading('submitBtn', 'loading');

        // Handle response
        if (result.success) {
            Utils.showSuccess('successMessage', result.data.message);

            // Clear stored email
            Utils.removeLocalStorage('verificationEmail');

            // Redirect to sign in page after 2 seconds
            setTimeout(() => {
                window.location.href = '/signin?success=verified';
            }, 2000);
        } else {
            // Check if max attempts reached or OTP expired
            if (result.data.redirect || result.data.expired) {
                Utils.showError('errorMessage', result.data.message);

                // Clear stored email
                Utils.removeLocalStorage('verificationEmail');

                // Redirect to signup after 3 seconds
                setTimeout(() => {
                    window.location.href = '/signup';
                }, 3000);
            } else {
                // Wrong OTP, update attempts
                if (result.data.attemptsRemaining !== undefined) {
                    attemptsRemaining = result.data.attemptsRemaining;
                } else {
                    attemptsRemaining--;
                }
                
                updateAttemptsDisplay();
                Utils.showError('errorMessage', result.data.message);
                
                // Clear input
                otpInput.value = '';
                otpInput.focus();
            }
        }
    });

    // Auto-format OTP input (only allow numbers)
    otpInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        Utils.hideMessage('errorMessage');
    });

    // Auto-submit when 5 digits are entered
    otpInput.addEventListener('input', (e) => {
        if (e.target.value.length === 5) {
            // Small delay for better UX
            setTimeout(() => {
                confirmationForm.dispatchEvent(new Event('submit'));
            }, 300);
        }
    });

    // Focus on OTP input on page load
    otpInput.focus();
});

// Validate OTP
function validateOTP(otp) {
    if (!otp) {
        return 'Please enter the verification code';
    }

    if (otp.length !== 5) {
        return 'Verification code must be 5 digits';
    }

    if (!/^\d{5}$/.test(otp)) {
        return 'Verification code must contain only numbers';
    }

    return null;
}

// Update attempts display
function updateAttemptsDisplay() {
    const attemptsInfo = document.getElementById('attemptsInfo');
    
    attemptsInfo.classList.remove('status-label--warning', 'status-label--danger');

    const icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>`;

    if (attemptsRemaining === 0) {
        attemptsInfo.innerHTML = `${icon}<span>No attempts remaining</span>`;
        attemptsInfo.classList.add('status-label--danger');
    } else if (attemptsRemaining === 1) {
        attemptsInfo.innerHTML = `${icon}<span>1 attempt remaining</span>`;
        attemptsInfo.classList.add('status-label--danger');
    } else if (attemptsRemaining === 2) {
        attemptsInfo.innerHTML = `${icon}<span>2 attempts remaining</span>`;
        attemptsInfo.classList.add('status-label--warning');
    } else {
        attemptsInfo.innerHTML = `${icon}<span>${attemptsRemaining} attempts remaining</span>`;
    }
}