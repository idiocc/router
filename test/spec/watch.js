import { equal } from 'zoroaster/assert'
import TempContext from 'temp-context'
import rqt from 'rqt'
import { join } from 'path'
import IdioContext from '../context/idio'
import Context from '../context'
import initRoutes, { watchRoutes } from '../../src'

class OSTempContext extends TempContext {
  constructor() {
    super()
    // otherwise no events will happen every second run?
    const r = Math.floor(Math.random()*10000)
    this._TEMP = join('test', `temp-${r}`)
  }
}

/** @type {Object.<string, (c: Context, t:TempContext, i:OSTempContext)>} */
const T = {
  context: [Context, OSTempContext, IdioContext],
  async 'updates the routes'({ routesDir, update }, { TEMP, add, resolve }, { start }) {
    const routes = await add(routesDir, TEMP)
    await add('test/fixture/layout', TEMP)
    const { app, router, url } = await start()
    const routesConf = await initRoutes(router, routes)
    app.use(router.routes())
    const emitter = watchRoutes(routesConf)
    await new Promise(r => setTimeout(r, 1000))
    let error
    try {
      const test = resolve('routes/get/test.js')
      await update(test, 'dynamic', 'dynamic-updated')
      await new Promise(r => {
        emitter.on('modified', r)
      })
      const res = await rqt(`${url}/test`)
      equal(res, 'test dynamic-updated route')
      await update(test, 'dynamic-updated', 'dynamic-updated2')
      await new Promise(r => {
        emitter.on('modified', r)
      })
      const res2 = await rqt(`${url}/getTest`)
      equal(res2, 'test dynamic-updated2 route')
    } catch (err) {
      error = err
    }
    emitter.stop()
    if (error) throw error
  },
}

export default T