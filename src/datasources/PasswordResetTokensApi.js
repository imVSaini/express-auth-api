import conn from '../database/connection.js'

/**
 * PasswordResetTokensAPI class for handling Skeleton related operations.
 */
class PasswordResetTokensAPI {
  constructor() {
    this.client = conn
    this.collection = 'password_reset_tokens'
  }

  /**
   * Find a record based on dynamic criteria.
   * @param {Object} args - The arguments for the operation.
   * @param {string} args.userId - The ID of the user.
   * @param {string} args.token - The reset token.
   * @returns {Promise<Object|null>} The found record or null if the operation fails.
   */
  findOne = async (args) => {
    const query = {
      ...(args?.token && { reset_token: args.token }),
      ...(args?.userId && { user_id: args.userId }),
    }

    if (!Object.keys(query).length) {
      return null
    }

    const record = await this.client(this.collection)
      .select(
        'id',
        'reset_token as resetToken',
        'expires_at as expiresAt',
        'user_id as userId'
      )
      .where(query)
      .first()

    return record || null
  }

  /**
   * Create a new record in the database.
   * @param {Object} args - The arguments for the operation.
   * @param {string} args.userId - The ID of the user.
   * @param {string} args.token - The reset token.
   * @param {Date} args.expiresAt - The expiration date of the token.
   * @returns {Promise<Object|null>} The newly created record or null if the operation fails.
   */
  create = async (args) => {
    const { token, expiresAt, userId } = args

    const [record] = await this.client(this.collection)
      .insert({
        reset_token: token,
        expires_at: expiresAt,
        user_id: userId,
      })
      .returning([
        'id',
        'reset_token as resetToken',
        'expires_at as expiresAt',
        'user_id as userId',
      ])

    // For MySQL/SQLite compatibility, fetch the record after inserting
    if (!record) {
      return await this.client(this.collection)
        .select(
          'id',
          'reset_token as resetToken',
          'expires_at as expiresAt',
          'user_id as userId'
        )
        .where({ user_id: userId })
        .first()
    }

    return record || null
  }

  /**
   * Find a record by user ID and update the reset token,
   * otherwise inserts a new record with the provided user ID and reset token.
   *
   * @param {Object} args - The arguments for the operation.
   * @param {string} args.userId - The ID of the user.
   * @param {string} args.token - The new reset token to store.
   * @param {Date} args.expiresAt - The expiration date of the token.
   * @returns {Promise<Object|null>} The updated or newly created record, or null if the operation fails.
   */
  upsert = async (args) => {
    const query = {
      user_id: args.userId,
      reset_token: args.token,
      expires_at: args.expiresAt,
    }

    const record = await this.client(this.collection)
      .select('id')
      .where({ user_id: args.userId })
      .first()

    if (record) {
      const [updatedRecord] = await this.client(this.collection)
        .update({
          reset_token: args.token,
          expires_at: args.expiresAt,
          updated_at: this.client.fn.now(),
        })
        .where({ user_id: args.userId })
        .returning(
          'id',
          'reset_token as resetToken',
          'expires_at as expiresAt',
          'user_id as userId'
        )

      // For MySQL/SQLite compatibility, fetch the record after inserting
      if (!updatedRecord) {
        return await this.client(this.collection)
          .select(
            'id',
            'reset_token as resetToken',
            'expires_at as expiresAt',
            'user_id as userId'
          )
          .where({ user_id: args.userId })
          .first()
      }

      return updatedRecord || null
    }

    const [newRecord] = await this.client(this.collection)
      .insert(query)
      .returning(
        'id',
        'reset_token as resetToken',
        'expires_at as expiresAt',
        'user_id as userId'
      )

    // For MySQL/SQLite compatibility, fetch the record after inserting
    if (!newRecord) {
      return await this.client(this.collection)
        .select(
          'id',
          'reset_token as resetToken',
          'expires_at as expiresAt',
          'user_id as userId'
        )
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
        reset_token: null,
        expires_at: null,
        updated_at: this.client.fn.now(),
      })
      .where({ user_id: userId })

    return record || null
  }
}

const passwordResetTokensApi = new PasswordResetTokensAPI()

export { passwordResetTokensApi }
