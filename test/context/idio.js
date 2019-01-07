import idioCore from '@idio/core'

export default class IdioContext {
  /**
   * @param {idioCore.MiddlewareConfig} middleware
   */
  async start(middleware = {}) {
    const res = await idioCore({
      ...middleware,
    }, {
      port: 0,
    })

    this.app = res.app
    return res
  }
  async _destroy () {
    if (this.app) await this.app.destroy()
  }
}
