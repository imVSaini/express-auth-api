/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  const exists = await knex.schema.hasTable('users')

  if (!exists) {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary()
      table.string('username').unique().defaultTo(knex.fn.uuid())
      table.string('email').unique().notNullable().index()
      table.string('_password').notNullable()
      table.boolean('verified').defaultTo(false)
      table.boolean('active').defaultTo(true)

      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTableIfExists('users')
}
