import type { Data, Lyra, PropertiesSchema } from '@nearform/lyra'
import { create as createLyraDB, load as loadLyraDB } from '@nearform/lyra'

// "global/shared" registry
const dbs: Record<string, Lyra<PropertiesSchema>> = {}

export const getLyraDB = async (
	dbName: string,
): Promise<Lyra<PropertiesSchema>> => {
	if (dbName in dbs) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return dbs[dbName]!
	}

	const db = createLyraDB({ schema: { _: 'string' }, edge: true })

	const dbResponse = await fetch(`/assets/lyraDB_${dbName}.json`)
	const dbData = await dbResponse.json() as Data<{ _: 'string' }>

	loadLyraDB(db, dbData)
	dbs[dbName] = db

	return db
}

export { search } from '@nearform/lyra'
