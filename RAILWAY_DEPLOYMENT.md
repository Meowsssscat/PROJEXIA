# 🚂 Deploy PROJEXIA to Railway.app

Railway is a better alternative to Render - it supports SMTP and is easier to use!

## ✅ Why Railway?
- ✅ **Allows SMTP connections** (Gmail will work!)
- ✅ **$5 free credit per month** (enough for small projects)
- ✅ **Automatic deployments from GitHub**
- ✅ **Faster than Render**
- ✅ **Better logging and debugging**

---

## 🚀 Step-by-Step Deployment

### 1. Create Railway Account
1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with **GitHub**

### 2. Deploy from GitHub
1. Click **"Deploy from GitHub repo"**
2. Select your **PROJEXIA** repository
3. Railway will automatically detect it's a Node.js app

### 3. Add Environment Variables
Click on your project → **Variables** tab → Add these:

```env
MONGODB_URI=mongodb+srv://PROJEXIA:diGKz0RyyjxGBdRQ@projexia.oo8nuhi.mongodb.net/?appName=PROJEXIA

SENDGRID_API_KEY=<your-sendgrid-api-key-from-env-file>

EMAIL_USER=alphi.fidelino11@gmail.com

SESSION_SECRET=akjwdbawhdoawhd2uheopi3qjranwdonawdhnqw9qu432hj542u5o13nj3p13u-91u5rpij1508u1h51l3hr98wefy024rhlkwf8792fy8o

NODE_ENV=production
PORT=3000
```

**Important**: 
- Get the `SENDGRID_API_KEY` value from your `.env` file
- Railway blocks SMTP (like Render), so we use SendGrid API instead
- SendGrid uses HTTPS, which works on all hosting platforms

### 4. Configure Build Settings (if needed)
Railway should auto-detect, but if not:
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 5. Generate Domain
1. Go to **Settings** tab
2. Click **"Generate Domain"**
3. You'll get a URL like: `projexia-production.up.railway.app`

### 6. Deploy!
Railway will automatically deploy. Watch the logs in the **Deployments** tab.

---

## 🎯 Advantages Over Render

| Feature | Railway | Render |
|---------|---------|--------|
| SMTP Support | ✅ Yes | ❌ Blocked |
| Free Tier | $5/month credit | 750 hours/month |
| Deploy Speed | ⚡ Fast | 🐌 Slow |
| Logs | 📊 Excellent | 📝 Basic |
| Setup | 🎯 Easy | 🤔 Complex |

---

## 📧 Email Configuration

**UPDATE**: Railway also blocks SMTP ports (like Render), so we use **SendGrid API** instead:
- ✅ Uses HTTPS (not blocked)
- ✅ Free tier: 100 emails/day
- ✅ More reliable than SMTP
- ✅ Already configured in the code

---

## 🔧 Troubleshooting

### ⚠️ "Connection timeout" on startup is NORMAL
Railway blocks SMTP verification on startup, but emails will work when actually sending. Ignore this error:
```
❌ Email config error: Connection timeout
```

### If deployment fails:
1. Check **Logs** tab for errors
2. Make sure all environment variables are set
3. Verify MongoDB connection string

### If emails don't work when testing:
1. **Check environment variables in Railway dashboard**:
   - Go to Variables tab
   - Make sure `EMAIL_USER` and `EMAIL_PASS` are there
   - No extra spaces in the values
2. **Verify Gmail App Password**:
   - Should be 16 characters: `jsbuueebqdjjefef`
   - No spaces or dashes
3. **Check Railway logs** when you try to send an email:
   - Look for "📧 Sending OTP" message
   - Check for actual error messages (not the startup timeout)

### If Railway also blocks SMTP:
If emails still don't work after testing, Railway might have changed their policy. In that case:
1. Use **Fly.io** instead (also free, allows SMTP)
2. Or switch to SendGrid API (requires adding SENDGRID_API_KEY)

---

## 💰 Free Tier Limits

Railway gives you **$5 free credit per month**, which includes:
- ~500 hours of runtime
- Enough for a small project with moderate traffic
- No credit card required to start

---

## 🎉 That's It!

Railway is much simpler than Render and actually supports SMTP. Your emails should work immediately! 🚀

Need help? Check Railway's docs: https://docs.railway.app
