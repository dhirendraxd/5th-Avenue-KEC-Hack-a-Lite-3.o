# Firebase Backend Setup Guide

This project now includes a complete Firebase backend integration. Follow these steps to set up Firebase for your application.

## Prerequisites

1. A Google Cloud account (free tier available)
2. Node.js and npm/yarn installed
3. This project already has Firebase SDK dependencies

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "GearShift")
4. Follow the setup wizard
5. Accept the terms and create the project
6. Wait for the project to be created

## Step 2: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon in top-left)
2. Click on the **"Web"** app or create a new one if needed
3. Copy the Firebase config object that looks like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456"
   };
   ```

## Step 3: Create Environment Variables

1. Create a `.env.local` file in your project root (copy from `.env.example`)
2. Paste your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```
3. Save the file (this file is in `.gitignore` and won't be committed)

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication** section
2. Click **"Get Started"**
3. Under Sign-in method, click **Email/Password**
4. Enable it and save
5. (Optional) Enable other providers like Google Sign-in

## Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create Database"**
3. Choose **Start in test mode** (for development)
4. Select your region
5. Create the database

### Important: Firestore Security Rules

For production, update your Firestore security rules. Go to **Firestore > Rules** and use:

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
  }
}
```

## Step 6: Set Up Firebase Storage

1. In Firebase Console, go to **Storage**
2. Click **"Get Started"**
3. Start in test mode (for development)
4. Select a storage location

### Important: Storage Security Rules

Go to **Storage > Rules** and update:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload and view their own files
    match /{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow anyone to read public equipment images
    match /equipment/{allPaths=**} {
      allow read: if true;
    }
  }
}
```

## Step 7: Create Firestore Collections

Create the following collections in Firestore:

### 1. `users` Collection
Document ID: User UID

```json
{
  "uid": "firebase-uid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "owner",
  "businessId": "b1",
  "businessName": "My Business",
  "locationAccess": ["loc1", "loc2"],
  "createdAt": "2026-02-20T00:00:00Z"
}
```

### 2. `equipment` Collection
```json
{
  "id": "equipment-id",
  "name": "Excavator",
  "category": "construction",
  "ownerId": "user-uid",
  "description": "Heavy construction equipment",
  "pricePerDay": 150,
  "condition": "excellent",
  "image": "https://storage.url/image.jpg",
  "location": "loc1",
  "available": true,
  "createdAt": "2026-02-20T00:00:00Z",
  "reviews": []
}
```

### 3. `rentals` Collection
```json
{
  "id": "rental-id",
  "equipmentId": "equipment-id",
  "ownerId": "owner-uid",
  "renterId": "renter-uid",
  "status": "active",
  "startDate": "2026-02-20",
  "endDate": "2026-02-25",
  "totalCost": 750,
  "createdAt": "2026-02-20T00:00:00Z"
}
```

### 4. `locations` Collection
```json
{
  "id": "location-id",
  "name": "Main Warehouse",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "businessId": "b1",
  "equipmentCount": 25
}
```

## Step 8: Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

## Step 9: Start Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

## Usage

### In Your Components

```typescript
import { 
  getDocument, 
  createDocument, 
  updateDocument,
  uploadFile,
  signIn,
  logout
} from '@/lib/firebase';

// Get equipment
const equipment = await getDocument('equipment', 'eq-123');

// Create rental
await createDocument('rentals', 'rental-id', {
  equipmentId: 'eq-123',
  renterId: 'user-123',
  startDate: '2026-02-20',
  // ... other fields
});

// Upload image
const imageUrl = await uploadFile('equipment/images/photo.jpg', file);

// Login
await signIn('user@example.com', 'password');

// Logout
await logout();
```

### Using in Auth Context

The `useAuth` hook automatically uses Firebase:

```typescript
import { useAuth } from '@/contexts/AuthContext';

export function MyComponent() {
  const { user, login, logout, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login('user@example.com', 'password')}>
          Login
        </button>
      )}
    </div>
  );
}
```

## Available Functions

### Authentication (`src/lib/firebase/auth.ts`)
- `signUp(email, password)` - Create new user
- `signIn(email, password)` - Login user
- `logout()` - Logout user
- `getCurrentUser()` - Get current user info
- `onAuthChange(callback)` - Listen to auth changes

### Firestore (`src/lib/firebase/firestore.ts`)
- `getDocument(collection, docId)` - Get single document
- `getDocuments(collection, constraints)` - Get multiple documents
- `createDocument(collection, docId, data)` - Create document
- `updateDocument(collection, docId, data)` - Update document
- `deleteDocument(collection, docId)` - Delete document
- `queryDocuments(collection, field, operator, value)` - Query documents
- `getOrderedDocuments(collection, field, direction, limit)` - Get ordered results

### Storage (`src/lib/firebase/storage.ts`)
- `uploadFile(path, file)` - Upload single file
- `uploadMultipleFiles(basePath, files)` - Upload multiple files
- `deleteFile(path)` - Delete file
- `getFileUrl(path)` - Get download URL
- `listFiles(path)` - List files in directory

## Troubleshooting

### Firebase credentials not loading
- Ensure `.env.local` file exists with correct values
- Check that all environment variable names match exactly
- Restart your dev server after changing `.env.local`

### Authentication fails
- Verify Email/Password is enabled in Firebase Authentication
- Check that the user exists in Firebase
- Verify Firestore security rules allow the operation

### Storage issues
- Ensure Storage is enabled in Firebase
- Check Storage security rules
- Verify file paths don't have special characters

### Firestore permission denied
- Check your security rules are correct
- Ensure user is authenticated
- Verify the user has permission for the operation

## Next Steps

1. Create custom data models for your equipment types
2. Add more comprehensive security rules
3. Set up Firebase Cloud Functions for backend logic
4. Implement real-time listeners with `onSnapshot`
5. Add error handling and logging throughout your app

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
- [Firebase Storage Guide](https://firebase.google.com/docs/storage)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
