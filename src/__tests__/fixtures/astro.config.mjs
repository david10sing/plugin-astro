/* eslint-disable node/no-missing-import */
/* eslint-disable @typescript-eslint/no-unsafe-call */

/**
 * Custom config file for testing purposes
 */

import { defineConfig } from 'astro/config'
import lyra from '@lyrasearch/plugin-astro'

// https://astro.build/config
export default defineConfig({
	integrations: [
		lyra({
			animals: { pathMatcher: /animals_.+$/ },
			games: { pathMatcher: /games_.+$/ },
		}),
	],
	trailingSlash: 'always'
})
