export type AdminRole = 'Super Admin' | 'Main Admin' | 'Operations Manager' | 'Customer Support';

export const ALL_ROLES: AdminRole[] = [
  'Super Admin',
  'Main Admin',
  'Operations Manager',
  'Customer Support',
];

/** Tab access per role */
export const TAB_PERMISSIONS: Record<string, AdminRole[]> = {
  'overview':             ['Super Admin', 'Main Admin', 'Operations Manager', 'Customer Support'],
  'staff':                ['Super Admin', 'Main Admin', 'Operations Manager'],
  'staff-availability':   ['Super Admin', 'Main Admin', 'Operations Manager'],
  'task-reassignment':    ['Super Admin', 'Main Admin', 'Operations Manager'],
  'admin-mgmt':           ['Super Admin', 'Main Admin'],
  'customer':             ['Super Admin', 'Main Admin', 'Customer Support'],
  'payments':             ['Super Admin', 'Main Admin'],
  'billing':                      ['Super Admin', 'Main Admin'],
  'billing-financial-dashboard':  ['Super Admin', 'Main Admin'],
  'billing-analytics':            ['Super Admin', 'Main Admin'],
  'inventory':            ['Super Admin', 'Main Admin', 'Operations Manager'],
  'reviews':              ['Super Admin', 'Main Admin', 'Customer Support'],
  'complaints':           ['Super Admin', 'Main Admin', 'Customer Support'],
  'gps':                  ['Super Admin', 'Main Admin', 'Operations Manager'],
  'reports':              ['Super Admin', 'Main Admin'],
  'settings':             ['Super Admin', 'Main Admin'],
};

export function canAccessTab(tab: string, role: AdminRole | undefined): boolean {
  const effectiveRole: AdminRole = role ?? 'Customer Support';
  return (TAB_PERMISSIONS[tab] ?? []).includes(effectiveRole);
}

/**
 * What actions the currentRole can perform on a target admin row.
 * Returns a set of allowed actions.
 */
export function getAdminRowActions(
  currentRole: AdminRole,
  targetRole: AdminRole
): { canEdit: boolean; canDeactivate: boolean; canDelete: boolean } {

  // Nobody can edit/deactivate/delete the Super Admin
  if (targetRole === 'Super Admin') {
    return { canEdit: false, canDeactivate: false, canDelete: false };
  }

  // Super Admin can do everything on Main Admin, Ops Mgr, CS
  if (currentRole === 'Super Admin') {
    return { canEdit: true, canDeactivate: true, canDelete: true };
  }

  // Main Admin can manage Ops Mgr and CS only — not other Main Admins
  if (currentRole === 'Main Admin') {
    if (targetRole === 'Main Admin') {
      return { canEdit: false, canDeactivate: false, canDelete: false };
    }
    return { canEdit: true, canDeactivate: true, canDelete: true };
  }

  // Operations Manager and Customer Support — view only
  return { canEdit: false, canDeactivate: false, canDelete: false };
}

/**
 * Which roles the currentRole is allowed to assign when adding/editing an admin.
 */
export function getAssignableRoles(currentRole: AdminRole): AdminRole[] {
  if (currentRole === 'Super Admin') {
    return ['Main Admin', 'Operations Manager', 'Customer Support'];
  }
  if (currentRole === 'Main Admin') {
    return ['Operations Manager', 'Customer Support'];
  }
  return []; // Ops Mgr and CS can't assign any roles
}