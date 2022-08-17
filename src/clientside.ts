import type { Lyra, PropertiesSchema } from "@nearform/lyra";
import { create as createLyraDB, load as loadLyraDB } from "@nearform/lyra";

// "global/shared" registry
const dbs: Record<string, Lyra<PropertiesSchema>> = {};

export const getLyraDB = async (
	dbName: string
): Promise<Lyra<PropertiesSchema>> => {
	if (dbName in dbs) {
		return dbs[dbName]!;
	}

	const db = createLyraDB({ schema: { _: "string" } });

	const dbResponse = await fetch(`/assets/lyraDB_${dbName}.json`);
	const dbData = await dbResponse.json();

	loadLyraDB(db, dbData);
	dbs[dbName] = db;

	return db;
};
