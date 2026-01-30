import { useAuth } from "../contexts/AuthContext";

/**
 * Componente para proteger seções baseado em roles
 * @param {Array} allowedRoles - Array de roles permitidas ['god', 'admin', 'instrutor']
 * @param {ReactNode} children - Conteúdo a ser renderizado se tiver permissão
 * @param {ReactNode} fallback - Conteúdo alternativo se não tiver permissão (opcional)
 */
export default function RoleGuard({ allowedRoles = [], children, fallback = null }) {
  const { user, hasAccess } = useAuth();

  // Se não está logado, não mostra nada
  if (!user) return fallback;

  // Se tem acesso, renderiza o conteúdo
  if (hasAccess(allowedRoles)) {
    return children;
  }

  // Senão, mostra o fallback
  return fallback;
}

/**
 * Hook para verificar permissões em componentes
 */
export function useRole() {
  const { user } = useAuth();
  
  const isGod = user?.role === "god";
  const isAdmin = user?.role === "admin" || isGod;
  const isInstrutor = user?.role === "instrutor";
  
  const canEdit = isAdmin; // god e admin podem editar
  const canDelete = isGod; // só god pode deletar
  const canManageUsers = isAdmin; // god e admin podem gerenciar usuários
  const canViewFinancials = isAdmin; // god e admin veem financeiro completo
  const canViewOwnStats = true; // todos veem suas próprias stats
  
  return {
    role: user?.role,
    isGod,
    isAdmin,
    isInstrutor,
    canEdit,
    canDelete,
    canManageUsers,
    canViewFinancials,
    canViewOwnStats
  };
}
