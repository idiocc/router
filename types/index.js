export {}
/* typal types/api.xml namespace */
/**
 * @typedef {_idio.initRoutes} initRoutes The `init` function will scan files in the passed `dir` folder and add routes found for each method to the router. The default `dir` is `src/routes` and the config should be passed to control how the middleware and aliases are set up for each method.
 * @typedef {(router: !_goa.Router, config?: !_idio.RouterConfig) => !_idio.WatchConfig} _idio.initRoutes The `init` function will scan files in the passed `dir` folder and add routes found for each method to the router. The default `dir` is `src/routes` and the config should be passed to control how the middleware and aliases are set up for each method.
 * @typedef {_idio.watchRoutes} watchRoutes After the routes were initialised, it is possible to pass the value returned by the `initRoutes` method to the `watchRoutes` function to enable hot-route reload on the development environment. Every change to the module source code will trigger an update of the route including its aliases. *The middleware and aliases changes are not currently implemented.*
 * @typedef {(config: !_idio.WatchConfig) => !Watcher} _idio.watchRoutes After the routes were initialised, it is possible to pass the value returned by the `initRoutes` method to the `watchRoutes` function to enable hot-route reload on the development environment. Every change to the module source code will trigger an update of the route including its aliases. *The middleware and aliases changes are not currently implemented.*
 */

// /**
//  * @typedef {import('../compile')}
//  * @typedef {import('@typedefs/idio')}
//  */