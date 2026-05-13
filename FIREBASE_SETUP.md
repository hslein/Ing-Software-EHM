# Firebase Setup Guide

This guide walks you through setting up Firebase for the EHM Vehicles application with authentication, Firestore database, and hosting.

## Prerequisites

- Node.js and npm installed
- Firebase CLI installed: `npm install -g firebase-tools`
- A Google Firebase account

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Name it "ehm-vehicles"
4. Accept the terms and create the project

## Step 2: Set Up Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Select **Email/Password** as a sign-in method
4. Enable it and save

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Cloud Firestore**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your region (closest to your users)
5. Create the database

### Create Collections

#### Brands Collection:
1. Create a new collection named `brands`
2. Add documents with this structure:
```json
{
  "name": "Mazda",
  "image": "https://...",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### Vehicles Collection:
1. Create a new collection named `vehicles`
2. Add documents with this structure:
```json
{
  "model": "CX-90",
  "type": "suv",
  "brand": "Mazda",
  "image": "https://...",
  "description": "...",
  "year": 2025,
  "price": 30000,
  "mileage": 0,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

## Step 4: Deploy Firestore Rules

1. From the project root, run:
```bash
firebase login
firebase deploy --only firestore:rules
```

## Step 5: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings**
2. Scroll to "Your apps" section
3. Click the web app icon (</> icon)
4. Copy the Firebase config object

## Step 6: Set Up Environment Variables

1. Create a `.env.local` file in `apps/ehm_front/`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Replace values from your Firebase config

## Step 7: Install Firebase CLI Tools

```bash
npm install -g firebase-tools
```

## Step 8: Deploy to Firebase Hosting

### First time setup:
```bash
firebase login
firebase init hosting
```

### Build and deploy:
```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

## Testing

### Create a Test User

1. In Firebase Console → Authentication
2. Click "Add user"
3. Enter email and password
4. Create account

### Login to the Application

1. Go to your Firebase Hosting URL
2. Enter test email and password
3. You should be redirected to the dashboard

## Firestore Security Rules

The security rules are configured to:
- Allow authenticated users to read vehicles and brands
- Only allow admins to write/update data
- Deny all other access

To grant admin access:
1. Go to Firebase Console → Custom claims (using Google Cloud Console)
2. Or set manually in Firestore rules

## Next Steps

- Add more vehicle data to Firestore
- Configure admin backend for managing vehicles
- Set up proper authentication for admin users
- Enable additional services (Storage, Messaging, etc.)

## Troubleshooting

### "Cannot find module 'firebase'"
```bash
npm install firebase
```

### Auth not persisting
Check that `VITE_FIREBASE_PROJECT_ID` is correct in `.env.local`

### Firestore rules deployment fails
Ensure you're logged in with `firebase login`

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
