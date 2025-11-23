# 🚀 Projexia - Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

Ang project mo ay **READY NA** para i-deploy sa Vercel! Naka-setup na ang lahat ng configuration files.

## 📋 Mga Kailangan Bago Mag-Deploy

### 1. **Vercel Account**
- Gumawa ng account sa [vercel.com](https://vercel.com)
- I-connect ang GitHub account mo

### 2. **GitHub Repository**
- I-push ang project mo sa GitHub
- Make sure na-commit na lahat ng changes

### 3. **Environment Variables**
Kailangan mo i-set ang mga sumusunod sa Vercel Dashboard:

```
MONGODB_URI=mongodb+srv://PROJEXIA:diGKz0RyyjxGBdRQ@projexia.oo8nuhi.mongodb.net/?appName=PROJEXIA
EMAIL_USER=alphi.fidelino11@gmail.com
EMAIL_PASS=suchhrksopqkmtcj
SESSION_SECRET=akjwdbawhdoawhd2uheopi3qjranwdonawdhnqw9qu432hj542u5o13nj3p13u-91u5rpij1508u1h51l3hr98wefy024rhlkwf8792fy8o
PORT=3000
NODE_ENV=production
```

## 🔧 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Login sa Vercel**
   - Pumunta sa [vercel.com](https://vercel.com)
   - Click "Add New Project"

2. **Import Repository**
   - Piliin ang GitHub repository ng Projexia
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: npm install

4. **Add Environment Variables**
   - Click "Environment Variables"
   - I-add ang lahat ng variables sa taas
   - Make sure na-check ang "Production", "Preview", at "Development"

5. **Deploy**
   - Click "Deploy"
   - Maghintay ng 2-3 minutes
   - Done! 🎉

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts
# Set environment variables when asked
```

## ⚠️ Important Notes

### 1. **Cloudinary Configuration**
- Make sure ang Cloudinary account mo ay active
- Check kung may sufficient storage space

### 2. **MongoDB Atlas**
- I-whitelist ang IP address ng Vercel
- Sa MongoDB Atlas Dashboard:
  - Network Access → Add IP Address
  - Allow Access from Anywhere: `0.0.0.0/0`

### 3. **Email Service (Gmail)**
- Make sure naka-enable ang "Less secure app access" o gumamit ng App Password
- Para sa App Password:
  1. Google Account → Security
  2. 2-Step Verification (i-enable)
  3. App Passwords → Generate

### 4. **Socket.IO**
- Socket.IO ay gumagana sa Vercel pero may limitations
- Para sa production, consider using:
  - Vercel's Serverless Functions
  - O separate WebSocket service (Pusher, Ably)

### 5. **File Uploads**
- Ang `temp` at `uploads` folders ay temporary lang sa Vercel
- Lahat ng uploads ay naka-save sa Cloudinary (which is good!)

## 🔍 Post-Deployment Checks

After deployment, i-test ang mga sumusunod:

- [ ] Landing page loads correctly
- [ ] Sign up functionality
- [ ] Sign in functionality
- [ ] Email verification (OTP)
- [ ] Forgot password
- [ ] Upload project (with images)
- [ ] Like/Comment system
- [ ] Notifications
- [ ] Profile editing
- [ ] Settings page
- [ ] Dark mode toggle
- [ ] Footer contact form

## 🐛 Common Issues & Solutions

### Issue 1: "Module not found"
**Solution**: Make sure lahat ng dependencies ay naka-list sa `package.json`

### Issue 2: "Cannot connect to MongoDB"
**Solution**: 
- Check MongoDB Atlas IP whitelist
- Verify MONGODB_URI environment variable

### Issue 3: "Email not sending"
**Solution**:
- Check EMAIL_USER at EMAIL_PASS
- Verify Gmail App Password

### Issue 4: "Socket.IO not working"
**Solution**:
- Socket.IO may have limitations sa Vercel
- Consider alternative real-time solutions for production

### Issue 5: "Images not uploading"
**Solution**:
- Check Cloudinary credentials
- Verify cloudinaryConfig.js settings

## 📊 Monitoring

After deployment, monitor ang:
- **Vercel Dashboard**: Para sa deployment logs
- **MongoDB Atlas**: Para sa database metrics
- **Cloudinary**: Para sa storage usage
- **Gmail**: Para sa email sending limits

## 🔄 Updates & Redeployment

Para mag-update ng deployed app:

1. **Push changes sa GitHub**
   ```bash
   git add .
   git commit -m "Update message"
   git push origin main
   ```

2. **Automatic Deployment**
   - Vercel automatically deploys kapag may push sa main branch
   - Check Vercel Dashboard para sa deployment status

## 🎯 Production Recommendations

Para sa mas stable production environment:

1. **Use separate MongoDB cluster** para sa production
2. **Setup custom domain** sa Vercel
3. **Enable Vercel Analytics** para sa monitoring
4. **Setup error tracking** (Sentry, LogRocket)
5. **Consider Redis** para sa session storage
6. **Use dedicated WebSocket service** para sa real-time features

## 📞 Support

Kung may issues ka during deployment:
- Check Vercel deployment logs
- Review MongoDB Atlas logs
- Check browser console for errors
- Verify all environment variables

---

**Good luck sa deployment! 🚀**

Kung may tanong ka, just ask!
