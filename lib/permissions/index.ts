export type UserRole = 'membro' | 'lider' | 'backoffice' | 'pastor' | 'tesouraria';

/** Quem administra a conexão de pagamentos e a assinatura da igreja. */
export const ADMIN_DA_IGREJA: UserRole[] = ['backoffice', 'pastor'];

export const routeRoles: Record<string, UserRole[]> = {
  '/usuarios': ['backoffice'],
  '/eventos': ['lider', 'backoffice'],
  '/projetos': ['lider', 'backoffice'],
  '/areas': ['lider', 'backoffice', 'membro'],
  '/backoffice': ['backoffice'],
  '/instituicao/pagamentos': ADMIN_DA_IGREJA,
  '/instituicao/assinatura': ['lider', ...ADMIN_DA_IGREJA],
};

export const featureRoles = {
  criarProjeto: ['lider', 'backoffice'],
  gerenciarArea: ['lider', 'backoffice', 'membro'],
  gerenciarUsuarios: ['backoffice'],
  aprovarProjeto: ['lider', 'backoffice'],
  alterarPapelMembro: ['backoffice'],
  solicitarReembolso: ['lider', 'backoffice'],
  liquidarProjeto: ['lider', 'backoffice'],
  conectarMercadoPago: ADMIN_DA_IGREJA,
  gerenciarPlanos: ['backoffice'],
} satisfies Record<string, UserRole[]>;

export function canAccessRoute(role: UserRole, path: string): boolean {
  // A rota mais específica vence: `/instituicao/pagamentos` antes de um `/instituicao`.
  const entradas = Object.entries(routeRoles).sort(([a], [b]) => b.length - a.length);
  const entry = entradas.find(([route]) => path.startsWith(route));

  return entry ? entry[1].includes(role) : true;
}

export function can(role: UserRole, feature: keyof typeof featureRoles): boolean {
  return (featureRoles[feature] as UserRole[]).includes(role);
}
