/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  const exists = await knex.schema.hasTable('roles')

  if (!exists) {
    await knex.schema.createTable('roles', (table) => {
      table.increments('id').primary()
      table
        .enum('role', ['subscriber', 'editor', 'admin', 'super_admin'])
        .defaultTo('subscriber')
      table.text('description').nullable()
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
  await knex.schema.dropTableIfExists('roles')
}
