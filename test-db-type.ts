import { db } from './src/lib/database'

type DbType = typeof db
type DbKeys = keyof DbType

const keys: DbKeys[] = [] as any
console.log('DB methods:', Object.keys(db))
