# Firebase Setup for Vercel Deployment

## Quick Setup Guide

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `utility-tools` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider:
   - Click on "Google"
   - Toggle "Enable"
   - Add your project support email
   - Click "Save"
5. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" for both options
   - Click "Save"

### Step 3: Get Firebase Configuration
1. Go to "Project Settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web" (</> icon)
4. Register your app with a nickname like "utility-tools-web"
5. Copy the Firebase configuration object

### Step 4: Update Firebase Config
Replace the placeholder values in `src/firebase/config.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

### Step 5: Configure Authorized Domains
1. In Firebase Console, go to "Authentication" > "Settings" > "Authorized domains"
2. Add your Vercel domain: `your-app-name.vercel.app`
3. Add `localhost` for local development

### Step 6: Deploy to Vercel
1. Commit your changes:
   ```bash
   git add .
   git commit -m "Configure Firebase for Vercel deployment"
   git push origin main
   ```

2. Vercel will automatically redeploy with the new configuration

## Alternative: Using Environment Variables

If you prefer to use environment variables (more secure):

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

### Update config.ts to use environment variables:
```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-fallback-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef..."
};
```

## Testing
After deployment:
1. Visit your Vercel URL
2. Try signing in with Google
3. Check browser console for any errors
4. Verify that authentication works properly

## Troubleshooting
- **"Authentication failed"**: Check if Firebase config is correct
- **"Domain not authorized"**: Add your Vercel domain to Firebase authorized domains
- **"Invalid API key"**: Verify the API key in Firebase config
- **CORS errors**: Ensure your domain is added to Firebase authorized domains
