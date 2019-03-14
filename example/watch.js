/* yarn example/ */
import rqt from 'rqt'
import read from '@wrote/read'
import write from '@wrote/write'
import frame from 'frame-of-mind'

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
    watcher = await watchRoutes(w)
  }
  return { app, url, watcher }
}

/* end example */

(async () => {
  const { app, url, watcher } = await Server()
  console.log(url)
  console.log('GET / RESULT:')
  const res = await rqt(url)
  console.log(frame(res))
  const path = 'example/watch-routes/get/index.js'
  const p = new Promise(r => {
    watcher.once('modified', r)
  })
  console.log('Update routes/get/index.js')
  await update(path, 'initial', 'updated')
  await p
  console.log('GET / RESULT:')
  const res2 = await rqt(url)
  console.log(frame(res2))
  await app.destroy()
  watcher.stop()
  // restore
  await update(path, 'updated', 'initial')
})()
