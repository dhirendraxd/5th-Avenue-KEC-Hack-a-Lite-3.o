# Firebase Authentication Setup Guide

This guide walks you through setting up Firebase Authentication for the GearShift application.

## Prerequisites

- Firebase project created (see FIREBASE_SETUP.md for instructions)
- Firebase SDK already installed in your project
- A `.env.local` file in your project root

## Step 1: Set Up Environment Variables

1. Copy the `.env.example` file:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase credentials from the Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click the gear icon (⚙️) → **Project Settings**
   - Find the **Web** app section and copy the configuration

3. Update your `.env.local` file:

   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=gearshift.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=gearshift-project
   VITE_FIREBASE_STORAGE_BUCKET=gearshift-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
   ```

   **Important:** `.env.local` is in `.gitignore` and won't be committed to version control.

## Step 2: Enable Authentication Methods in Firebase

### Email/Password Authentication

1. Go to Firebase Console → **Authentication**
2. Click **Get Started**
3. Select **Email/Password**
4. Toggle **Enable** on
5. Click **Save**

### Google Sign-In (Optional)

1. In **Authentication**, click **Get Started**
2. Select **Google**
3. Toggle **Enable** on
4. Enter your **Support email**
5. Click **Save**

## Step 3: Enable Firestore Database

1. Go to **Firestore Database**
2. Click **Create Database**
3. Select **Start in test mode** (for development)
4. Choose your region (closest to your users)
5. Click **Create**

### Set Up Firestore Security Rules

Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Allow authenticated users to read equipment
    match /equipment/{document=**} {
      allow read: if request.auth != null;
    }

    // Allow owners to manage their equipment
    match /equipment/{docId} {
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }

    // Allow authenticated users to read/write rentals
    match /rentals/{document=**} {
      allow read, write: if request.auth != null;
    }

    // Allow authenticated users to read their own transaction history
    match /transactions/{userId}/history/{document=**} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Step 4: Enable Firebase Storage

1. Go to **Storage**
2. Click **Get Started**
3. Accept the default rules for testing
4. Choose your region
5. Click **Done**

### Update Storage Security Rules

Go to **Storage > Rules** and use:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload their own profile pictures
    match /users/{userId}/profile/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Allow authenticated users to upload equipment images
    match /equipment/{docId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Allow authenticated users to upload rental photos
    match /rentals/{docId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 5: Test the Authentication

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the Auth page
3. Try signing up with email/password
4. Try signing in with Google (if enabled)

## Authentication API Usage

The authentication is integrated into the `AuthContext` and provides these functions:

### Using the Auth Context

```tsx
import { useAuth } from "@/contexts/AuthContext";

export function MyComponent() {
  const { user, login, loginWithGoogle, logout, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div>
        <button onClick={() => login("user@example.com", "password")}>
          Sign In
        </button>
        <button onClick={() => loginWithGoogle()}>Sign In with Google</button>
      </div>
    );
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Role: {user.role}</p>
      <button onClick={() => logout()}>Sign Out</button>
    </div>
  );
}
```

### Direct Firebase Auth Usage

For advanced use cases, import directly from the Firebase auth module:

```tsx
import { signIn, signUp, logout, onAuthChange } from "@/lib/firebase/auth";

// Sign up
const user = await signUp("user@example.com", "password123");

// Sign in
const user = await signIn("user@example.com", "password123");

// Listen to auth state
const unsubscribe = onAuthChange((user) => {
  console.log("Auth user:", user);
});

// Cleanup
unsubscribe();
```

## User Roles and Permissions

The application integrates Firebase authentication with role-based access control:

- **Owner**: Full access to marketplace, listings, settings
- **Operations Manager**: Can manage rentals and approve requests
- **Finance**: Can view financial reports

Roles are mapped from your user database in Firestore. Update the `mockTeamMembers` in `lib/mockData.ts` or implement a user roles collection in Firestore.

## Troubleshooting

### "Firebase configuration is not valid" error

- Make sure `.env.local` file exists and contains all required environment variables
- Restart your dev server after creating/updating `.env.local`

### Google Sign-In not working

- Ensure Google Sign-In is enabled in Firebase Console
- Add your development domain to authorized redirect URIs:
  - Go to **Project Settings > OAuth consent screen > Authorized domains**
  - Add `localhost` (it should be automatically included)

### Users can't sign up

- Check Firebase Console > Authentication > Users tab
- Verify Email/Password authentication is enabled
- Check Firestore security rules allow creating new users

### Session lost on page refresh

- Browser persistence is enabled by default
- Check browser's Local Storage for `gearshift_user` key
- Clear browser cache and try again

## Next Steps

1. Create a user profile page to display and edit user information
2. Implement role-based UI rendering based on user permissions
3. Set up email verification
4. Implement password reset functionality
5. Add authentication to your API endpoints

## See Also

- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - General Firebase setup
- [FIREBASE_BACKEND_SUMMARY.md](FIREBASE_BACKEND_SUMMARY.md) - Backend architecture overview
- [FIREBASE_EXAMPLES.md](FIREBASE_EXAMPLES.md) - Code examples for various use cases
