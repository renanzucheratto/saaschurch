import { useAppSelector } from '@/config/redux/store';
import { selectCurrentUser } from '@/config/redux/slices/authSlice';
import { type UserRole, type featureRoles, can, canAccessRoute } from '@/lib/permissions';

export function usePermissions() {
  const user = useAppSelector(selectCurrentUser);
  const role = (user?.userType ?? 'membro') as UserRole;

  return {
    role,
    can: (feature: keyof typeof featureRoles) => can(role, feature),
    canAccess: (path: string) => canAccessRoute(role, path),
    is: (...roles: UserRole[]) => roles.includes(role),
  };
}
