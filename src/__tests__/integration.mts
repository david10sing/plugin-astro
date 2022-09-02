import { $, cd, fs } from 'zx'
import type { Data, PropertiesSchema } from '@lyrasearch/lyra'
import { create as createLyraDB, load as loadLyraDB, search } from '@lyrasearch/lyra'
import { dirname, join } from 'node:path'
import assert from 'node:assert'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
// eslint-disable-next-line node/no-missing-import
import { test } from 'node:test'


// ES Modules don't provide the `__dirname` global variable.
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const baseDir = join(__dirname, '..', '..')
const artifactsDir = join(baseDir, 'artifacts')
const prjName = 'test-astro-website'
const prjDir = join(artifactsDir, prjName)

/**
 * WARNING: The tests in this suite have to be executed sequentially, they are
 *          not independent between each other.
 */

await test('package publication', async (t) => {
	let pkgFileName: string

	// Preparing environment
	cd(baseDir)
	await fs.rm(artifactsDir, { recursive: true, force: true })

	await t.test('package can be built', async () => {
		const buildResult = await $`yarn build`
		assert.equal(buildResult.exitCode, 0)
	})

	await t.test('package can be packed', async () => {
		await fs.mkdirp(artifactsDir)
		const packResult = await $`npm pack --json --pack-destination ./artifacts`
		const parsedPackResult = JSON.parse(packResult.stdout) as {
			version: string
		}[]

		const version = parsedPackResult?.[0]?.version
		assert.equal(typeof version, 'string')

		const pkgFileNameBase = join(
			baseDir,
			'artifacts',
			'lyrasearch-plugin-astro',
		)

		// We randomise the package name to avoid problems with npm/yarn cache
		const salt = randomBytes(6).toString('hex')
		await fs.move(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			`${pkgFileNameBase}-${version!}.tgz`,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			`${pkgFileNameBase}-${salt}-${version!}.tgz`,
		)

		// We need to save the generated package's filepath to use it later
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		pkgFileName = `${pkgFileNameBase}-${salt}-${version!}.tgz`
	})

	await t.test('package can be installed', async () => {
		cd(artifactsDir)
		const createProjectResult =
			await $`yarn create astro ${prjName} -- --git --install --typescript strictest --template minimal`
		assert.equal(createProjectResult.exitCode, 0)

		// Trying to install our package in the Astro project
		cd(prjDir)
		const installPluginResult = await $`yarn add --dev file:/${pkgFileName}`
		assert.equal(installPluginResult.exitCode, 0)
	})
})

await test('plugin behavior', async (t) => {
	await t.test(
		'installed plugin is able to generate lyra DB at build time',
		async () => {
			// Copying fixtures into the Astro project
			await fs.copy(
				join(__dirname, 'fixtures', 'astro.config.mjs'),
				join(prjDir, 'astro.config.mjs'),
				{ overwrite: true },
			)
			await fs.copy(
				join(__dirname, 'fixtures', 'src', 'pages'),
				join(prjDir, 'src', 'pages'),
				{ overwrite: true, recursive: true },
			)

			cd(prjDir)

			// astro build is successful
			const astroBuildResult = await $`yarn build` // Building the astro site
			assert.equal(astroBuildResult.exitCode, 0)

			// The Lyra DBs have been generated
			assert.ok(
				fs.existsSync(join(prjDir, 'dist', 'assets', 'lyraDB_animals.json')),
			)
			assert.ok(
				fs.existsSync(join(prjDir, 'dist', 'assets', 'lyraDB_games.json')),
			)
		},
	)

	await t.test('generated DBs have indexed pages content', async () => {
		// Loading "animals DB"
		const rawAnimalsData = await readFile(
			join(prjDir, 'dist', 'assets', 'lyraDB_animals.json'),
			{ encoding: 'utf8' },
		)
		const animalsData = JSON.parse(rawAnimalsData) as Data<PropertiesSchema>
		const animalsDB = createLyraDB({ schema: { _: 'string' }, edge: true })
		loadLyraDB(animalsDB, animalsData)

		// Loading "games DB"
		const rawGamesData = await readFile(
			join(prjDir, 'dist', 'assets', 'lyraDB_games.json'),
			{ encoding: 'utf8' },
		)
		const gamesData = JSON.parse(rawGamesData) as Data<PropertiesSchema>
		const gamesDB = createLyraDB({ schema: { _: 'string' }, edge: true })
		loadLyraDB(gamesDB, gamesData)

		// Search results seem reasonable
		const catSearchResult = search(animalsDB, { term: 'cat' })
		assert.ok(catSearchResult.count === 1)
		assert.ok((catSearchResult.hits[0] as unknown as { path: string }).path === '/animals_cat/')

		const dogSearchResult = search(animalsDB, { term: 'dog' })
		assert.ok(dogSearchResult.count === 1)
		assert.ok((dogSearchResult.hits[0] as unknown as { path: string }).path === '/animals_dog/')

		const domesticSearchResult = search(animalsDB, { term: 'domestic' })
		assert.ok(domesticSearchResult.count === 2)

		// We do not have content about turtles
		const turtleSearchResult = search(animalsDB, { term: 'turtle' })
		assert.ok(turtleSearchResult.count === 0)
	})
})
