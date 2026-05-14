# ⚽ Football Night Tournament Management Web App

A premium, modern, and responsive web application for managing football tournaments. Built with React, Tailwind CSS, Framer Motion, and Firebase.

## 🚀 Features

- **Authentication**: Phone-based login for players and admins.
- **Player Dashboard**: Profile management, payment tracking, match fixtures, and results.
- **Jersey Voting**: Live voting system for tournament kits.
- **Admin Panel**: Full control over players, payments, matches, and finances.
- **Finance Tracking**: Income and expense management with visual analytics.
- **Responsive Design**: optimized for Mobile, Tablet, and Desktop.
- **Premium UI**: Glassmorphism, smooth animations, and dark-mode football aesthetics.

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS + Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State Management**: Zustand
- **Hosting**: Netlify / Firebase Hosting

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd football-tournament-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Authentication** (Email/Password).
4. Create a **Cloud Firestore** database.
5. Create a **Storage** bucket.
6. Copy your project settings and create a `.env` file based on `.env.example`.

### 4. Run Locally
```bash
npm run dev
```

## 🚀 Deployment

### Netlify (Recommended for Frontend)
1. Push your code to GitHub.
2. Connect your repo to Netlify.
3. Set the build command to `npm run build` and publish directory to `dist`.
4. Add your `.env` variables in Netlify UI.

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your project, build command (npm run build), and public directory (dist)
firebase deploy
```

## 🔒 Security Rules (Firestore)

Copy these rules into your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /jerseys/{jerseyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /votes/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /transactions/{id} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 📄 License
MIT
