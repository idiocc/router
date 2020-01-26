import idio from '@idio/idio'

export default class IdioContext {
  /**
   * @param {import('@idio/idio').MiddlewareConfig} middleware
   */
  async start(middleware = {}) {
    const res = await idio(middleware, {
      port: null,
    })

    this.app = res.app
    return res
  }
  async _destroy () {
    if (this.app) await this.app.destroy()
  }
}
