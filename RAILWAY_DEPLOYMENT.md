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

EMAIL_USER=alphi.fidelino11@gmail.com
EMAIL_PASS=jsbuueebqdjjefef

SESSION_SECRET=akjwdbawhdoawhd2uheopi3qjranwdonawdhnqw9qu432hj542u5o13nj3p13u-91u5rpij1508u1h51l3hr98wefy024rhlkwf8792fy8o

NODE_ENV=production
PORT=3000
```

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

## 📧 Email Will Work!

Since Railway allows SMTP, your Gmail configuration will work perfectly:
- No need for SendGrid
- No need for API keys
- Just use your existing Gmail App Password

---

## 🔧 Troubleshooting

### If deployment fails:
1. Check **Logs** tab for errors
2. Make sure all environment variables are set
3. Verify MongoDB connection string

### If emails don't work:
1. Check that `EMAIL_USER` and `EMAIL_PASS` are set correctly
2. Make sure Gmail App Password is correct (no spaces)
3. Check Railway logs for email errors

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
