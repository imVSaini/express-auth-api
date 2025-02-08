/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  const exists = await knex.schema.hasTable('profiles')

  if (!exists) {
    await knex.schema.createTable('profiles', (table) => {
      table.increments('id').primary()
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('phone_number', 15).unique().notNullable()
      table.date('dob').notNullable()
      table.string('region').defaultTo('IN')
      table.string('state').nullable()
      table.text('address').nullable()
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
  await knex.schema.dropTableIfExists('profiles')
}
