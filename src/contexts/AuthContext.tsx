import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CurrentUser, UserRole, mockBusinesses, mockTeamMembers, mockLocations } from '@/lib/mockData';
import { logout as firebaseLogout, onAuthChange, signInWithGoogle as firebaseSignInWithGoogle } from '@/lib/firebase/auth';

interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  isLoading: boolean;
}

type Permission =
  | 'view_marketplace'
  | 'manage_listings'
  | 'manage_rentals'
  | 'approve_requests'
  | 'view_operations'
  | 'view_finance'
  | 'manage_team'
  | 'manage_locations';

const rolePermissions: Record<UserRole, Permission[]> = {
  owner: [
    'view_marketplace',
    'manage_listings',
    'manage_rentals',
    'approve_requests',
    'view_operations',
    'view_finance',
    'manage_team',
    'manage_locations',
  ],
  operations_manager: [
    'view_marketplace',
    'manage_listings',
    'manage_rentals',
    'approve_requests',
    'view_operations',
  ],
  finance: ['view_marketplace', 'view_finance'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapAuthUserToCurrentUser = (authUser: { uid: string; email: string | null; displayName: string | null }): CurrentUser => {
  const teamMember = mockTeamMembers.find((member) => member.email === authUser.email);
  const role: UserRole = teamMember?.role || 'owner';

  return {
    id: authUser.uid,
    name: authUser.displayName || authUser.email?.split('@')[0] || 'Google User',
    email: authUser.email || '',
    role,
    businessId: 'b1',
    businessName: mockBusinesses[0].name,
    locationAccess: teamMember?.locationAccess || mockLocations.map((location) => location.id),
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const savedUser = localStorage.getItem('gearshift_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      if (!authUser) {
        setUser(null);
        localStorage.removeItem('gearshift_user');
        setIsLoading(false);
        return;
      }

      const mappedUser = mapAuthUserToCurrentUser(authUser);
      setUser(mappedUser);
      localStorage.setItem('gearshift_user', JSON.stringify(mappedUser));
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const firebaseUser = await firebaseSignInWithGoogle();
      const mappedUser = mapAuthUserToCurrentUser(firebaseUser);
      setUser(mappedUser);
      localStorage.setItem('gearshift_user', JSON.stringify(mappedUser));
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('gearshift_user');
    }
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const updatedUser = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem('gearshift_user', JSON.stringify(updatedUser));
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithGoogle,
        logout,
        switchRole,
        hasPermission,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
