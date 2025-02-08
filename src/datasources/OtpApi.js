import conn from '../database/connection.js'

/**
 * OtpAPI class for handling OTP related operations.
 */
class OtpAPI {
  constructor() {
    this.client = conn
    this.collection = 'otps'
  }

  /**
   * Create a new record in the database.
   * @param {Object} args - The arguments for the operation.
   * @param {string} args.userId - The ID of the user.
   * @param {string} args.otp - The OTP code.
   * @param {Date} args.otpExpiresAt - The expiration time of the OTP.
   * @returns {Promise<Object|null>} The newly created record or null if the operation fails.
   */
  create = async (args) => {
    const query = {
      user_id: args.userId,
      otp: args.otp,
      expires_at: args.otpExpiresAt,
    }

    const [record] = await this.client(this.collection)
      .insert(query)
      .returning([
        'id',
        'otp',
        'expires_at as otpExpiresAt',
        'user_id as userId',
      ])

    // For MySQL/SQLite compatibility, fetch the record after inserting
    if (!record) {
      return await this.client(this.collection)
        .select('id', 'otp', 'expires_at as otpExpiresAt', 'user_id as userId')
        .where({ user_id: args.userId })
        .first()
    }

    return record || null
  }

  /**
   * Find a record by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object|null>} The found record or null if the operation fails.
   */
  findByUserId = async (userId) => {
    const record = await this.client(this.collection)
      .select('id', 'otp', 'expires_at as otpExpiresAt', 'user_id as userId')
      .where({ user_id: userId })
      .first()

    return record || null
  }

  /**
   * Find a record by user ID and update the OTP and expiration time if it exists.
   * @param {Object} args - The arguments for the operation.
   * @param {string} args.userId - The ID of the user.
   * @param {string} args.otp - The OTP code.
   * @param {Date} args.otpExpiresAt - The expiration time of the OTP.
   * @returns {Promise<Object|null>} The updated record or null if the operation fails.
   */
  findByUserIdAndUpdate = async (args) => {
    const { userId, otp, otpExpiresAt } = args

    const record = await this.client(this.collection)
      .update({
        otp,
        expires_at: otpExpiresAt,
        updated_at: this.client.fn.now(),
      })
      .where({ user_id: userId })

    return record || null
  }

  /**
   * Remove a record by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<number|null>} The removed record or null if the operation fails.
   */
  removeByUserId = async (userId) => {
    const record = await this.client(this.collection)
      .update({
        otp: null,
        expires_at: null,
        updated_at: this.client.fn.now(),
      })
      .where({ user_id: userId })

    return record || null
  }
}

const otpApi = new OtpAPI()

export { otpApi }
