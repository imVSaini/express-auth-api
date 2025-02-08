import conn from '../database/connection.js'

/**
 * SkeletonAPI class for handling Skeleton related operations.
 */
class SkeletonAPI {
  constructor() {
    this.client = conn
    this.collection = 'skeleton'
  }

  getCollection = async (args) => {
    const query = { id: args.id }
    const record = await this.client(this.collection)
      .select('*')
      .where(query)
      .first()

    return record || null
  }
}

export { SkeletonAPI }
