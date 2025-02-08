/**
 * Manages role-based access control with hierarchical permissions.
 * Provides a static method to check if a user's role meets required access level.
 */
class RolePermissions {
  constructor() {
    this.roles = ['subscriber', 'editor', 'admin', 'super_admin']
  }

  /**
   * Checks if a user's role meets or exceeds the required access level
   * @param {string} userRole - The user's current role to validate
   * @param {string} requiredAccessLevel - Minimum required access level (e.g., 'editor')
   * @returns {boolean} True if user has access, false otherwise
   */
  static hasAccess(userRole, requiredAccessLevel) {
    const instance = new RolePermissions()

    const accessLevels = instance.roles.reduce((acc, currentRole, index) => {
      acc[currentRole] = instance.roles.slice(index)
      return acc
    }, {})

    const accessibleRoles = accessLevels[requiredAccessLevel] || []
    return accessibleRoles.includes(userRole)
  }
}

export { RolePermissions }
