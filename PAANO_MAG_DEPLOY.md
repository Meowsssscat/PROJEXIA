# 🚀 Paano Mag-Deploy ng Projexia sa Vercel

## ✅ READY NA ANG PROJECT MO!

Kumpleto na lahat ng files at configuration. Sundin lang ang steps na ito:

---

## 📝 STEP 1: I-push sa GitHub

Kung wala ka pang GitHub repository:

```bash
# Initialize git (kung hindi pa)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create repository sa GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/projexia.git
git branch -M main
git push -u origin main
```

Kung meron na:
```bash
git add .
git commit -m "Final updates before deployment"
git push origin main
```

---

## 🌐 STEP 2: Gumawa ng Vercel Account

1. Pumunta sa **https://vercel.com**
2. Click **"Sign Up"**
3. Piliin **"Continue with GitHub"**
4. I-authorize ang Vercel

---

## 🚀 STEP 3: I-deploy ang Project

### A. Sa Vercel Dashboard:

1. **Click "Add New Project"** (o "New Project")

2. **Import Repository**
   - Hanapin ang "projexia" repository
   - Click **"Import"**

3. **Configure Project Settings**
   ```
   Project Name: projexia (o kahit ano)
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave blank)
   Output Directory: (leave blank)
   Install Command: npm install
   ```

4. **Add Environment Variables** (IMPORTANTE!)
   
   Click **"Environment Variables"** tab, then i-add ang mga ito:

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | `mongodb+srv://PROJEXIA:diGKz0RyyjxGBdRQ@projexia.oo8nuhi.mongodb.net/?appName=PROJEXIA` |
   | `EMAIL_USER` | `alphi.fidelino11@gmail.com` |
   | `EMAIL_PASS` | `suchhrksopqkmtcj` |
   | `SESSION_SECRET` | `akjwdbawhdoawhd2uheopi3qjranwdonawdhnqw9qu432hj542u5o13nj3p13u-91u5rpij1508u1h51l3hr98wefy024rhlkwf8792fy8o` |
   | `NODE_ENV` | `production` |

   ⚠️ **IMPORTANTE**: I-check ang **Production**, **Preview**, at **Development** para sa bawat variable!

5. **Click "Deploy"**
   - Maghintay ng 2-3 minutes
   - Makikita mo ang progress sa screen

6. **DONE!** 🎉
   - Kapag natapos, makikita mo ang live URL
   - Example: `https://projexia.vercel.app`

---

## ⚙️ STEP 4: I-configure ang MongoDB Atlas

**IMPORTANTE**: Kailangan i-allow ang Vercel na mag-connect sa database mo.

1. Pumunta sa **https://cloud.mongodb.com**
2. Login sa account mo
3. Click **"Network Access"** (sa left sidebar)
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"**
6. I-type: `0.0.0.0/0`
7. Click **"Confirm"**

✅ Tapos na! Pwede na mag-connect ang Vercel sa MongoDB mo.

---

## 📧 STEP 5: I-setup ang Gmail App Password (Optional pero Recommended)

Para sa email notifications:

1. Pumunta sa **https://myaccount.google.com/security**
2. I-enable ang **"2-Step Verification"**
3. Pagkatapos, bumalik sa Security page
4. Hanapin ang **"App passwords"**
5. Click **"Generate"**
6. Piliin **"Mail"** at **"Other"**
7. I-type: "Projexia"
8. Click **"Generate"**
9. **Copy** ang 16-character password
10. I-update ang `EMAIL_PASS` sa Vercel Environment Variables

---

## 🎯 STEP 6: I-test ang Deployed Site

Bisitahin ang URL na binigay ng Vercel (e.g., `https://projexia.vercel.app`)

I-test ang mga ito:

- ✅ Landing page
- ✅ Sign up
- ✅ Email verification
- ✅ Sign in
- ✅ Upload project
- ✅ Like/Comment
- ✅ Notifications
- ✅ Settings
- ✅ Dark mode

---

## 🔄 Paano Mag-update ng Deployed Site?

Sobrang simple lang!

```bash
# 1. Gumawa ng changes sa code
# 2. Commit at push sa GitHub
git add .
git commit -m "Update: description ng changes"
git push origin main

# 3. AUTOMATIC NA! Vercel will auto-deploy
```

Vercel automatically mag-dedeploy kapag may bagong push sa GitHub. Walang kailangan gawin!

---

## 🐛 Common Problems at Solutions

### Problem 1: "Cannot connect to database"
**Solution**: 
- Check kung naka-whitelist ang `0.0.0.0/0` sa MongoDB Atlas
- Verify kung tama ang `MONGODB_URI` sa Vercel

### Problem 2: "Email not sending"
**Solution**:
- Use Gmail App Password instead of regular password
- Check kung tama ang `EMAIL_USER` at `EMAIL_PASS`

### Problem 3: "Images not uploading"
**Solution**:
- Check Cloudinary credentials sa `.env`
- Make sure may space pa sa Cloudinary account

### Problem 4: "Socket.IO notifications not working"
**Note**: Socket.IO may have limitations sa Vercel serverless environment. Pero basic functionality should work.

### Problem 5: "Build failed"
**Solution**:
- Check Vercel deployment logs
- Make sure lahat ng dependencies ay naka-list sa `package.json`
- Verify walang syntax errors

---

## 📊 Paano Mag-monitor ng Site?

### Vercel Dashboard
- Pumunta sa **https://vercel.com/dashboard**
- Click ang project mo
- Makikita mo:
  - Deployment history
  - Logs
  - Analytics
  - Performance metrics

### MongoDB Atlas
- Pumunta sa **https://cloud.mongodb.com**
- Check ang:
  - Database size
  - Number of connections
  - Query performance

### Cloudinary
- Pumunta sa **https://cloudinary.com/console**
- Check ang:
  - Storage usage
  - Bandwidth
  - Number of images

---

## 🎨 Bonus: Custom Domain (Optional)

Kung gusto mo ng sariling domain (e.g., `projexia.com`):

1. Bumili ng domain sa **Namecheap**, **GoDaddy**, o **Google Domains**
2. Sa Vercel Dashboard:
   - Click ang project
   - Go to **"Settings"** → **"Domains"**
   - Click **"Add"**
   - I-type ang domain mo
   - Follow ang instructions para sa DNS settings
3. Maghintay ng 24-48 hours para sa propagation

---

## 📞 Need Help?

Kung may problema ka:

1. **Check Vercel Logs**
   - Vercel Dashboard → Project → Deployments → Click deployment → View Logs

2. **Check Browser Console**
   - Press F12 sa browser
   - Tingnan ang Console tab para sa errors

3. **Check MongoDB Logs**
   - MongoDB Atlas → Monitoring → Logs

4. **Verify Environment Variables**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Make sure lahat ay tama at naka-check ang Production

---

## ✨ Tips para sa Production

1. **Use separate MongoDB database** para sa production at development
2. **Enable Vercel Analytics** para makita ang traffic
3. **Setup error monitoring** (Sentry, LogRocket)
4. **Regular backups** ng MongoDB database
5. **Monitor performance** regularly

---

## 🎉 Congratulations!

Kapag natapos mo lahat ng steps, **LIVE NA** ang Projexia mo sa internet! 🚀

Share mo na sa friends mo ang link! 🎊

---

**Questions?** Just ask! 😊
