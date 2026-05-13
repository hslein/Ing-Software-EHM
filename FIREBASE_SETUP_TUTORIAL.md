# Firebase Setup Tutorial for EHM Vehicles

Complete step-by-step guide to set up Firebase for your vehicle management system.

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `ehm-vehicles`
4. Click **"Continue"**
5. Choose analytics preference (you can disable it for now)
6. Click **"Create project"**
7. Wait for project to be created (about 1-2 minutes)

---

## Step 2: Create a Web App

1. In Firebase Console, click the **"Web"** icon (</> symbol)
2. Enter app name: `EHM Vehicles App`
3. Check **"Also set up Firebase Hosting for this app"** (optional, for later deployment)
4. Click **"Register app"**
5. **Copy the Firebase config object** - you'll need this!

Example of what you'll copy:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxx...",
  authDomain: "ehm-vehicles.firebaseapp.com",
  projectId: "ehm-vehicles",
  storageBucket: "ehm-vehicles.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

---

## Step 3: Enable Authentication

1. In Firebase Console, go to **"Authentication"** (left sidebar)
2. Click **"Get started"**
3. Click on **"Email/Password"** provider
4. Toggle **"Enable"** (make it blue)
5. Click **"Save"**

---

## Step 4: Create Firestore Database

1. Go to **"Cloud Firestore"** (left sidebar)
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll set security rules)
4. Select region closest to you (e.g., `us-east1` or your region)
5. Click **"Create"**
6. Wait for database to initialize

---

## Step 5: Add Your Credentials to `.env.local`

1. Open VS Code in your workspace
2. Go to folder: `apps/ehm_front/`
3. Create a new file called `.env.local` (note the dot at the start)

   **Right-click → New File → `.env.local`**

4. Copy this template and fill in your Firebase config:

```bash
VITE_FIREBASE_API_KEY=AIzaSyDxx...
VITE_FIREBASE_AUTH_DOMAIN=ehm-vehicles.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ehm-vehicles
VITE_FIREBASE_STORAGE_BUCKET=ehm-vehicles.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

5. Replace each value with your Firebase config values from Step 2
6. **Save the file** (Ctrl+S / Cmd+S)

**⚠️ IMPORTANT:** Add `.env.local` to `.gitignore` so credentials aren't committed:
ima
Open `.gitignore` and add this line:
```
.env.local
```

---

## Step 6: Create Collections in Firestore

### A. Create "brands" Collection

1. In Firestore, click **"+ Create collection"**
2. Enter collection name: `brands`
3. Click **"Next"**
4. For the first document, click **"Auto ID"** or enter: `toyota`
5. Add these fields:
   - `name` (string): `Toyota`
   - `image` (string): `https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop`
   - `createdAt` (timestamp): Click clock icon, set to now
   - `updatedAt` (timestamp): Click clock icon, set to now
6. Click **"Save"**

Repeat for other brands:

**Honda:**
- `name`: `Honda`
- `image`: `https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop`

**Mazda:**
- `name`: `Mazda`
- `image`: `https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop`

**Hyundai:**
- `name`: `Hyundai`
- `image`: `https://images.unsplash.com/photo-1590362891990-f8dda926c081?w=400&h=300&fit=crop`

**Ford:**
- `name`: `Ford`
- `image`: `https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop`

### B. Create "vehicles" Collection

1. Click **"+ Create collection"** again
2. Enter collection name: `vehicles`
3. Click **"Next"**
4. Click **"Auto ID"** for first document
5. Add these fields for a Toyota Corolla:

```
model (string):           Corolla
type (string):            sedan
brand (string):           Toyota
image (string):           https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop
description (string):     Reliable sedan with excellent fuel economy
year (number):            2024
price (number):           25000
mileage (number):         0
createdAt (timestamp):    now
updatedAt (timestamp):    now
```

6. Click **"Save"**

Add more vehicles (click "Add document" in vehicles collection):

**Toyota RAV4:**
```
model: RAV4
type: suv
brand: Toyota
image: https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop
description: Spacious SUV perfect for families
year: 2024
price: 35000
mileage: 0
```

**Honda Civic:**
```
model: Civic
type: sedan
brand: Honda
image: https://images.unsplash.com/photo-1590362891990-f8dda926c081?w=400&h=300&fit=crop
description: Sporty compact sedan with responsive handling
year: 2024
price: 26000
mileage: 0
```

**Honda CR-V:**
```
model: CR-V
type: suv
brand: Honda
image: https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop
description: Comfortable crossover SUV with advanced features
year: 2024
price: 32000
mileage: 0
```

---

## Step 7: Set Firestore Security Rules

1. In Firebase Console, go to **"Firestore"**
2. Click the **"Rules"** tab
3. Replace all content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read brands and vehicles
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to write
    match /{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

---

## Step 8: Test Your App

1. **Stop** any running server (press Ctrl+C in terminal)
2. **Restart** the frontend:
   ```bash
   npm run front
   ```

3. Open browser: `http://localhost:4200`

4. You should see:
   - Landing page with brand cards (Toyota, Honda, Mazda, Hyundai, Ford)
   - Click a brand to see vehicles with real Firebase data
   - Click Login button to test authentication

---

## Step 9: Create a Test Account

1. Click **"Login"** button on the landing page
2. You'll see login/register form
3. Click **"Not registered?"** to switch to register mode
4. Enter:
   - Email: `test@example.com`
   - Password: `Test123456` (min 6 characters)
   - Confirm: `Test123456`
5. Click **"Register"**

You should be redirected to dashboard with your email shown!

---

## Step 10: Deploy to Firebase Hosting (Optional)

**A. Install Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
```

**B. Initialize Firebase Hosting:**
```bash
firebase init hosting
```

When prompted:
- Project: Choose `ehm-vehicles`
- Public directory: Enter `dist/apps/ehm_front`
- Single page app: Enter `yes`

**C. Build and Deploy:**
```bash
npm run build
firebase deploy --only hosting
```

You'll get a URL like: `https://ehm-vehicles.web.app`

---

## Troubleshooting

### Problem: "Firebase not defined" error
**Solution:** Make sure `.env.local` has correct values and you restarted the dev server

### Problem: No brands showing up
**Solution:** 
1. Check that you created "brands" and "vehicles" collections
2. Verify brand names in vehicles match exactly (case-sensitive)
3. Check browser console (F12) for errors

### Problem: Can't register/login
**Solution:**
1. Make sure you enabled Email/Password authentication
2. Check security rules allow reads

### Problem: Images not loading
**Solution:** 
1. Unsplash image URLs might timeout
2. Try using different URLs or host images on Firebase Storage

---

## Next Steps

Once working:

1. **Add more vehicles** via Firebase Console
2. **Add admin panel** to add/edit vehicles from the app
3. **Deploy to production** using Firebase Hosting
4. **Add more features** like favorites, filters, etc.

---

## Quick Reference

| Item | Value |
|------|-------|
| Firebase Project | ehm-vehicles |
| Dev Server | http://localhost:4200 |
| Firestore Collections | brands, vehicles |
| Auth Method | Email/Password |
| Hosting URL | https://ehm-vehicles.web.app (after deploy) |

---

## Files Modified

- `apps/ehm_front/.env.local` - Your Firebase credentials
- `apps/ehm_front/.gitignore` - Added .env.local to prevent credential leaks
- `src/config/firebase.ts` - Firebase initialization (already set up)
- `src/composables/useVehicles.ts` - Firestore integration (already set up)

---

Good luck! 🚀 If you get stuck, check the browser console (F12) for error messages.
