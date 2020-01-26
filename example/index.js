import rqt from 'rqt'
import { collect } from 'catchment'
/* start example */
import core from '@idio/idio'
import initRoutes from '../src'

const Server = async () => {
  const { app, url, router, middleware } = await core({
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
    example: {
      middlewareConstructor() {
        return async (ctx, next) => {
          ctx.test = 'test'
          await next()
        }
      },
    },
  })
  await initRoutes(router, 'example/routes', {
    middlewareConfig: {
      post(route) {
        return ['bodyparser', route]
      },
    },
    aliases: {
      post: {
        '/example': ['/example.html'],
      },
    },
    middleware,
  })
  app.use(router.routes())
  return { app, url }
}

/* end example */

(async () => {
  const { app, url } = await Server()
  console.log(url)
  console.log('GET /')
  const res = await rqt(`${url}`)
  console.log(' :: %s', res)
  console.log('POST "hello world" > / ')
  const res2 = await rqt(`${url}`, {
    data: { message: 'hello world' },
  })
  console.log(' :: %s', res2)
  await app.destroy()
})()
