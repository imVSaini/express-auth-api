import conn from '../database/connection.js'

/**
 * SessionsAPI class for handling session related operations.
 */
class SessionsAPI {
  constructor() {
    this.client = conn
    this.collection = 'sessions'
  }

  /**
   * Find a record by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object|null>} The found record or null if the operation fails.
   */
  findByUserId = async (userId) => {
    const record = await this.client(this.collection)
      .select('id', 'refresh_token as refreshToken', 'user_id as userId')
      .where({ user_id: userId })
      .first()

    return record || null
  }

  /**
   * Update a record by user ID.
   * @param {Object} args - The arguments for the operation.
   * @param {string} args.userId - The ID of the user.
   * @param {string} args.refreshToken - The new refresh token to store.
   * @returns {Promise<Object|null>} The updated record, or null if the operation fails.
   */
  update = async (args) => {
    const { userId, refreshToken } = args

    const [updatedRecord] = await this.client(this.collection)
      .update({
        refresh_token: refreshToken,
        updated_at: this.client.fn.now(),
      })
      .where({ user_id: userId })
      .returning('id', 'refresh_token as refreshToken', 'user_id as userId')

    // For MySQL/SQLite compatibility, fetch the record after inserting
    if (!updatedRecord) {
      return await this.client(this.collection)
        .select('id', 'refresh_token as refreshToken', 'user_id as userId')
        .where({ user_id: userId })
        .first()
    }

    return updatedRecord || null
  }

  /**
   * Find a record by user ID and update the refresh token,
   * otherwise inserts a new record with the provided user ID and refresh token.
   *
   * @param {Object} args - The arguments for the operation.
   * @param {string} args.userId - The ID of the user.
   * @param {string} args.refreshToken - The new refresh token to store.
   * @returns {Promise<Object|null>} The updated or newly created record, or null if the operation fails.
   */
  findByUserIdAndUpsert = async (args) => {
    const query = {
      user_id: args.userId,
      refresh_token: args.refreshToken,
    }

    const record = await this.client(this.collection)
      .select('id')
      .where({ user_id: args.userId })
      .first()

    if (record) {
      const [updatedRecord] = await this.client(this.collection)
        .update({
          refresh_token: args.refreshToken,
          updated_at: this.client.fn.now(),
        })
        .where({ user_id: args.userId })
        .returning('id', 'refresh_token as refreshToken', 'user_id as userId')

      // For MySQL/SQLite compatibility, fetch the record after inserting
      if (!updatedRecord) {
        return await this.client(this.collection)
          .select('id', 'refresh_token as refreshToken', 'user_id as userId')
          .where({ user_id: args.userId })
          .first()
      }

      return updatedRecord || null
    }

    const [newRecord] = await this.client(this.collection)
      .insert(query)
      .returning('id', 'refresh_token as refreshToken', 'user_id as userId')

    // For MySQL/SQLite compatibility, fetch the record after inserting
    if (!newRecord) {
      return await this.client(this.collection)
        .select('id', 'refresh_token as refreshToken', 'user_id as userId')
        .where({ user_id: args.userId })
        .first()
    }

    return newRecord || null
  }

  /**
   * Remove a record by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<number|null>} The removed record or null if the operation fails.
   */
  removeByUserId = async (userId) => {
    const record = await this.client(this.collection)
      .update({
        refresh_token: null,
        updated_at: this.client.fn.now(),
      })
      .where({ user_id: userId })

    return record || null
  }
}

const sessionsApi = new SessionsAPI()

export { sessionsApi }
