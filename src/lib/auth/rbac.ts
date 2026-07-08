export type UserRole = "super_admin" | "barangay_official" | "sk_official" | "resident";

export const ROLES: Record<string, UserRole> = {
  SUPER_ADMIN: "super_admin",
  BARANGAY_OFFICIAL: "barangay_official",
  SK_OFFICIAL: "sk_official",
  RESIDENT: "resident",
};

// Route matching patterns per role prefix
export const ROLE_ROUTE_MAPS: Record<UserRole, string[]> = {
  super_admin: ["/lgu"],
  barangay_official: ["/barangay"],
  sk_official: ["/barangay"], // SK shares barangay layouts with restricted sub-scopes
  resident: ["/resident"],
};

/**
 * Checks if a user role has access to a specific path route.
 */
export function canAccessPath(role: UserRole, path: string): boolean {
  // Super admin can access everything
  if (role === ROLES.SUPER_ADMIN) return true;

  const allowedPrefixes = ROLE_ROUTE_MAPS[role] || [];
  return allowedPrefixes.some((prefix) => path.startsWith(prefix));
}

/**
 * Verifies if user has a required role or higher in hierarchy
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (userRole === ROLES.SUPER_ADMIN) return true;
  return allowedRoles.includes(userRole);
}
