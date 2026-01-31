// FitSync Configuration Template
// IMPORTANT: This file contains placeholders. 
// DO NOT commit actual credentials to GitHub!

// For GitHub Pages deployment, we'll use a different approach:
// 1. Credentials will be loaded from a separate config-secrets.js file
// 2. That file will be .gitignored
// 3. Users create it locally with their credentials

const CONFIG = {
  // Firebase Configuration
  // Get from: Firebase Console > Project Settings > Your Apps
  firebase: {
    apiKey: window.FIREBASE_API_KEY || "",
    authDomain: window.FIREBASE_AUTH_DOMAIN || "",
    projectId: window.FIREBASE_PROJECT_ID || "",
    storageBucket: window.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: window.FIREBASE_APP_ID || ""
  },

  // Google Sheets Configuration
  sheets: {
    clientId: window.GOOGLE_CLIENT_ID || "",
    spreadsheetId: window.GOOGLE_SHEET_ID || "",
    // OAuth scopes needed
    scope: 'https://www.googleapis.com/auth/spreadsheets'
  },

  // Telegram Configuration (only for GitHub Actions, not exposed to frontend)
  telegram: {
    botUsername: "@fitsync_workout_bot"
  },

  // App Configuration
  app: {
    timezone: "Africa/Nairobi", // UTC+3
    alertTime: "20:00",
    githubPages: "https://wkabithi.github.io/workout-tracker"
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
