import type { InsertConfig, Lyra, PropertiesSchema, SearchParams } from '@lyrasearch/lyra'
import { create as createLyraDB, insert as insertIntoLyraDB, save as saveLyraDB } from '@lyrasearch/lyra'
import type { AstroConfig, AstroIntegration, RouteData } from 'astro'
import { compile } from 'html-to-text'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join as joinPath } from 'node:path'

interface AstroPage {
  pathname: string
}

interface AstroConfigDoneArgs {
  config: AstroConfig
}

interface AstroBuildDoneArgs {
  pages: AstroPage[]
  routes: RouteData[]
}

export const defaultSchema: PropertiesSchema = {
  path: 'string',
  title: 'string',
  h1: 'string',
  content: 'string'
}

export type PageIndexSchema = typeof defaultSchema

export type LyraOptions = Partial<InsertConfig<PageIndexSchema>> & {
  /**
   * Controls whether generatedFilePath is filter
   * using case sensitive or case insensitive comparison
   * @default false
   *
   */
  caseSensitive?: boolean
  pathMatcher: RegExp
  contentSelectors?: string[]
  searchOptions?: Omit<SearchParams<PageIndexSchema>, 'term'> | undefined
}

const PKG_NAME = '@lyrasearch/plugin-astro'

const titleConverter = compile({
  baseElements: { selectors: ['title'] }
})
const h1Converter = compile({
  baseElements: { selectors: ['h1'] }
})

async function prepareLyraDb(
  dbConfig: LyraOptions,
  pages: AstroPage[],
  routes: RouteData[]
): Promise<Lyra<PageIndexSchema>> {
  const contentConverter = compile({
    baseElements: {
      selectors: dbConfig.contentSelectors?.length ? dbConfig.contentSelectors : ['body']
    }
  })

  // pathname is usually of the form `some/path/`, while `r.route` usually takes
  // the form `/some/path`. That's why we strip start & end slashes to compare.
  const pathsToBeIndexed = pages
    .filter(({ pathname }) => dbConfig.pathMatcher.test(pathname))
    .map(({ pathname }) => ({
      pathname,
      generatedFilePath: routes.filter(r => {
        const route = r.route.replace(/(^\/|\/$)/g, '')
        const pathName = pathname.replace(/(^\/|\/$)/g, '')

        if (dbConfig.caseSensitive) {
          return route.toLowerCase() === pathName.toLowerCase()
        }

        return route === pathName
      })[0]?.distURL?.pathname
    }))
    .filter(({ generatedFilePath }) => !!generatedFilePath)

  const lyraDB = await createLyraDB({
    schema: defaultSchema,
    ...(dbConfig.language ? { defaultLanguage: dbConfig.language } : undefined)
  })

  for (const { pathname, generatedFilePath } of pathsToBeIndexed) {
    const htmlContent = readFileSync(generatedFilePath as string, { encoding: 'utf8' })

    const title = titleConverter(htmlContent) ?? ''
    const h1 = h1Converter(htmlContent) ?? ''
    const content = contentConverter(htmlContent)

    await insertIntoLyraDB(
      lyraDB,
      {
        path: `/${pathname}`,
        title,
        h1,
        content
      },
      dbConfig.language ? { language: dbConfig.language } : undefined
    )
  }

  return lyraDB
}

export function createPlugin(options: Record<string, LyraOptions>): AstroIntegration {
  let config: AstroConfig

  return {
    name: PKG_NAME,
    hooks: {
      'astro:config:done': function ({ config: cfg }: AstroConfigDoneArgs): void {
        config = cfg
      },
      'astro:build:done': async function ({ pages, routes }: AstroBuildDoneArgs): Promise<void> {
        const assetsDir = joinPath(config.outDir.pathname, 'assets')
        if (!existsSync(assetsDir)) {
          mkdirSync(assetsDir)
        }

        for (const [dbName, dbConfig] of Object.entries(options)) {
          const namedDb = await prepareLyraDb(dbConfig, pages, routes)

          writeFileSync(joinPath(assetsDir, `lyraDB_${dbName}.json`), JSON.stringify(await saveLyraDB(namedDb)), {
            encoding: 'utf8'
          })
        }
      }
    }
  }
}

export default createPlugin
