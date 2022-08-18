import assert from 'node:assert'
// eslint-disable-next-line node/no-missing-import
import { test } from 'node:test'

test('top level test', async (t) => {
	await t.test('subtest 1', () => {
		assert.strictEqual(1, 1)
	})

	await t.test('subtest 2', () => {
		assert.strictEqual(2, 2)
	})
}).catch((e) => {
	process.exitCode = 1
	console.error(e)
})
