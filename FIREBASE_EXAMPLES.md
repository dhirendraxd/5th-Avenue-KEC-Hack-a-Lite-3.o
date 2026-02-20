# Firebase Integration Examples

Quick examples of how to use Firebase in your components.

## Using Firebase with React Query Hooks

### Fetching Equipment List

```typescript
import { useAllEquipment } from '@/hooks/useFirebase';

export function EquipmentList() {
  const { data: equipment, isLoading, error } = useAllEquipment();

  if (isLoading) return <div>Loading equipment...</div>;
  if (error) return <div>Error loading equipment</div>;

  return (
    <div>
      {equipment?.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>${item.pricePerDay}/day</p>
        </div>
      ))}
    </div>
  );
}
```

### Creating New Equipment

```typescript
import { useCreateEquipment, useUploadEquipmentImages } from '@/hooks/useFirebase';

export function CreateEquipmentForm() {
  const { mutate: createEquipment, isPending } = useCreateEquipment();
  const { mutate: uploadImages } = useUploadEquipmentImages();

  const handleSubmit = async (data: any, files: File[]) => {
    const equipmentId = 'eq_' + Date.now();

    // Upload images first
    if (files.length > 0) {
      const imageUrls = await uploadImages({ equipmentId, files });
      data.images = imageUrls;
    }

    // Create equipment
    createEquipment({
      id: equipmentId,
      ...data,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      // Handle form submission
    }}>
      {/* Form fields */}
      <button disabled={isPending}>Create Equipment</button>
    </form>
  );
}
```

### Managing Rentals

```typescript
import { useUserRentals, useUpdateRentalStatus } from '@/hooks/useFirebase';

export function RentalHistory({ userId }) {
  const { data: rentals } = useUserRentals(userId);
  const { mutate: updateStatus } = useUpdateRentalStatus();

  const handleApprove = (rentalId: string) => {
    updateStatus({ rentalId, status: 'approved' });
  };

  const handleDecline = (rentalId: string) => {
    updateStatus({ rentalId, status: 'declined' });
  };

  return (
    <div>
      {rentals?.map((rental) => (
        <div key={rental.id}>
          <h4>Rental {rental.id}</h4>
          <p>Status: {rental.status}</p>
          <button onClick={() => handleApprove(rental.id)}>Approve</button>
          <button onClick={() => handleDecline(rental.id)}>Decline</button>
        </div>
      ))}
    </div>
  );
}
```

## Using Firebase Auth Services

### Login Component

```typescript
import { useAuth } from '@/contexts/AuthContext';

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Protected Route with Auth Check

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

// Usage in your routes:
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### User Profile

```typescript
import { useUserProfile, useUpdateUserProfile } from '@/hooks/useFirebase';
import { useAuth } from '@/contexts/AuthContext';

export function UserProfile() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id || '');
  const { mutate: updateProfile, isPending } = useUpdateUserProfile();

  const handleUpdateName = (newName: string) => {
    updateProfile({
      userId: user!.id,
      data: { name: newName, updatedAt: new Date().toISOString() },
    });
  };

  return (
    <div>
      <h2>{profile?.name}</h2>
      <p>Email: {profile?.email}</p>
      <p>Role: {profile?.role}</p>
      <button 
        onClick={() => handleUpdateName('New Name')}
        disabled={isPending}
      >
        Update Name
      </button>
    </div>
  );
}
```

## Direct Firebase Service Usage

### For more control, use the services directly:

```typescript
import {
  getDocument,
  queryDocuments,
  createDocument,
  updateDocument,
} from '@/lib/firebase/firestore';
import { uploadFile, deleteFile } from '@/lib/firebase/storage';

async function customBusinessLogic() {
  // Get specific equipment
  const equipment = await getDocument('equipment', 'eq-123');

  // Query equipment by category
  const construction = await queryDocuments('equipment', 'category', '==', 'construction');

  // Create new document
  await createDocument('equipment', 'new-id', {
    name: 'Bulldozer',
    category: 'construction',
    pricePerDay: 200,
  });

  // Update document
  await updateDocument('equipment', 'eq-123', {
    available: false,
    updatedAt: new Date().toISOString(),
  });

  // Upload file
  const file = new File(['content'], 'equipment.jpg', { type: 'image/jpeg' });
  const downloadUrl = await uploadFile('equipment/photos/equipment.jpg', file);

  // Delete file
  await deleteFile('equipment/photos/old-photo.jpg');
}
```

## Real-time Listeners

For real-time updates, use Firebase's `onSnapshot`:

```typescript
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function RealtimeEquipmentList() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'equipment'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEquipment(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {equipment.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>Available: {item.available ? 'Yes' : 'No'}</p>
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

Always handle errors properly:

```typescript
export function SafeEquipmentFetch({ equipmentId }) {
  const { data, isLoading, error } = useEquipment(equipmentId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorAlert 
        message="Failed to load equipment"
        details={error.message}
      />
    );
  }

  if (!data) {
    return <NotFoundMessage />;
  }

  return <EquipmentDetails data={data} />;
}
```

## Common Patterns

### Refresh Data

```typescript
const { data, refetch } = useAllEquipment();

const handleRefresh = () => {
  refetch();
};
```

### Optimistic Updates

```typescript
const { mutate, isPending } = useUpdateEquipment();

const handleUpdate = (id: string, newData: any) => {
  // Optimistically update UI
  setLocalData({ ...localData, ...newData });
  
  // Update in Firebase
  mutate({ equipmentId: id, data: newData });
};
```

## Best Practices

1. **Always use React Query hooks** for data fetching and mutations
2. **Handle loading and error states** in all components
3. **Use TypeScript** for type safety with Firebase data
4. **Implement proper Firestore security rules** before going to production
5. **Use indexes** for complex queries
6. **Batch operations** when possible to save on read/write costs
7. **Implement pagination** for large datasets
8. **Use collections wisely** - keep document size under Firebase limits
