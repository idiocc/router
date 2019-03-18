import readDirStructure from '@wrote/read-dir-structure'
import { join, resolve } from 'path'
import { c } from 'erte'

export const removeExtension = (route) => {
  return `${route.replace(/\.jsx?$/, '')}`
}

/**
 * Requires the route module from the file.
 */
export const importRoute = (dir, file) => {
  const route = `/${removeExtension(file)}`
  const path = resolve(dir, file)
  const mod = require(path)
  const fn = mod.__esModule ? mod.default : mod
  const { aliases, middleware } = mod
  return { route, fn, path, aliases, middleware }
}

const filterJsx = route => /\.jsx?$/.test(route)

const reducePaths = (acc, { route, fn, path, aliases }) => {
  fn._route = true
  fn.path = path
  if (aliases) fn.aliases = aliases
  return {
    ...acc,
    [route]: fn,
  }
}

export const getName = (method, path) => `${method.toUpperCase()} ${path}`

/**
 * Adds the read routes to the `koa-router` instance.
 * @param {Object} routes Routes for a single method.
 * @param {string} method The method.
 * @param {import('koa-router')} router The instance of the router.
 * @param {function} [getMiddleware] The function which returns the middleware list for the given route.
 * @param {{string:[string]}} [aliases] The map of aliases.
 * @returns {{string:[string]}} A map where keys are routes and values are aliases for that route.
 */
export const addRoutes = (routes, method, router, getMiddleware, aliases = {}) => {
  const res = Object.keys(routes).reduce((acc, route) => {
    const fn = routes[route]
    const { aliases: ma = [], middleware: gm } = fn
    const middleware = getMiddleware(fn, { getMiddleware: gm, method, route })
    const name = getName(method, route)
    router[method](name, route, ...middleware)

    const a = aliases[route] || []
    const aa = [...a, ...ma]
    aa.forEach((alias) => {
      const aliasName = getName(method, alias)
      router[method](aliasName, alias, ...middleware)
    })
    return { ...acc, [route]: aa }
  }, {})
  return res
}

/**
 * Reads routes from the directory.
 */
export const readRoutes = async (dir, {
  filter = filterJsx,
} = {}) => {
  const { content: topLevel } = await readDirStructure(dir)
  const methods = Object.keys(topLevel).reduce((acc, method) => {
    const { type } = topLevel[method]
    if (type != 'Directory') return acc
    const { content: files } = topLevel[method]
    const modules = Object.keys(files)
      .filter(filter)
      .map(file => {
        const methodPath = join(dir, method)
        const route = importRoute(methodPath, file)
        if (typeof route.fn != 'function') {
          console.log(c(`${join(methodPath, file)} does not export a function.`, 'yellow'))
          return false
        }
        return route
      }).filter(Boolean)

    const routes = modules.reduce(reducePaths, {})
    return {
      ...acc,
      [method]: routes,
    }
  }, {})
  return methods
}