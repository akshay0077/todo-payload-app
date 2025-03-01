// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Todos } from './collections/Todos'
import { Categories } from './collections/Categories'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const { slug } = Users
const { resolve } = path
const { PAYLOAD_SECRET, DATABASE_URI } = process.env

if (!PAYLOAD_SECRET) {
  throw new Error('env PAYLOAD_SECRET is Required!')
}

if (!DATABASE_URI) {
  throw new Error('env DATABASE_URI is Required!')
}

export default buildConfig({
  admin: {
    user: slug,
    importMap: {
      baseDir: resolve(dirname),
    },
  },
  collections: [Users, Media, Todos, Categories],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: PAYLOAD_SECRET,
  typescript: {
    outputFile: resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URI,
    },
  }),
  sharp,
  plugins: [],
})
