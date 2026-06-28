'use client';

import { usePermissions } from '@/lib/hooks/usePermissions';
import type { UserRole, featureRoles } from '@/lib/permissions';

interface Props {
  feature?: keyof typeof featureRoles;
  roles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanAccess({ feature, roles, children, fallback = null }: Props) {
  const { can, is } = usePermissions();
  const allowed = feature ? can(feature) : roles ? is(...roles) : false;
  return <>{allowed ? children : fallback}</>;
}
