// Firebase configuration loaded dynamically from server
(function() {
  'use strict';
  
  // Set initial config to prevent Firebase initialization errors
  window.firebaseConfig = {
    apiKey: "demo-api-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo"
  };
  
  // Load actual config from server
  fetch('/api/config')
    .then(response => response.json())
    .then(config => {
      window.firebaseConfig = {
        apiKey: config.firebaseApiKey || "demo-api-key",
        authDomain: config.firebaseAuthDomain || "demo-project.firebaseapp.com",
        projectId: config.firebaseProjectId || "demo-project",
        storageBucket: config.firebaseStorageBucket || "demo-project.appspot.com",
        messagingSenderId: config.firebaseMessagingSenderId || "123456789",
        appId: config.firebaseAppId || "1:123456789:web:demo"
      };
      console.log('Firebase config loaded from server:', window.firebaseConfig);
    })
    .catch(error => {
      console.warn('Failed to load Firebase config from server:', error);
      console.log('Using fallback Firebase config');
    });
})();
