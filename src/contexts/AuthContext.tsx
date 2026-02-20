import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CurrentUser, UserRole, mockBusinesses, mockTeamMembers, mockLocations } from '@/lib/mockData';
import { 
  signIn as firebaseSignIn, 
  logout as firebaseLogout,
  onAuthChange,
  getCurrentUser,
  signUp as firebaseSignUp,
  signInWithGoogle as firebaseSignInWithGoogle,
} from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
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
    return unsubscribe;
  }, []);

<<<<<<< HEAD
=======
  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const firebaseUser = await firebaseSignIn(email, password);
      
      // Find user in mock data to get role and business info
      const teamMember = mockTeamMembers.find(tm => tm.email === firebaseUser.email);
      const userRole = role || teamMember?.role || 'owner';
      
      const newUser: CurrentUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email: firebaseUser.email || email,
        role: userRole,
        businessId: 'b1',
        businessName: mockBusinesses[0].name,
        locationAccess: teamMember?.locationAccess || mockLocations.map(l => l.id),
      };
      
      setUser(newUser);
      localStorage.setItem('gearshift_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const firebaseUser = await firebaseSignIn(email, password);
      
      // Find user in mock data to get role and business info
      const teamMember = mockTeamMembers.find(tm => tm.email === firebaseUser.email);
      const userRole = role || teamMember?.role || 'owner';
      
      const newUser: CurrentUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
      const mappedUser = mapAuthUserToCurrentUser(firebaseUser);
      setUser(mappedUser);
      localStorage.setItem('gearshift_user', JSON.stringify(mappedUser));
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const logout = async (): Promise<void> => {
=======
  const logout = async () => {
>>>>>>> b50a011 (feat: update AuthContext to enhance Firebase authentication flow and user data handling)
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
,
        login