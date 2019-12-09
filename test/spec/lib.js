import { deepEqual, equal } from '@zoroaster/assert'
import Context from '../context'
import { readRoutes, addRoutes } from '../../src/lib'

/** @type {Object.<string, (c: Context)>} */
const TS = {
  context: Context,
  async 'reads routes'({ routesDir }) {
    const res = await readRoutes(routesDir)
    deepEqual(Object.keys(res), ['get', 'post'])
    deepEqual(Object.keys(res.get), ['/about', '/test'])
    deepEqual(Object.keys(res.post), ['/test'])
    equal(typeof res.get['/test'], 'function')
    equal(typeof res.get['/about'], 'function')
    equal(typeof res.post['/test'], 'function')
  },
  async 'reads ES6 routes'({ routesDirModules }) {
    const res = await readRoutes(routesDirModules, {
      defaultImports: true,
    })
    deepEqual(Object.keys(res), ['get', 'post'])
    deepEqual(Object.keys(res.get), ['/test'])
    deepEqual(Object.keys(res.post), ['/test'])
    equal(typeof res.get['/test'], 'function')
    equal(typeof res.post['/test'], 'function')
  },
  'adds routes for the GET method'() {
    const routes = {
      async '/test'(ctx) {
        ctx.body = 'hello world'
      },
      async '/test2'(ctx) {
        ctx.body = 'hello world 2'
      },
    }
    const addedRoutes = []
    const router = {
      get(...route) {
        addedRoutes.push(route)
      },
    }
    const middleware = async (ctx, next) => { await next() }
    const getMiddleware = route => [middleware, route]
    addRoutes(routes, 'get', router, getMiddleware, {
      '/test': ['/', '/alias'],
    })
    deepEqual(addedRoutes, [
      ['GET /test', '/test', middleware, routes['/test']],
      ['GET /', '/', middleware, routes['/test']],
      ['GET /alias', '/alias', middleware, routes['/test']],
      ['GET /test2', '/test2', middleware, routes['/test2']],
    ])
  },
}

export default TS