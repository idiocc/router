const makeGetMiddleware = (method, methodMiddleware, appMiddleware) => {
  const getMethodChain = methodMiddleware[method]
  const thunk = makeThunk(appMiddleware, getMethodChain)
  return thunk
}

module.exports=makeGetMiddleware

/**
 * Returns a function that will return the middleware chain.
 */
const makeThunk = (appMiddleware, getMethodChain) => {
  return (route, { getMiddleware, method: m, route: r } = {}) => {
    let chain
    if (getMiddleware) {
      chain = getMiddleware(route)
    } else if (getMethodChain) {
      chain = getMethodChain(route)
    }
    if (chain) {
      const c = mapChain(chain, appMiddleware, m, r)
      return c
    }
    return [route]
  }
}

const mapChain = (chain, appMiddleware, method, route) => {
  const m = chain.map((s) => {
    if (typeof s == 'string') {
      const mw = appMiddleware[s]
      if (!mw) throw new Error(`App middleware ${s} missing in ${method}${route}`)
      return mw
    }
    return s
  })
  return m
}

/**
 * A function specific for each method which returns full middleware chain for routes. The returned array consists of strings which are keys in the appMiddleware object.
 * @type {(route: function) => string[]}
 */
const t = {} // eslint-disable-line
