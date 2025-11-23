document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const successMessage = document.getElementById('successMessage');
    
    const requestResetForm = document.getElementById('requestResetForm');
    const verifyCodeForm = document.getElementById('verifyCodeForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    
    const emailInput = document.getElementById('email');
    const otpInput = document.getElementById('otp');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    
    const resendCodeLink = document.getElementById('resendCode');
    const backToStep1Link = document.getElementById('backToStep1');
    
    let userEmail = '';
    let verifiedOTP = '';

    // ===============================
    // STEP 1: REQUEST RESET CODE
    // ===============================
    requestResetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email.endsWith('@lspu.edu.ph')) {
            await Modal.alert('Please use your LSPU institutional email', 'warning');
            return;
        }
        
        sendCodeBtn.disabled = true;
        sendCodeBtn.textContent = 'Sending...';
        
        try {
            const response = await fetch('/forgot-password/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                userEmail = email;
                showStep(2);
                await Modal.alert(data.message, 'success');
            } else {
                await Modal.alert(data.error || 'Failed to send code', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            await Modal.alert('Failed to send code. Please try again.', 'error');
        } finally {
            sendCodeBtn.disabled = false;
            sendCodeBtn.textContent = 'Send Verification Code';
        }
    });

    // ===============================
    // STEP 2: VERIFY CODE
    // ===============================
    verifyCodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const otp = otpInput.value.trim();
        
        if (otp.length !== 5) {
            await Modal.alert('Please enter a 5-digit code', 'warning');
            return;
        }
        
        verifyCodeBtn.disabled = true;
        verifyCodeBtn.textContent = 'Verifying...';
        
        try {
            const response = await fetch('/forgot-password/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: userEmail, otp })
            });
            
            const data = await response.json();
            
            if (response.ok && data.verified) {
                verifiedOTP = otp;
                showStep(3);
                await Modal.alert(data.message, 'success');
            } else {
                await Modal.alert(data.error || 'Invalid code', 'error');
                
                if (data.expired || data.maxAttempts) {
                    showStep(1);
                    otpInput.value = '';
                }
            }
        } catch (error) {
            console.error('Error:', error);
            await Modal.alert('Failed to verify code. Please try again.', 'error');
        } finally {
            verifyCodeBtn.disabled = false;
            verifyCodeBtn.textContent = 'Verify Code';
        }
    });

    // ===============================
    // STEP 3: RESET PASSWORD
    // ===============================
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (newPassword.length < 8) {
            await Modal.alert('Password must be at least 8 characters long', 'warning');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            await Modal.alert('Passwords do not match', 'error');
            return;
        }
        
        resetPasswordBtn.disabled = true;
        resetPasswordBtn.textContent = 'Resetting...';
        
        try {
            const response = await fetch('/forgot-password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: userEmail, 
                    otp: verifiedOTP,
                    newPassword 
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showStep('success');
            } else {
                await Modal.alert(data.error || 'Failed to reset password', 'error');
                
                if (data.expired) {
                    showStep(1);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            await Modal.alert('Failed to reset password. Please try again.', 'error');
        } finally {
            resetPasswordBtn.disabled = false;
            resetPasswordBtn.textContent = 'Reset Password';
        }
    });

    // ===============================
    // RESEND CODE
    // ===============================
    if (resendCodeLink) {
        resendCodeLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (!userEmail) return;
            
            try {
                const response = await fetch('/forgot-password/request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: userEmail })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    await Modal.alert('New code sent to your email!', 'success');
                    otpInput.value = '';
                } else {
                    await Modal.alert(data.error || 'Failed to resend code', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                await Modal.alert('Failed to resend code. Please try again.', 'error');
            }
        });
    }

    // ===============================
    // BACK TO STEP 1
    // ===============================
    if (backToStep1Link) {
        backToStep1Link.addEventListener('click', (e) => {
            e.preventDefault();
            showStep(1);
            otpInput.value = '';
        });
    }

    // ===============================
    // HELPER FUNCTIONS
    // ===============================
    function showStep(stepNumber) {
        step1.classList.remove('active');
        step2.classList.remove('active');
        step3.classList.remove('active');
        successMessage.classList.remove('active');
        
        if (stepNumber === 1) {
            step1.classList.add('active');
        } else if (stepNumber === 2) {
            step2.classList.add('active');
            otpInput.focus();
        } else if (stepNumber === 3) {
            step3.classList.add('active');
            newPasswordInput.focus();
        } else if (stepNumber === 'success') {
            successMessage.classList.add('active');
        }
    }

    // Auto-focus on OTP input when typing
    if (otpInput) {
        otpInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    console.log('Forgot Password page initialized');
});
