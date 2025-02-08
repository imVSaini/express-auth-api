import conn from '../database/connection.js'

/**
 * RolesAPI class for handling Roles related operations.
 */
class RolesAPI {
  constructor() {
    this.client = conn
    this.collection = 'roles'
  }

  /**
   * Find a record by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object|null>} The found record or null if the operation fails.
   */
  findByUserId = async (userId) => {
    const record = await this.client(this.collection)
      .select('id', 'role', 'user_id as userId')
      .where({ user_id: userId })
      .first()

    return record || null
  }

  /**
   * Create a new record in the database.
   * @param {Object} args - The arguments for the operation.
   * @param {string} args.userId - The ID of the user.
   * @param {string} args.role - The Role of the user. Defaults to "subscriber"
   * @param {Date} args.description - An optional description of the Role.
   * @returns {Promise<Object|null>} The newly created record or null if the operation fails.
   */
  create = async (args) => {
    const query = {
      user_id: args.userId,
      ...(args.role && { role: args.role }),
      ...(args.description && { description: args.description }),
    }

    const [record] = await this.client(this.collection)
      .insert(query)
      .returning(['id', 'role', 'user_id as userId'])

    // For MySQL/SQLite compatibility, fetch the record after inserting
    if (!record) {
      return await this.client(this.collection)
        .select('id', 'role', 'user_id as userId')
        .where({ id: record.id })
        .first()
    }

    return record || null
  }
}

const rolesApi = new RolesAPI()

export { rolesApi }
