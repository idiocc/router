import { equal } from '@zoroaster/assert'
import TempContext from 'temp-context'
import rqt from 'rqt'
import IdioContext from '../context/idio'
import Context from '../context'
import initRoutes, { watchRoutes } from '../../src'

const waitForChange = async (emitter, file) => {
  await new Promise((r, j) => emitter.on('modified', (path) => {
    if (path.endsWith(file)) return r()
    return j(new Error(`Unexpected change in ${path}`))
  }))
}

// when running in watch mode, tests will be restarted after each run
// because route modules are required from the package
// Zoroaster needs to be able to ignore watch dir

/** @type {Object.<string, (c: Context, t:TempContext, i:IdioContext)>} */
const T = {
  context: [Context, TempContext, IdioContext],
  async'updates the routes'({ routesDir, update }, { TEMP, add, resolve }, { start }) {
    const routes = await add(routesDir, TEMP)
    await add('test/fixture/layout', TEMP)
    const { app, router, url } = await start()
    const routesConf = await initRoutes(router, routes)
    app.use(router.routes())
    const emitter = watchRoutes(routesConf)
    let error
    try {
      const test = resolve('routes/get/test.js')
      await update(test, 'dynamic', 'dynamic-updated')
      await waitForChange(emitter, test)
      const res = await rqt(`${url}/test`)
      equal(res, 'test dynamic-updated route')
      await update(test, 'dynamic-updated', 'dynamic-updated2')
      await waitForChange(emitter, test)
      const res2 = await rqt(`${url}/getTest`)
      equal(res2, 'test dynamic-updated2 route')

      // dependency
      const layout = resolve('layout/index.js')
      await update(layout, 'test', 'test-dep-updated')
      await waitForChange(emitter, test)
      const res3 = await rqt(`${url}/getTest`)
      equal(res3, 'test-dep-updated dynamic-updated2 route')
    } catch (err) {
      error = err
    }
    emitter.stop()
    if (error) throw error
  },
}

export default T