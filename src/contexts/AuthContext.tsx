import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CurrentUser, UserRole } from '@/lib/mockData';
import { 
  signIn as firebaseSignIn, 
  logout as firebaseLogout,
  onAuthChange,
  signInWithGoogle as firebaseSignInWithGoogle,
} from '@/lib/firebase/auth';

interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  isLoading: boolean;
  hasAcceptedTerms: boolean;
  acceptTerms: () => Promise<void>;
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

const mapAuthUserToCurrentUser = (authUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): CurrentUser => {
  const role: UserRole = 'owner';
  const baseName = authUser.displayName || authUser.email?.split('@')[0] || 'User';

  return {
    id: authUser.uid,
    name: baseName,
    email: authUser.email || '',
    role,
    businessId: authUser.uid,
    businessName: `${baseName} Business`,
    avatar: authUser.photoURL || undefined,
    locationAccess: [],
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const savedUser = localStorage.getItem('gearshift_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    const accepted = localStorage.getItem('gearshift_terms_accepted');
    return accepted === 'true';
  });

  useEffect(() => {
    try {
      const unsubscribe = onAuthChange((authUser) => {
        if (authUser) {
          const mappedUser = mapAuthUserToCurrentUser(authUser);
          setUser(mappedUser);
          localStorage.setItem('gearshift_user', JSON.stringify(mappedUser));
        } else {
          setUser(null);
          localStorage.removeItem('gearshift_user');
        }
        setIsLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Auth state listener error:', error);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, _role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const firebaseUser = await firebaseSignIn(email, password);
      const mappedUser = mapAuthUserToCurrentUser(firebaseUser);
      setUser(mappedUser);
      localStorage.setItem('gearshift_user', JSON.stringify(mappedUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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
      throw error;
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
      localStorage.removeItem('gearshift_terms_accepted');
      setHasAcceptedTerms(false);
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

  const acceptTerms = async (): Promise<void> => {
    localStorage.setItem('gearshift_terms_accepted', 'true');
    setHasAcceptedTerms(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        logout,
        switchRole,
        hasPermission,
        isLoading,
        hasAcceptedTerms,
        acceptTerms,
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