// Firebase configuration loaded dynamically from server
window.firebaseConfig = null;

// Load Firebase config from server
async function loadFirebaseConfig() {
  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    
    window.firebaseConfig = {
      apiKey: config.firebaseApiKey || "demo-api-key",
      authDomain: config.firebaseAuthDomain || "demo-project.firebaseapp.com",
      projectId: config.firebaseProjectId || "demo-project",
      storageBucket: config.firebaseStorageBucket || "demo-project.appspot.com",
      messagingSenderId: config.firebaseMessagingSenderId || "123456789",
      appId: config.firebaseAppId || "1:123456789:web:demo"
    };
    
    console.log('Firebase config loaded:', window.firebaseConfig);
  } catch (error) {
    console.warn('Failed to load Firebase config:', error);
    window.firebaseConfig = {
      apiKey: "demo-api-key",
      authDomain: "demo-project.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:demo"
    };
  }
}

// Load config immediately
loadFirebaseConfig();
