import type { Data, Lyra, PropertiesSchema } from '@lyrasearch/lyra'
import { create as createLyraDB, load as loadLyraDB } from '@lyrasearch/lyra'

const dbs: Record<string, Lyra<PropertiesSchema>> = {}

export async function getLyraDB(dbName: string): Promise<Lyra<PropertiesSchema>> {
  if (dbName in dbs) {
    return dbs[dbName]
  }

  const db = await createLyraDB({ schema: { _: 'string' }, edge: true })

  const dbResponse = await fetch(`/assets/lyraDB_${dbName}.json`)
  const dbData = (await dbResponse.json()) as Data<{ _: 'string' }>

  await loadLyraDB(db, dbData)
  dbs[dbName] = db

  return db
}

export { search } from '@lyrasearch/lyra'
