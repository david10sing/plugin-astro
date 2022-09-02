import assert from 'node:assert'
// eslint-disable-next-line node/no-missing-import
import { test } from 'node:test'

/**
 * WARNING: The tests in this suite have to be executed sequentially, they are
 *          not independent between each other.
 */
await test('dummy unit tests suite', async (t) => {
	await t.test('dummy test', () => {
		assert.equal(1, 1)
	})
})
