import { readRoutes, addRoutes } from './lib'
import { relative } from 'path'
import { findChildrenInCache, onChange } from './lib/watch'
import makeGetMiddleware from './lib/get-middleware'
import { EventEmitter } from 'events'
let fsevents
try {
  fsevents = require('fsevents')
} catch (e) { /* ignore fsevents */ }

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

export default initRoutes

export const watchRoutes = ({
  dir, methods, router, aliases, middleware, middlewareConfig,
}) => {
  if (!fsevents) throw new Error('fsevents is not available')
  let watchers = []
  const emitter = new EventEmitter()
  Object.keys(methods).reduce((acc, m) => {
    const method = methods[m]
    const keys = Object.keys(method)
    keys.reduce((a, key) => {
      const { path } = method[key]
      const watcher = fsevents(path)
      watcher.on('modified', () => {
        console.log('⌁ %s', relative('', path))
        onChange(path, dir, router, aliases)
        emitter.emit('modified', path)
      })
      watchers.push(watcher)
      // const c = findChildrenInCache(path)
    }, [])
  }, {})
  watchers.forEach((w) => w.start())
  emitter.stop =  () => {
    watchers.forEach(w => {
      w.stop()
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
