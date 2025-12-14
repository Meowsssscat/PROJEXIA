const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid API initialized');
} else {
  console.warn('⚠️ SENDGRID_API_KEY not found - emails will not work!');
}

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email via SendGrid
const sendOTPEmail = async (email, otp) => {
  console.log('📧 Sending OTP via SendGrid:', otp, 'to:', email);
  console.log(otp);
  
  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_USER || 'alphi.fidelino11@gmail.com',
      name: 'PROJEXIA'
    },
    subject: 'PROJEXIA - Email Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #f5f5f5;
            padding: 20px;
          }
          .container { 
            max-width: 500px; 
            margin: 0 auto; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e0e0e0;
          }
          .header { 
            background: white;
            padding: 30px 30px 20px; 
            border-bottom: 1px solid #e0e0e0;
          }
          .logo { 
            font-size: 1.5rem; 
            font-weight: 600; 
            color: #333;
            margin-bottom: 5px;
          }
          .tagline { 
            font-size: 0.85rem; 
            color: #666;
          }
          .content { 
            padding: 30px;
          }
          .title {
            color: #333;
            font-size: 1.25rem;
            margin-bottom: 15px;
            font-weight: 600;
          }
          .message {
            color: #555;
            font-size: 0.95rem;
            margin-bottom: 20px;
          }
          .otp-box { 
            background: #f9f9f9;
            padding: 20px; 
            text-align: center; 
            font-size: 32px; 
            font-weight: 600; 
            letter-spacing: 8px; 
            margin: 25px 0; 
            border: 2px solid #e0e0e0; 
            border-radius: 6px; 
            color: #333;
          }
          .info-text { 
            background: #f9f9f9; 
            padding: 15px; 
            margin: 20px 0;
            border-radius: 8px;
            font-size: 0.85rem;
            color: #666;
            line-height: 1.5;
            border: 1px solid #e8e8e8;
          }
          .footer { 
            background: #f9f9f9;
            text-align: center; 
            padding: 20px;
            color: #999; 
            font-size: 0.8rem;
            border-top: 1px solid #e0e0e0;
          }
          .footer-title {
            color: #666;
            font-weight: 600;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PROJEXIA</div>
            <p class="tagline">College of Computer Studies</p>
          </div>
          <div class="content">
            <h2 class="title">Email Verification</h2>
            <p class="message">Thank you for signing up. Please use the following code to verify your email:</p>
            
            <div class="otp-box">${otp}</div>
            
            <div class="info-text">
              This code will expire in 10 minutes. You have 3 attempts to enter the correct code. Do not share this code with anyone.
            </div>
            
            <p class="message">If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p class="footer-title">PROJEXIA</p>
            <p>Project Showcase Platform for CCS Students</p>
            <p>&copy; ${new Date().getFullYear()} LSPU College of Computer Studies</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `PROJEXIA - Email Verification\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\nYou have 3 attempts to enter the correct code.\n\nIf you didn't request this code, please ignore this email.`
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ OTP sent successfully to ${email} via SendGrid`);
    return true;
  } catch (error) {
    console.error('❌ SendGrid error:', error.message);
    if (error.response) {
      console.error('SendGrid response:', error.response.body);
    }
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Send Password Reset Email via SendGrid
const sendPasswordResetEmail = async (email, otp) => {
  console.log('📧 Sending Password Reset OTP via SendGrid:', otp, 'to:', email);
  
  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_USER || 'alphi.fidelino11@gmail.com',
      name: 'PROJEXIA'
    },
    subject: 'PROJEXIA - Password Reset Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #f5f5f5;
            padding: 20px;
          }
          .container { 
            max-width: 500px; 
            margin: 0 auto; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e0e0e0;
          }
          .header { 
            background: white;
            padding: 30px 30px 20px; 
            border-bottom: 1px solid #e0e0e0;
          }
          .logo { 
            font-size: 1.5rem; 
            font-weight: 600; 
            color: #333;
            margin-bottom: 5px;
          }
          .tagline { 
            font-size: 0.85rem; 
            color: #666;
          }
          .content { 
            padding: 30px;
          }
          .title {
            color: #333;
            font-size: 1.25rem;
            margin-bottom: 15px;
            font-weight: 600;
          }
          .message {
            color: #555;
            font-size: 0.95rem;
            margin-bottom: 20px;
          }
          .otp-box { 
            background: #f9f9f9;
            padding: 20px; 
            text-align: center; 
            font-size: 32px; 
            font-weight: 600; 
            letter-spacing: 8px; 
            margin: 25px 0; 
            border: 2px solid #e0e0e0; 
            border-radius: 6px; 
            color: #333;
          }
          .info-text { 
            background: #f9f9f9; 
            padding: 15px; 
            margin: 20px 0;
            border-radius: 8px;
            font-size: 0.85rem;
            color: #666;
            line-height: 1.5;
            border: 1px solid #e8e8e8;
          }
          .security-text {
            background: #fff9f0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 0.85rem;
            color: #666;
            line-height: 1.5;
            border: 1px solid #ffe4b3;
          }
          .footer { 
            background: #f9f9f9;
            text-align: center; 
            padding: 20px;
            color: #999; 
            font-size: 0.8rem;
            border-top: 1px solid #e0e0e0;
          }
          .footer-title {
            color: #666;
            font-weight: 600;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PROJEXIA</div>
            <p class="tagline">Password Reset Request</p>
          </div>
          <div class="content">
            <h2 class="title">Reset Your Password</h2>
            <p class="message">We received a request to reset your password. Use the following code to proceed:</p>
            
            <div class="otp-box">${otp}</div>
            
            <div class="info-text">
              This code will expire in 10 minutes. You have 3 attempts to enter the correct code. Do not share this code with anyone.
            </div>
            
            <div class="security-text">
              <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will not be changed unless you complete the reset process.
            </div>
          </div>
          <div class="footer">
            <p class="footer-title">PROJEXIA</p>
            <p>Project Showcase Platform for CCS Students</p>
            <p>&copy; ${new Date().getFullYear()} LSPU College of Computer Studies</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `PROJEXIA - Password Reset\n\nYour password reset code is: ${otp}\n\nThis code will expire in 10 minutes.\nYou have 3 attempts to enter the correct code.\n\nIf you didn't request a password reset, please ignore this email.`
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Password reset OTP sent successfully to ${email} via SendGrid`);
    return true;
  } catch (error) {
    console.error('❌ SendGrid error:', error.message);
    if (error.response) {
      console.error('SendGrid response:', error.response.body);
    }
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Verify SendGrid configuration
const verifyEmailConfig = async () => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('⚠️ SENDGRID_API_KEY is not configured!');
    return false;
  }
  console.log('✅ SendGrid is configured');
  return true;
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
  verifyEmailConfig
};
