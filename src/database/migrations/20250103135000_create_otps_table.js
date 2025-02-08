/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  const exists = await knex.schema.hasTable('otps')

  if (!exists) {
    await knex.schema.createTable('otps', (table) => {
      table.increments('id').primary()
      table.string('otp').nullable()
      table.timestamp('expires_at').nullable()
      table.integer('user_id').unique().notNullable().index()

      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())

      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTableIfExists('otps')
}
