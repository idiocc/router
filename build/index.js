const { readRoutes, addRoutes } = require('./lib');
const { relative } = require('path');
let watch = require('node-watch'); if (watch && watch.__esModule) watch = watch.default;
const { c } = require('erte');
const { findChildrenInCache, onChange } = require('./lib/watch');
const makeGetMiddleware = require('./lib/get-middleware');
let staticAnalysis = require('static-analysis'); if (staticAnalysis && staticAnalysis.__esModule) staticAnalysis = staticAnalysis.default;
const { EventEmitter } = require('events');

/**
 * Initialise routes.
 * @param {Router} router Instance of the `koa-router`.
 * @param {string} [dir="src/routes"] Path to the directory with routes. Default `src/routes`.
 * @param {RoutesConfig} routesConfig Options for the router.
 * @param {Object.<string, (route: Middleware) => (string|Middleware)[]>} [routesConfig.middlewareConfig] The method-level middleware configuration: for each method it specifies how to construct the middleware chain. If the string is found in the chain, the middleware will be looked up in the `middleware` object.
 * @param {Object.<string, Middleware>} [routesConfig.middleware] The configured middleware object return by the Idio's `start` method.
 * @param {(string) => boolean} [routesConfig.filter] The filter for filenames. Defaults to importing JS and JSX.
 * @param {Object.<string, string[]>} [routesConfig.aliases] The map of aliases. Aliases can also be specified in routes by exporting the `aliases` property.
 * @returns The information necessary to call watch.
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

module.exports=initRoutes

       const watchRoutes = async ({
  dir, methods, router, aliases, middleware, middlewareConfig,
}) => {
  // if (!fsevents) throw new Error('fsevents is not available')
  /** @type {import('fs').FSWatcher[]} */
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
 * @typedef {import('koa-router')} Router
 */

/* documentary types/index.xml */
/**
 * @typedef {import('koa').Middleware} Middleware
 *
 * @typedef {Object} RoutesConfig Options for the router.
 * @prop {Object.<string, (route: Middleware) => (string|Middleware)[]>} [middlewareConfig] The method-level middleware configuration: for each method it specifies how to construct the middleware chain. If the string is found in the chain, the middleware will be looked up in the `middleware` object.
 * @prop {Object.<string, Middleware>} [middleware] The configured middleware object return by the Idio's `start` method.
 * @prop {(string) => boolean} [filter] The filter for filenames. Defaults to importing JS and JSX.
 * @prop {Object.<string, string[]>} [aliases] The map of aliases. Aliases can also be specified in routes by exporting the `aliases` property.
 */


module.exports.watchRoutes = watchRoutes