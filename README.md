# Lyra's Astro Plugin

This package is a (still experimental) [Lyra](https://lyrajs.io) integration for
[Astro](https://astro.build).

## Usage

```typescript
// In `astro.config.mjs`
import lyra from '@lyrasearch/plugin-astro'

// https://astro.build/config
export default defineConfig({
  integrations: [
    lyra({
      // We can generate more than one DB, with different configurations
      mydb: {
        // Required. Only pages matching this path regex will be indexed
        pathMatcher: /blog\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.+$/,

        // Optional. 'english' by default
        language: 'spanish',

        // Optional. ['body'] by default. Use it to constraint what is used to
        // index a page.
        contentSelectors: ['h1', 'main'],
      },
    }),
  ],
});
```

When running the `astro build` command, a new DB file will be persisted in the
`dist/assets` directory. For the particular case of this example, it will be
saved in the file `dist/assets/lyraDB_mydb.json`.
