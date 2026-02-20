import { createContext, useContext, useState, ReactNode } from 'react';
import { CurrentUser, UserRole, mockBusinesses, mockTeamMembers, mockLocations } from '@/lib/mockData';

interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
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

  const logout = () => {
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
        loginWithGoogle,
        logout,
        switchRole,
        hasPermission,
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
