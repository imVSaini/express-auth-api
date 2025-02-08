/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  const exists = await knex.schema.hasTable('password_reset_tokens')

  if (!exists) {
    await knex.schema.createTable('password_reset_tokens', (table) => {
      table.increments('id').primary()
      table.text('reset_token').nullable()
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
  await knex.schema.dropTableIfExists('password_reset_tokens')
}
