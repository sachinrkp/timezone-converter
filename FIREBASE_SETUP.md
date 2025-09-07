# 🔥 Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for free social login in your Utility Tools application.

## 🆓 **Why Firebase Auth?**

- **100% FREE** - Unlimited users, no cost
- **Multiple Providers** - Google, Facebook, GitHub, Twitter, etc.
- **Easy Setup** - Just a few configuration steps
- **Secure** - Google's enterprise-grade security
- **No Credit Card Required**

## 🚀 **Step 1: Create Firebase Project**

### 1. Go to Firebase Console
Visit [https://console.firebase.google.com](https://console.firebase.google.com)

### 2. Create New Project
1. Click **"Create a project"**
2. Enter project name: `utility-tools-auth` (or any name you prefer)
3. **Disable Google Analytics** (optional, saves resources)
4. Click **"Create project"**

### 3. Add Web App
1. Click **"Add app"** → **Web icon** (`</>`)
2. Enter app nickname: `utility-tools-web`
3. **Don't check** "Set up Firebase Hosting" (we're using Vercel)
4. Click **"Register app"**
5. **Copy the Firebase config** - you'll need this!

## 🔧 **Step 2: Enable Authentication**

### 1. Go to Authentication
1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**

### 2. Enable Sign-in Methods
1. Click **"Sign-in method"** tab
2. Enable the providers you want:

#### **Google (Recommended)**
1. Click **"Google"**
2. Toggle **"Enable"**
3. Enter **Project support email** (your email)
4. Click **"Save"**

#### **Facebook**
1. Click **"Facebook"**
2. Toggle **"Enable"**
3. You'll need Facebook App ID and Secret (optional for now)
4. Click **"Save"**

#### **GitHub**
1. Click **"GitHub"**
2. Toggle **"Enable"**
3. You'll need GitHub Client ID and Secret (optional for now)
4. Click **"Save"**

## 🔑 **Step 3: Configure Environment Variables**

### 1. Get Firebase Config
From the Firebase Console, copy your config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

### 2. Update Your .env File
Add these variables to your `.env` file:

```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyC...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef...
```

### 3. Update Frontend Config
Update `src/firebase/config.ts` with your actual config:

```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyC...",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef..."
};
```

## 🎯 **Step 4: Test the Setup**

### 1. Build and Start
```bash
npm run build
npm run dev
```

### 2. Test Authentication
1. Open `http://localhost:3000`
2. Click **"Sign In"** button
3. Try **"Continue with Google"** - should open popup
4. Complete Google sign-in
5. Check if user appears in Firebase Console → Authentication → Users

## 🔧 **Step 5: Optional - Add More Providers**

### Facebook Setup (Optional)
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create new app
3. Add Facebook Login product
4. Get App ID and App Secret
5. Add to Firebase Console → Authentication → Sign-in method → Facebook

### GitHub Setup (Optional)
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Get Client ID and Client Secret
4. Add to Firebase Console → Authentication → Sign-in method → GitHub

## 🚀 **Step 6: Deploy to Production**

### 1. Update Vercel Environment Variables
In your Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add all Firebase config variables:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

### 2. Update Authorized Domains
In Firebase Console → Authentication → Settings → Authorized domains:
1. Add your Vercel domain: `your-app.vercel.app`
2. Add localhost for development: `localhost`

## 🎉 **You're Done!**

Your Firebase Authentication is now set up with:
- ✅ **Google Sign-in** (working immediately)
- ✅ **Email/Password** authentication
- ✅ **User management** in Firebase Console
- ✅ **Secure JWT tokens** for your backend
- ✅ **Free unlimited users**

## 🧪 **Testing Checklist**

- [ ] Google sign-in works
- [ ] Email/password registration works
- [ ] Email/password login works
- [ ] User data syncs to your database
- [ ] Profile dropdown shows user info
- [ ] Logout works correctly
- [ ] Works on mobile devices

## 🆘 **Troubleshooting**

### Common Issues:

1. **"Firebase is not initialized"**
   - Check if Firebase config is correct
   - Verify environment variables are set

2. **"Sign-in popup was closed"**
   - User closed the popup - this is normal
   - Try again

3. **"This sign-in method is not enabled"**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable the provider you're trying to use

4. **"Network error"**
   - Check your internet connection
   - Verify Firebase project is active

### Getting Help:
- Check browser console for error messages
- Verify Firebase Console shows your project is active
- Make sure all environment variables are set correctly

---

**🎉 Congratulations!** You now have a professional authentication system with free social login!
