const { EventEmitter } = require('events');
const { relative } = require('path');
const { c } = require('../stdlib');
const { readRoutes, addRoutes } = require('./lib');
const { findChildrenInCache, onChange, findAllChildren } = require('./lib/watch');
const makeGetMiddleware = require('./lib/get-middleware');

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

module.exports=initRoutes

/**
 * @type {_idio.watchRoutes}
 */
const watchRoutes = ({
  dir, methods, router, aliases, middleware, middlewareConfig,
}) => {
  // if (!fsevents) throw new Error('fsevents is not available')
  /** @type {!Array<!FSWatcher>} */
  let watchers = []
  const emitter = new EventEmitter()

  const onRouteChange = (path) => {
    console.log(`${c('⌁', 'yellow')} %s`, relative('', path))
    onChange(path, dir, router, aliases)
    emitter.emit('modified', path)
  }

  Object.entries(methods).forEach(([method, paths]) => {
    Object.entries(paths).forEach(([p, fn]) => {
      const { path } = fn
      const analysis = findAllChildren(path)
      analysis
        .forEach((entry) => {
          const entryWatcher = watch(entry, () => {
            console.log(c(`☇ ${relative('', entry)}`, 'grey'))
            onRouteChange(path)
          })
          watchers.push(entryWatcher)
        })

      const watcher = watch(path, () => {
        onRouteChange(path)
      })
      watchers.push(watcher)
    }, [])
  }, {})

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

module.exports.watchRoutes = watchRoutes