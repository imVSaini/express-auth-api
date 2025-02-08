import conn from '../database/connection.js'

/**
 * UsersAPI class for handling Users related operations.
 */
class UsersAPI {
  constructor() {
    this.client = conn
    this.collection = 'users'
  }

  /**
   * Find a record by ID.
   * @param {string} id - The ID of the user.
   * @returns {Promise<Object|null>} The found record or null if the operation fails.
   */
  findById = async (id) => {
    const record = await this.client(this.collection)
      .select('id', 'email', 'username', 'verified as isVerified')
      .where({ id })
      .first()

    return record || null
  }

  /**
   * Find a record by email.
   * @param {string} email - The email of the user to find.
   * @returns {Promise<Object|null>} The found record or null if the operation fails.
   */
  findByEmail = async (email) => {
    const record = await this.client(this.collection)
      .select(
        'id',
        'email',
        'username',
        'active as isActive',
        'verified as isVerified'
      )
      .where({ email })
      .first()

    return record || null
  }

  /**
   * Find a record by email or username.
   * @param {string} identifier - The email or username of the user to find.
   * @returns {Promise<Object|null>} The found record or null if the operation fails.
   */
  findByEmailOrUsername = async (identifier) => {
    const record = await this.client(this.collection)
      .select(
        'id',
        'email',
        'username',
        '_password as password',
        'verified as isVerified'
      )
      .where({ email: identifier })
      .orWhere({ username: identifier })
      .first()

    return record || null
  }

  /**
   * Create a new record in the database.
   * @param {Object} args - The arguments for the operation.
   * @param {string} args.email - The email of the user.
   * @param {string} args.password - The encrypted password of the user.
   * @returns {Promise<Object|null>} The newly created record or null if the operation fails.
   */
  create = async (args) => {
    const { email, password } = args

    const [record] = await this.client(this.collection)
      .insert({
        email,
        _password: password,
      })
      .returning(['id', 'email', 'username'])

    // For MySQL/SQLite compatibility, fetch the record after inserting
    if (!record) {
      return await this.client(this.collection)
        .select('id', 'email', 'username')
        .where({ email })
        .first()
    }

    return record || null
  }

  /**
   * Update a record by ID.
   * @param {string} id - The ID of the user to update.
   * @param {Object} args - The update parameters.
   * @param {string} args.password - The new encrypted password to store.
   * @returns {Promise<Object|null>} The updated record, or null if the operation fails.
   */
  update = async (id, args) => {
    const { password } = args

    const [updatedRecord] = await this.client(this.collection)
      .update({
        _password: password,
        updated_at: this.client.fn.now(),
      })
      .where({ id })
      .returning('email', 'username', 'verified as isVerified')

    // For MySQL/SQLite compatibility, fetch the record after inserting
    if (!updatedRecord) {
      return await this.client(this.collection)
        .select('id', 'email', 'username', 'verified as isVerified')
        .where({ id })
        .first()
    }

    return updatedRecord || null
  }

  /**
   * Verify a user by updating their record to mark as verified.
   * @param {string} id - The ID of the user.
   * @returns {Promise<Object|null>} The updated record or null if the operation fails.
   */
  verifyById = async (id) => {
    const [record] = await this.client(this.collection)
      .update({ verified: true })
      .where({ id })
      .returning(['id', 'email', 'username', 'verified as isVerified'])

    // For MySQL/SQLite compatibility, fetch the record after inserting
    if (!record) {
      return await this.client(this.collection)
        .select('id', 'email', 'username', 'verified as isVerified')
        .where({ id })
        .first()
    }

    return record || null
  }
}

const usersApi = new UsersAPI()

export { usersApi }
