import { equal } from '@zoroaster/assert'
import rqt from 'rqt'
import { collect } from 'catchment'
import IdioContext from '../context/idio'
import Context from '../context'
import initRoutes from '../../src'

/** @type {Object.<string, (i: IdioContext, c:Context)>} */
const TS = {
  context: [IdioContext, Context],
  async 'does not throw when files are found'({ start }, { routesDirWithFiles }) {
    const { router } = await start()
    await initRoutes(router, routesDirWithFiles)
  },
  async 'sets up exported middleware'({ start }) {
    const tt = 'test'
    const { app, url, router, middleware } = await start({
      bodyparser: {
        middlewareConstructor() {
          return async (ctx, next) => {
            const data = await collect(ctx.req)
            ctx.req.body = JSON.parse(data)
            ctx.request.body = JSON.parse(data)
            await next()
          }
        },
      },
      test: {
        middlewareConstructor() {
          return async (ctx, next) => {
            ctx.test = tt
            await next()
          }
        },
      },
    })
    await initRoutes(router, 'test/fixture/routes-mw', {
      middleware,
    })
    app.use(router.routes())
    const message = 'message'
    const post = await rqt(`${url}/test-mw`, {
      data: { message },
    })
    equal(post, `${tt} default post request: ${message}`)
  },
  async 'uses routes'({ start }, { routesDir }) {
    let getMiddlewareCalls = 0
    const { app, url, router, middleware } = await start({
      bodyparser: {
        middlewareConstructor() {
          return async (ctx, next) => {
            const data = await collect(ctx.req)
            ctx.req.body = JSON.parse(data)
            ctx.request.body = JSON.parse(data)
            await next()
          }
        },
      },
    })

    await initRoutes(router, routesDir, {
      aliases: {
        get: {
          '/test': ['/alias'],
        },
        post: {
          '/test': ['/alias'],
        },
      },
      middlewareConfig: {
        get(route) {
          return [
            async (ctx, next) => {
              getMiddlewareCalls += 1
              await next()
            },
            route,
          ]
        },
        post(route) {
          return ['bodyparser', route]
        },
      },
      middleware,
    })
    app.use(router.routes())

    const get = await rqt(`${url}/test`)
    equal(get, 'test dynamic route')
    equal(getMiddlewareCalls, 1)

    const getAlias = await rqt(`${url}/alias`)
    equal(getAlias, 'test dynamic route')
    equal(getMiddlewareCalls, 2)

    const getModuleAlias = await rqt(`${url}/getTest`)
    equal(getModuleAlias, 'test dynamic route')
    equal(getMiddlewareCalls, 3)

    const message = 'hello world'

    const post = await rqt(`${url}/test`, {
      data: { message },
    })
    equal(post, `test default post request: ${message}`)

    const postAlias = await rqt(`${url}/alias`, {
      data: { message },
    })
    equal(postAlias, `test default post request: ${message}`)
  },
}

export default TS