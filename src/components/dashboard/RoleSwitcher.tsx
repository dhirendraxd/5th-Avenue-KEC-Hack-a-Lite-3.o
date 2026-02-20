import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/mockData';
import { roleLabels } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Shield } from 'lucide-react';

const RoleSwitcher = () => {
  const { user, switchRole } = useAuth();

  if (!user) return null;

  const roleIcons: Record<UserRole, React.ReactNode> = {
    owner: <Briefcase className="h-4 w-4" />,
    operations_manager: <Users className="h-4 w-4" />,
    finance: <Shield className="h-4 w-4" />,
  };

  return (
    <Select value={user.role} onValueChange={(value) => switchRole(value as UserRole)}>
      <SelectTrigger className="h-9 w-full sm:w-[200px]">
        <div className="flex items-center gap-2">
          <div className={roleLabels[user.role].color}>
            {roleIcons[user.role]}
          </div>
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(roleLabels) as UserRole[]).map((role) => (
          <SelectItem key={role} value={role}>
            <div className="flex items-center gap-2">
              <div className={roleLabels[role].color}>{roleIcons[role]}</div>
              <span>{roleLabels[role].label}</span>
              {role === user.role && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Current
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RoleSwitcher;
