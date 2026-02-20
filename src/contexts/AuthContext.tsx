import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CurrentUser, UserRole, mockBusinesses, mockTeamMembers, mockLocations } from '@/lib/mockData';
// Firebase imports - will be enabled after npm install
// import { 
//   signIn as firebaseSignIn, 
//   logout as firebaseLogout, 
//   onAuthChange,
//   getCurrentUser,
// } from '@/lib/firebase/auth';
// import { getDocument } from '@/lib/firebase/firestore';

interface AuthContextType {
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

  // Listen to Firebase auth state changes (will be enabled after npm install)
  useEffect(() => {
    // Try loading Firebase auth listener if available
    try {
      // Dynamic import will be attempted after npm install
      setIsLoading(false);
    } catch (error) {
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
    const defaultGoogleEmail = 'google.user@gearshift.app';
    const teamMember = mockTeamMembers.find(tm => tm.email === defaultGoogleEmail);
    const userRole: UserRole = teamMember?.role || 'owner';
    
    const newUser: CurrentUser = {
      id: teamMember?.id || 'u1',
      name: teamMember?.name || 'Google User',
      email: defaultGoogleEmail,
      role: userRole,
      businessId: 'b1',
      businessName: mockBusinesses[0].name,
      locationAccess: teamMember?.locationAccess || mockLocations.map(l => l.id),
    };
    
    setUser(newUser);
    localStorage.setItem('gearshift_user', JSON.stringify(newUser));
    return true;
  };

  const logout = async () => {
    // Firebase logout disabled until npm install
    setUser(null);
    localStorage.removeItem('gearshift_user');
  };

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
