import makeTestSuite from '@zoroaster/mask'
import rqt from 'rqt'
import ensurePath from '@wrote/ensure-path'
import TempContext from 'temp-context'
import IdioContext from '../context/idio'
import initRoutes from '../../src'

export default makeTestSuite('test/result', {
  context: [IdioContext, TempContext],
  /**
   * @param {IdioContext}
   * @param {TempContext}
   */
  async getResults({ start }, { write, TEMP }) {
    const p = 'get/test.js'
    await ensurePath(`${TEMP}/${p}`)
    await write(p, this.input)
    const { app, url, router, middleware } = await start({
      middleware: {
        use: false,
        middlewareConstructor() {
          return async (ctx, next) => {
            await next()
            ctx.body = `middleware-${ctx.body}`
          }
        },
      },
    })
    await initRoutes(router, TEMP, {
      middleware,
    })
    app.use(router.routes())
    const data = await rqt(`${url}/test`)
    return data
  },
})