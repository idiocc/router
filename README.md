# @idio/router

[![npm version](https://badge.fury.io/js/%40idio%2Frouter.svg)](https://npmjs.org/package/@idio/router)

`@idio/router` Is The Router Utility For The Idio Web Server With Automatic Initialisation And Live Reload.

```sh
yarn add -E @idio/router
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`async initRoutes(router: Router, dir: string?, config: RouterConfig?): WatchConfig`](#async-initroutesrouter-routerdir-stringconfig-routerconfig-watchconfig)
  * [`RoutesConfig`](#type-routesconfig)
- [`async watchRoutes(config: WatchConfig): Watcher`](#async-watchroutesconfig-watchconfig-watcher)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/0.svg?sanitize=true"></a></p>

## API

The package is available by importing its default function:

```js
import initRoutes, { watchRoutes } from '@idio/router'
```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/1.svg?sanitize=true"></a></p>

## `async initRoutes(`<br/>&nbsp;&nbsp;`router: Router,`<br/>&nbsp;&nbsp;`dir: string?,`<br/>&nbsp;&nbsp;`config: RouterConfig?,`<br/>`): WatchConfig`

The `init` function will scan files in the passed `dir` folder and add routes found for each method to the router. The default `dir` is `src/routes` and the config should be passed to control how the middleware and aliases are set up for each method.

* Each route module should export the default function which will be initialised as the middleware.

* The modules can also export the `aliases` property with an array of strings that are aliases for the route (alternatively, aliases can be specified via the configuration object &mdash; or when both ways are used, they are combined).

* The exported `middleware` property specifies any middleware chain constructor that will take precedence over the method middleware chain constructor from the config. When strings are passed, the middleware functions will be looked up in the `middleware` object returned by the `idio`'s `start` method and passed in the configuration.

* If the exported `middleware` property is an array, the route will be the last one in the chain call. Otherwise, exporting a middleware chain constructor as a function allows to control the order of execution.

`import('koa').Middleware` __<a name="type-middleware">`Middleware`</a>__

__<a name="type-routesconfig">`RoutesConfig`</a>__: Options for the router.

|       Name       |                                     Type                                     |                                                                                                   Description                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| middlewareConfig | _Object.&lt;string, (route: Middleware) =&gt; \|  (string \| Middleware)[]>_ | The method-level middleware configuration: for each method it specifies how to construct the middleware chain. If the string is found in the chain, the middleware will be looked up in the `middleware` object. |
| middleware       | _Object.&lt;string, [Middleware](#type-middleware)&gt;_                      | The configured middleware object return by the Idio's `start` method.                                                                                                                                            |
| filter           | _(string) =&gt; boolean_                                                     | The filter for filenames. Defaults to importing JS and JSX.                                                                                                                                                      |
| aliases          | _Object.&lt;string, string[]&gt;_                                            | The map of aliases. Aliases can also be specified in routes by exporting the `aliases` property.                                                                                                                 |

For example, we can specify 1 `GET` and 1 `POST` route in the `example/routes` directory:

```m
example/routes
├── get
│   └── index.js
└── post
    └── example.js
```

*example/routes/get/index.js*
```js
export default async (ctx) => {
  const { test } = ctx
  ctx.body = `example get response: ${test}`
}

export const aliases = ['/']

// The router util will lookup the middleware by its name.
// The constructor is used to control the order.
export const middleware = (route) => {
  return ['example', route]
}

// Another way to write middleware is to use a plain array.
/* export const middleware = ['example'] */
```
*example/routes/post/example.js*
```js
export default async (ctx) => {
  const { message } = ctx.request.body
  ctx.body = `example post response: ${message}`
}

// The aliases exported in the module will extend
// the ones specified in the config
export const aliases = ['/']
```

Then the router can be automatically configured.

```js
import core from '@idio/core'
import initRoutes from '@idio/router'

const Server = async () => {
  const { app, url, router, middleware } = await core({
    bodyparser: {},
    example: {
      middlewareConstructor() {
        return async (ctx, next) => {
          ctx.test = 'test'
          await next()
        }
      },
    },
  }, { port: 5000 })
  await initRoutes(router, 'example/routes', {
    middlewareConfig: {
      post(route) {
        return ['bodyparser', route]
      },
    },
    aliases: {
      post: {
        '/example': ['/example.html'],
      },
    },
    middleware,
  })
  app.use(router.routes())
  return { app, url }
}
```
```
http://localhost:5000
GET /
 :: example get response: test
POST "hello world" > / 
 :: example post response: hello world
```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/2.svg?sanitize=true"></a></p>

## `async watchRoutes(`<br/>&nbsp;&nbsp;`config: WatchConfig,`<br/>`): Watcher`

After the routes were initialised, it is possible to pass the value returned by the `initRoutes` method to the `watchRoutes` function to enable hot-route reload on the development environment. Every change to the module source code will trigger an update of the route including its aliases. *The middleware and aliases changes are not currently implemented.*

```js
import core from '@idio/core'
import initRoutes, { watchRoutes } from '@idio/router'

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
```
```
http://localhost:5001
GET / RESULT:
┌────────────────────────────────┐
│ [initial] example get response │
└────────────────────────────────┘
Update routes/get/index.js
⌁ example/watch-routes/get/index.js
.> hot reloaded GET /index /
GET / RESULT:
┌────────────────────────────────┐
│ [updated] example get response │
└────────────────────────────────┘
```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/3.svg?sanitize=true"></a></p>

## Copyright

<table>
  <tr>
    <th>
      <a href="https://artd.eco">
        <img src="https://raw.githubusercontent.com/wrote/wrote/master/images/artdeco.png" alt="Art Deco" />
      </a>
    </th>
    <th>© <a href="https://artd.eco">Art Deco</a> for <a href="https://idio.cc">Idio</a> 2019</th>
    <th>
      <a href="https://idio.cc">
        <img src="https://avatars3.githubusercontent.com/u/40834161?s=100" width="100" alt="Idio" />
      </a>
    </th>
    <th>
      <a href="https://www.technation.sucks" title="Tech Nation Visa">
        <img src="https://raw.githubusercontent.com/artdecoweb/www.technation.sucks/master/anim.gif"
          alt="Tech Nation Visa" />
      </a>
    </th>
    <th><a href="https://www.technation.sucks">Tech Nation Visa Sucks</a></th>
  </tr>
</table>

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/-1.svg?sanitize=true"></a></p>