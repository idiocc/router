/* typal types/index.xml namespace */
/**
 * @typedef {import('@typedefs/idio').Middleware} _idio.Middleware
 * @typedef {import('@typedefs/idio').ConfiguredMiddleware} _idio.ConfiguredMiddleware
 * @typedef {_idio.RoutesConfig} RoutesConfig `＠record` Options for the router.
 * @typedef {Object} _idio.RoutesConfig `＠record` Options for the router.
 * @prop {!Object<string, !_idio.chainRoute>} [middlewareConfig] The method-level middleware configuration: for each method it specifies how to construct the middleware chain. If the string is found in the chain, the middleware will be looked up in the `middleware` object.
 * @prop {!ConfiguredMiddleware} [middleware] The configured middleware object return by the Idio's `start` method.
 * @prop {!Object<string, !Array<string>>} [aliases] The map of aliases. Aliases can also be specified in routes by exporting the `aliases` property.
 * @prop {(filename: string) => boolean} [filter] The filter for filenames. Defaults to importing JS and JSX.
 * @typedef {_idio.chainRoute} chainRoute Receives the route and returns an ordered array of middleware.
 * @typedef {(route: !_idio.Middleware) => !Array<string|!_idio.Middleware>} _idio.chainRoute Receives the route and returns an ordered array of middleware.
 */
