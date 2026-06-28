export type UserRole = 'membro' | 'lider' | 'backoffice';

export const routeRoles: Record<string, UserRole[]> = {
  '/usuarios': ['backoffice'],
  '/eventos': ['lider', 'backoffice'],
  '/projetos': ['lider', 'backoffice'],
  '/areas': ['lider', 'backoffice', 'membro'],
};

export const featureRoles = {
  criarProjeto: ['lider', 'backoffice'],
  gerenciarArea: ['lider', 'backoffice', 'membro'],
  gerenciarUsuarios: ['backoffice'],
  aprovarProjeto: ['lider', 'backoffice'],
  alterarPapelMembro: ['backoffice'],
  solicitarReembolso: ['lider', 'backoffice'],
  liquidarProjeto: ['lider', 'backoffice'],
} satisfies Record<string, UserRole[]>;

export function canAccessRoute(role: UserRole, path: string): boolean {
  const entry = Object.entries(routeRoles).find(([route]) => path.startsWith(route));
  return entry ? entry[1].includes(role) : true;
}

export function can(role: UserRole, feature: keyof typeof featureRoles): boolean {
  return (featureRoles[feature] as UserRole[]).includes(role);
}
