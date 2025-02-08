import bcrypt from 'bcrypt'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { config } from 'dotenv'
import rootDir from '../../utils/rootdir.js'

config({ path: path.resolve(rootDir, '.env') })

/**
 * Seeds the users and roles tables in the database.
 *
 * This function reads user data from a JSON file, hashes the passwords,
 * and inserts the users into the 'users' table. It then assigns the 'super_admin'
 * role to each inserted user and inserts the role data into the 'roles' table.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async function (knex) {
  const users = await JSON.parse(
    readFileSync(path.resolve(rootDir, 'src/database/data/admin.json'), 'utf-8')
  )

  const data = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user._password, 10)
      return { ...user, _password: hashedPassword }
    })
  )

  await knex('users').del()
  await knex('users').insert(data)

  const insertedUser = await knex('users').select('id')
  const [roleData] = insertedUser.map(({ id }) => ({
    user_id: id,
    role: 'super_admin',
  }))

  await knex('roles').del()
  await knex('roles').insert(roleData)
}
