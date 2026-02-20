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
  user: CurrentUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
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
  finance: [
    'view_marketplace',
    'view_finance',
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem('gearshift_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    try {
      const unsubscribe = onAuthChange((authUser) => {
        if (authUser) {
          // Find user in mock data to get role and business info
          const teamMember = mockTeamMembers.find(tm => tm.email === authUser.email);
          const userRole = teamMember?.role || 'owner';
          
          const userData: CurrentUser = {
            id: authUser.uid,
            name: authUser.displayName || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: userRole,
      const firebaseUser = await firebaseSignIn(email, password);
      
      // Find user in mock data to get role and business info
      const teamMember = mockTeamMembers.find(tm => tm.email === firebaseUser.email);
      const userRole = role || teamMember?.role || 'owner';
      
      const newUser: CurrentUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email: firebaseUser.email || email,
        role: userRole,
        businessId: teamMember?.businessId ||

      return unsubscribe;
    } catch (error) {
      console.error('Auth state listener error:', error);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Firebase authentication disabled until npm install
      // Will attempt dynamic import after dependencies are installed
      
      // Using fallback to demo/mock authentication
      const teamMember = mockTeamMembers.find(tm => tm.email === email);
      const userRole = role || teamMember?.role || 'owner';
      
      const newUser: CurrentUser = {
        id: teamMember?.id || 'demo_' + Date.now(),
        name: teamMember?.name || 'Demo User',
        email: email,
        role: userRole,
        businessId: 'b1',
        businessName: mockBusinesses[0].name,
        locationAccess: teamMember?.locationAccess || mockLocations.map(l => l.id),
      };
      
      setUser(newUser);
      localStorage.setItem('gearshift_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const firebaseUser = await firebaseSignInWithGoogle();
      
      // Find user in mock data to get role and business info
      const teamMember = mockTeamMembers.find(tm => tm.email === firebaseUser.email);
      const userRole: UserRole = teamMember?.role || 'owner';
      
      const newUser: CurrentUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
        email: firebaseUser.email || '',
        role: userRole,
        businessId: teamMember?.businessId || 'b1',
        businessName: mockBusinesses[0].name,
        locationAccess: teamMember?.locationAccess || mockLocations.map(l => l.id),
      };
      
      setUser(newUser);
      localStorage.setItem('gearshift_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    // Firebase logout disabled until npm install
    try {
      await firebaseLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('gearshift_user');
    }

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('gearshift_user', JSON.stringify(updatedUser));
    }
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
        login,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
