/* yarn example/ */
import rqt from 'rqt'
/* start example */
import core from '@idio/core'
import initRoutes from '../src'

const Server = async () => {
  const { app, url, router, middleware } = await core({
    bodyparser: {},
  }, { port: 5000 })
  await initRoutes(router, 'example/routes', {
    middlewareConfig: {
      post(route) {
        return ['bodyparser', route]
      },
    },
    aliases: {
      post: {
        '/example': ['/'],
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
