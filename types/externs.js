/**
 * @fileoverview
 * @externs
 */
/* typal types/index.xml externs */
/** @const */
var _idio = {}
/**
 * Options for the router.
 * @record
 */
_idio.RoutesConfig
/**
 * The method-level middleware configuration: for each method it specifies how to construct the middleware chain. If the string is found in the chain, the middleware will be looked up in the `middleware` object.
 * @type {(!Object<string, !_idio.chainRoute>)|undefined}
 */
_idio.RoutesConfig.prototype.middlewareConfig
/**
 * The configured middleware object return by the Idio's `start` method.
 * @type {(!ConfiguredMiddleware)|undefined}
 */
_idio.RoutesConfig.prototype.middleware
/**
 * The map of aliases. Aliases can also be specified in routes by exporting the `aliases` property.
 * @type {(!Object<string, !Array<string>>)|undefined}
 */
_idio.RoutesConfig.prototype.aliases
/**
 * The filter for filenames. Defaults to importing JS and JSX.
 * @type {(function(string): boolean)|undefined}
 */
_idio.RoutesConfig.prototype.filter = function(filename) {}
/**
 * A private config returned.
 * @record
 */
_idio.WatchConfig
/**
 * Receives the route and returns an ordered array of middleware.
 * @typedef {function(!_idio.Middleware): !Array<string|!_idio.Middleware>}
 */
_idio.chainRoute
