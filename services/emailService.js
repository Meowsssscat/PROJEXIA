const nodemailer = require('nodemailer');

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email config error:', error.message);
  } else {
    console.log('✅ Email service ready (Gmail SMTP)');
  }
});

// Generate 5-digit OTP
const generateOTP = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
  console.log('📧 Sending OTP:', otp, 'to:', email);
  
  const mailOptions = {
    from: {
      name: 'PROJEXIA',
      address: process.env.EMAIL_USER
    },
    to: email,
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #141414; 
            background: #f2f1ed;
            padding: 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #c9362e 0%, #d0312d 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .logo { 
            font-size: 2.5rem; 
            font-weight: 700; 
            margin-bottom: 10px;
            letter-spacing: -0.5px;
          }
          .tagline { 
            font-size: 0.95rem; 
            opacity: 0.95;
            margin: 0;
          }
          .content { 
            padding: 40px 30px;
          }
          .title {
            color: #c9362e;
            font-size: 1.8rem;
            margin-bottom: 20px;
            font-weight: 600;
          }
          .message {
            color: #141414;
            font-size: 1rem;
            margin-bottom: 30px;
          }
          .otp-box { 
            background: #f2f1ed;
            padding: 25px; 
            text-align: center; 
            font-size: 42px; 
            font-weight: 700; 
            letter-spacing: 12px; 
            margin: 30px 0; 
            border: 3px solid #c9362e; 
            border-radius: 12px; 
            color: #c9362e;
          }
          .info-box { 
            background: #fff3cd; 
            border-left: 4px solid #f08c41; 
            padding: 20px; 
            margin: 25px 0;
            border-radius: 8px;
          }
          .info-box strong {
            color: #141414;
            display: block;
            margin-bottom: 10px;
            font-size: 1.05rem;
          }
          .info-box ul {
            margin: 10px 0 0 0;
            padding-left: 20px;
            color: #141414;
          }
          .info-box li {
            margin: 8px 0;
          }
          .footer { 
            background: #f2f1ed;
            text-align: center; 
            padding: 30px;
            color: #8d8f8c; 
            font-size: 0.9rem;
          }
          .footer-title {
            color: #141414;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .footer-copy {
            margin-top: 10px;
            font-size: 0.85rem;
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
            <h2 class="title">✉️ Email Verification</h2>
            <p class="message">Thank you for signing up! Please use the following verification code to complete your registration:</p>
            
            <div class="otp-box">${otp}</div>
            
            <div class="info-box">
              <strong>⚠️ Important Information:</strong>
              <ul>
                <li>This code will expire in <strong>10 minutes</strong></li>
                <li>You have <strong>3 attempts</strong> to enter the correct code</li>
                <li>Do not share this code with anyone</li>
              </ul>
            </div>
            
            <p class="message">If you didn't request this code, please ignore this email and your account will remain secure.</p>
          </div>
          <div class="footer">
            <p class="footer-title">PROJEXIA</p>
            <p>Project Showcase Platform for CCS Students</p>
            <p class="footer-copy">&copy; ${new Date().getFullYear()} LSPU College of Computer Studies. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `PROJEXIA - Email Verification\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\nYou have 3 attempts to enter the correct code.\n\nIf you didn't request this code, please ignore this email.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, otp) => {
  console.log('📧 Sending Password Reset OTP:', otp, 'to:', email);
  
  const mailOptions = {
    from: {
      name: 'PROJEXIA',
      address: process.env.EMAIL_USER
    },
    to: email,
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #141414; 
            background: #f2f1ed;
            padding: 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #c9362e 0%, #d0312d 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .logo { 
            font-size: 2.5rem; 
            font-weight: 700; 
            margin-bottom: 10px;
            letter-spacing: -0.5px;
          }
          .tagline { 
            font-size: 0.95rem; 
            opacity: 0.95;
            margin: 0;
          }
          .content { 
            padding: 40px 30px;
          }
          .title {
            color: #c9362e;
            font-size: 1.8rem;
            margin-bottom: 20px;
            font-weight: 600;
          }
          .message {
            color: #141414;
            font-size: 1rem;
            margin-bottom: 30px;
          }
          .otp-box { 
            background: #f2f1ed;
            padding: 25px; 
            text-align: center; 
            font-size: 42px; 
            font-weight: 700; 
            letter-spacing: 12px; 
            margin: 30px 0; 
            border: 3px solid #c9362e; 
            border-radius: 12px; 
            color: #c9362e;
          }
          .info-box { 
            background: #fff3cd; 
            border-left: 4px solid #f08c41; 
            padding: 20px; 
            margin: 25px 0;
            border-radius: 8px;
          }
          .info-box strong {
            color: #141414;
            display: block;
            margin-bottom: 10px;
            font-size: 1.05rem;
          }
          .info-box ul {
            margin: 10px 0 0 0;
            padding-left: 20px;
            color: #141414;
          }
          .info-box li {
            margin: 8px 0;
          }
          .security-box {
            background: rgba(201, 54, 46, 0.1);
            border-left: 4px solid #c9362e;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
          }
          .security-box strong {
            color: #c9362e;
            display: block;
            margin-bottom: 10px;
            font-size: 1.05rem;
          }
          .security-box p {
            color: #141414;
            margin: 0;
          }
          .footer { 
            background: #f2f1ed;
            text-align: center; 
            padding: 30px;
            color: #8d8f8c; 
            font-size: 0.9rem;
          }
          .footer-title {
            color: #141414;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .footer-copy {
            margin-top: 10px;
            font-size: 0.85rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔒 PROJEXIA</div>
            <p class="tagline">Password Reset Request</p>
          </div>
          <div class="content">
            <h2 class="title">Reset Your Password</h2>
            <p class="message">We received a request to reset your password. Use the following verification code to proceed:</p>
            
            <div class="otp-box">${otp}</div>
            
            <div class="info-box">
              <strong>⚠️ Important Information:</strong>
              <ul>
                <li>This code will expire in <strong>10 minutes</strong></li>
                <li>You have <strong>3 attempts</strong> to enter the correct code</li>
                <li>Do not share this code with anyone</li>
              </ul>
            </div>
            
            <div class="security-box">
              <strong>🔐 Security Notice</strong>
              <p>If you didn't request a password reset, please ignore this email and ensure your account is secure. Your password will not be changed unless you complete the reset process.</p>
            </div>
          </div>
          <div class="footer">
            <p class="footer-title">PROJEXIA</p>
            <p>Project Showcase Platform for CCS Students</p>
            <p class="footer-copy">&copy; ${new Date().getFullYear()} LSPU College of Computer Studies. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `PROJEXIA - Password Reset\n\nYour password reset code is: ${otp}\n\nThis code will expire in 10 minutes.\nYou have 3 attempts to enter the correct code.\n\nIf you didn't request a password reset, please ignore this email.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Verify email config
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service verified');
    return true;
  } catch (error) {
    console.error('⚠️ Email verification failed:', error.message);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
  verifyEmailConfig
};
