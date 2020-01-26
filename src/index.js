import staticAnalysis from 'static-analysis'
import { EventEmitter } from 'events'
import { relative } from 'path'
import { c } from 'erte'
import { readRoutes, addRoutes } from './lib'
import { findChildrenInCache, onChange } from './lib/watch'
import makeGetMiddleware from './lib/get-middleware'

const watch = require(/* depack */ 'node-watch')

/**
 * @type {_idio.initRoutes}
 */
const initRoutes = async (router, dir = 'src/routes', {
  middlewareConfig = {},
  middleware = {},
  filter,
  aliases = {},
} = {}) => {
  const methods = await readRoutes(dir, { filter })

  Object.keys(methods).reduce((acc, method) => {
    const routes = methods[method]
    const getMiddleware = makeGetMiddleware(method, middlewareConfig, middleware)
    const methodAliases = aliases[method]
    const r = addRoutes(routes, method, router, getMiddleware, methodAliases)
    return {
      ...acc,
      [method]: r,
    }
  }, {})

  return { dir, methods, router, aliases }
}

export default initRoutes

/**
 * @type {_idio.watchRoutes}
 */
export const watchRoutes = async ({
  dir, methods, router, aliases, middleware, middlewareConfig,
}) => {
  // if (!fsevents) throw new Error('fsevents is not available')
  /** @type {!Array<!FSWatcher>} */
  let watchers = []
  const emitter = new EventEmitter()
  await Object.keys(methods).reduce(async (acc, m) => {
    await acc
    const method = methods[m]
    const keys = Object.keys(method)
    await keys.reduce(async (a, key) => {
      await a
      const { path } = method[key]
      const onRouteChange = () => {
        console.log(`${c('⌁', 'yellow')} %s`, relative('', path))
        onChange(path, dir, router, aliases)
        emitter.emit('modified', path)
      }
      const analysis = await staticAnalysis(path, {
        nodeModules: false,
      })
      analysis
        .filter(({ packageJson }) => !packageJson)
        .map(({ entry }) => entry)
        .forEach((entry) => {
          const entryWatcher = watch(entry)
          entryWatcher.on('change', () => {
            console.log(c(`☇ ${relative('', entry)}`, 'grey'))
            onRouteChange()
          })
          watchers.push(entryWatcher)
        })

      const watcher = watch(path, onRouteChange)
      watchers.push(watcher)
      // const c = findChildrenInCache(path)
    }, [])
  }, {})
  // watchers.forEach((w) => w.start())
  emitter.stop = () => {
    watchers.forEach(w => {
      w.close()
    })
  }
  return emitter
}

/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('../types').initRoutes} _idio.initRoutes
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('../types').watchRoutes} _idio.watchRoutes
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('fs').FSWatcher} fs.FSWatcher
 */