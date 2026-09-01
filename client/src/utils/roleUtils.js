export const getRoleName = (role) => {
  if (!role) {
    return "";
  }

  if (typeof role === "string") {
    return role;
  }

  if (typeof role === "object") {
    return role.name || "";
  }

  return "";
};

export const getNormalizedRole = (role) => {
  return getRoleName(role).trim().toLowerCase();
};

/**
 * Checks if a user has a specific permission.
 * - 'Admin' role automatically has access to everything.
 * - '.manage' parent permission grants access to '.view', '.create', '.update', '.delete'.
 */
export const hasPermission = (user, requiredPermission) => {
  if (!user) {
    return false;
  }

  const roleName = getRoleName(user.role);

  // Admin always has full access
  if (roleName.toLowerCase() === "admin") {
    return true;
  }

  if (!requiredPermission) {
    return true;
  }

  // Extract permissions array from user.role or user
  const permissions = Array.isArray(user.role?.permissions)
    ? user.role.permissions
    : Array.isArray(user.permissions)
    ? user.permissions
    : [];

  // Exact match
  if (permissions.includes(requiredPermission)) {
    return true;
  }

  // Parent manage match (e.g. 'sales.manage' satisfies 'sales.create' or 'sales.view')
  const [domain] = requiredPermission.split(".");
  if (permissions.includes(`${domain}.manage`)) {
    return true;
  }

  return false;
};

/**
 * Checks if a user has at least one permission from a given array.
 */
export const hasAnyPermission = (user, permissionsList = []) => {
  if (!permissionsList.length) {
    return true;
  }

  return permissionsList.some((permission) =>
    hasPermission(user, permission)
  );
};