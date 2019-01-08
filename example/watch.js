/* yarn example/ */
import rqt from 'rqt'
import read from '@wrote/read'
import write from '@wrote/write'

const update = async (path, ...args) => {
  const c = await read(path)
  const cc = c.replace(...args)
  await write(path, cc)
}

/* start example */
import core from '@idio/core'
import initRoutes, { watchRoutes } from '../src'

const Server = async () => {
  const { app, url, router } = await core({}, { port: 5001 })
  const w = await initRoutes(router, 'example/watch-routes')
  app.use(router.routes())
  let watcher
  if (process.env.NODE_ENV != 'production') {
    watcher = watchRoutes(w)
  }
  return { app, url, watcher }
}

/* end example */

(async () => {
  const { app, url, watcher } = await Server()
  console.log(url)
  console.log('GET /')
  const res = await rqt(url)
  console.log(' :: %s', res)
  console.log('Update routes/get/index.js')
  const path = 'example/watch-routes/get/index.js'
  await update(path, 'initial', 'updated')
  await new Promise(r => {
    watcher.on('modified', r)
  })
  console.log('GET /')
  const res2 = await rqt(url)
  console.log(' :: %s', res2)
  await update(path, 'updated', 'initial')
  await app.destroy()
  watcher.stop()
})()
