# Firebase Auth Setup Checklist

Use this checklist to ensure Firebase Authentication is properly configured.

## Local Setup

- [ ] `.env.local` file created (copy from `.env.example`)
- [ ] Firebase API Key added to `.env.local`
- [ ] Firebase Auth Domain added to `.env.local`
- [ ] Firebase Project ID added to `.env.local`
- [ ] Firebase Storage Bucket added to `.env.local`
- [ ] Firebase Messaging Sender ID added to `.env.local`
- [ ] Firebase App ID added to `.env.local`

## Firebase Console Configuration

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Authentication > Email/Password enabled
- [ ] Authentication > Google Sign-In enabled (optional)
- [ ] Firestore Database created in test mode
- [ ] Firestore security rules updated
- [ ] Firebase Storage enabled
- [ ] Storage security rules updated

## Code Integration

- [ ] `src/lib/firebase/config.ts` - Firebase initialization ✅
- [ ] `src/lib/firebase/auth.ts` - Auth functions (email, Google, logout) ✅
- [ ] `src/contexts/AuthContext.tsx` - Auth context with Firebase integration ✅
- [ ] `FIREBASE_AUTH_SETUP.md` - Setup documentation ✅

## Testing

- [ ] Development server starts without errors: `npm run dev`
- [ ] Can sign up with email/password
- [ ] Can sign in with email/password
- [ ] Can sign in with Google
- [ ] Can sign out
- [ ] User persists on page refresh
- [ ] User data available in localStorage

## Optional Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Phone number authentication
- [ ] Additional OAuth providers (GitHub, Apple, etc.)
- [ ] Custom user profiles in Firestore
- [ ] User roles/permissions in Firestore

## Troubleshooting

- [ ] Checked `.env.local` is in `.gitignore` (don't commit secrets!)
- [ ] Verified Firebase credentials are correct
- [ ] Checked browser console for errors
- [ ] Cleared browser cache and localStorage if needed
- [ ] Restarted dev server after environment variable changes
