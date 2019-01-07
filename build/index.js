const { readRoutes, addRoutes } = require('./lib');

/**
 * Initialise routes.
 * @param {Router} router Instance of the `koa-router`.
 * @param {string} [dir="src/routes"] Path to the directory with routes. Default `src/routes`.
 * @param {RoutesConfig} routesConfig Options for the router.
 * @param {Object.<string, (route: Middleware) => (string|Middleware)[]>} [routesConfig.middlewareConfig] The method-level middleware configuration: for each method it specifies how to construct the middleware chain. If the string is found in the chain, the middleware will be looked up in the `middleware` object.
 * @param {Object.<string, Middleware>} [routesConfig.middleware] The configured middleware object return by the Idio's `start` method.
 * @param {(string) => boolean} [routesConfig.filter] The filter for filenames. Defaults to importing JS and JSX.
 * @param {Object.<string, string[]>} [routesConfig.aliases] The map of aliases. Aliases can also be specified in routes by exporting the `aliases` property.
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

  return methods
}

const makeGetMiddleware = (method, middleware, appMiddleware) => {
  /**
   * A function specific for each method which returns full middleware chain for routes. The returned array consists of strings which are keys in the appMiddleware object.
   * @type {(route: function) => string[]}
   */
  const getChain = middleware[method]
  if (!getChain) {
    return route => [route]
  }
  const getMiddleware = (route) => {
    const chain = getChain(route)
    const m = chain.map((s) => {
      if (typeof s == 'string') {
        return appMiddleware[s]
      }
      return s
    })
    return m
  }
  return getMiddleware
}

module.exports=initRoutes

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
