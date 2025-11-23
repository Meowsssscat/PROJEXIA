# 📧 Gmail Email Setup Guide for Projexia

## ⚠️ Problema: Hindi Nag-send ng Email

Ang Gmail ay nag-block ng "less secure apps" kaya hindi gumagana ang regular password. Kailangan gumamit ng **App Password**.

---

## ✅ Solution: Gumawa ng Gmail App Password

### Step 1: Enable 2-Step Verification

1. **Pumunta sa** https://myaccount.google.com/security
2. **Login** sa Gmail account mo (`alphi.fidelino11@gmail.com`)
3. **Hanapin** ang "2-Step Verification"
4. **Click** "Get Started"
5. **Follow** ang instructions (verify phone number)
6. **Enable** 2-Step Verification

### Step 2: Generate App Password

1. **Bumalik sa** https://myaccount.google.com/security
2. **Hanapin** ang "App passwords" (nasa ilalim ng 2-Step Verification)
3. **Click** "App passwords"
4. **Select app**: Mail
5. **Select device**: Other (Custom name)
6. **Type**: "Projexia"
7. **Click** "Generate"
8. **Copy** ang 16-character password (example: `abcd efgh ijkl mnop`)

### Step 3: Update Render Environment Variables

1. **Pumunta sa** https://dashboard.render.com
2. **Click** ang projexia project
3. **Go to** "Environment" tab
4. **Find** `EMAIL_PASS`
5. **Update** with the new App Password (remove spaces):
   ```
   OLD: suchhrksopqkmtcj
   NEW: abcdefghijklmnop (your generated password)
   ```
6. **Click** "Save Changes"
7. **Wait** for automatic redeploy (1-2 minutes)

---

## 🧪 Test if Working

### Test 1: Sign Up
1. Go to your site
2. Click "Sign Up"
3. Fill in the form
4. Submit
5. **Check email** - dapat may OTP code

### Test 2: Forgot Password
1. Go to "Forgot Password"
2. Enter email
3. Submit
4. **Check email** - dapat may reset code

---

## 🔧 Alternative: Use Different Email Service

Kung ayaw mo gumamit ng Gmail App Password, pwede ka gumamit ng:

### Option 1: SendGrid (FREE)
- 100 emails/day free
- More reliable
- Professional

**Setup:**
```javascript
// Install
npm install @sendgrid/mail

// Update emailService.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  await sgMail.send({
    to,
    from: 'noreply@projexia.com',
    subject,
    html
  });
};
```

### Option 2: Mailgun (FREE)
- 5,000 emails/month free
- Very reliable

### Option 3: Resend (FREE)
- 3,000 emails/month free
- Modern and easy

---

## 📋 Quick Checklist

- [ ] 2-Step Verification enabled
- [ ] App Password generated
- [ ] `EMAIL_PASS` updated in Render
- [ ] Render redeployed
- [ ] Tested sign up email
- [ ] Tested forgot password email

---

## 🐛 Troubleshooting

### Issue 1: Still not sending
**Check:**
- App Password is correct (no spaces)
- `EMAIL_USER` is correct email
- Render environment variables saved
- App redeployed after changes

### Issue 2: "Invalid credentials"
**Solution:**
- Generate new App Password
- Make sure 2-Step Verification is ON
- Use the App Password, not regular password

### Issue 3: Email goes to spam
**Solution:**
- Check spam folder
- Mark as "Not Spam"
- Consider using SendGrid/Mailgun for production

### Issue 4: "Less secure app access"
**Solution:**
- Don't use "Less secure app access" (deprecated)
- Use App Password instead (more secure)

---

## 📊 Current Configuration

**Email Service:** Gmail (Nodemailer)
**From:** alphi.fidelino11@gmail.com
**Current Password Type:** Regular password (NOT WORKING)
**Needed:** App Password

---

## 🎯 Quick Fix Summary

```
1. Enable 2-Step Verification on Gmail
2. Generate App Password
3. Update EMAIL_PASS in Render
4. Wait for redeploy
5. Test!
```

**Time needed:** 5 minutes
**Difficulty:** Easy

---

## 💡 Pro Tip

Para sa production, mas maganda gumamit ng:
- **SendGrid** - Professional email service
- **Mailgun** - Reliable and scalable
- **Resend** - Modern and developer-friendly

Pero for now, **Gmail App Password** is okay! 👍

---

## 📞 Need Help?

Kung may problema pa rin:
1. Check Render logs
2. Verify App Password is correct
3. Test with different email address
4. Check Gmail security settings

---

**Good luck!** 🚀
