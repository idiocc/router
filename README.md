# @idio/router

[![npm version](https://badge.fury.io/js/%40idio%2Frouter.svg)](https://npmjs.org/package/@idio/router)

`@idio/router` Is The Router Utility For The Idio Web Server With Automatic Initialisation And Live Reload.

```sh
yarn add -E @idio/router
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`async initRoutes(router: Router, dir: string, config: RouterConfig)`](#async-initroutesrouter-routerdir-stringconfig-routerconfig-void)
  * [`RoutesConfig`](#type-routesconfig)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/0.svg?sanitize=true"></a></p>

## API

The package is available by importing its default function:

```js
import initRoutes from '@idio/router'
```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/1.svg?sanitize=true"></a></p>

## `async initRoutes(`<br/>&nbsp;&nbsp;`router: Router,`<br/>&nbsp;&nbsp;`dir: string,`<br/>&nbsp;&nbsp;`config: RouterConfig,`<br/>`): void`

The `init` function will scan files in the passed `dir` folder and add routes found for each method to the router. Each module should export the default function which will be initialised as the middleware. The modules can also export the `aliases` property with an array of strings that are aliases for the route (alternatively, aliases can be specified via the configuration object). Any middleware chain constructor exported in the module will take precedence over the method middleware chain constructor from the config.

`import('koa').Middleware` __<a name="type-middleware">`Middleware`</a>__

__<a name="type-routesconfig">`RoutesConfig`</a>__: Options for the router.

|       Name       |                                   Type                                   |                                                                                                   Description                                                                                                    |
| ---------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| middlewareConfig | _Object.&lt;string, (route: Middleware) =&gt;\| (string\|Middleware)[]>_ | The method-level middleware configuration: for each method it specifies how to construct the middleware chain. If the string is found in the chain, the middleware will be looked up in the `middleware` object. |
| middleware       | _Object.&lt;string, [Middleware](#type-middleware)&gt;_                  | The configured middleware object return by the Idio's `start` method.                                                                                                                                            |
| filter           | _(string) =&gt; boolean_                                                 | The filter for filenames. Defaults to importing JS and JSX.                                                                                                                                                      |
| aliases          | _Object.&lt;string, string[]&gt;_                                        | The map of aliases. Aliases can also be specified in routes by exporting the `aliases` property.                                                                                                                 |

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
export const middleware = (route) => {
  return ['example', route]
}
```
*example/routes/post/example.js*
```js
export default async (ctx) => {
  const { message } = ctx.request.body
  ctx.body = `example post response: ${message}`
}
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
        '/example': ['/'],
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

## Copyright

(c) [Idio][1] 2019

[1]: https://idio.cc

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/-1.svg?sanitize=true"></a></p>