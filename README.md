# @idio/router

[![npm version](https://badge.fury.io/js/%40idio%2Frouter.svg)](https://www.npmjs.com/package/@idio/router)

`@idio/router` Is The Router Utility For The [_Idio Web Server_](https://github.com/idiocc/idio) With Automatic Initialisation From Folders And Live Reload.

```sh
yarn add @idio/router
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`async initRoutes(router, dir, config=): !WatchConfig`](#async-initroutesrouter-_goarouterdir-stringconfig-routesconfig-watchconfig)
  * [`RoutesConfig`](#type-routesconfig)
  * [`chainRoute(route: !Middleware): !Array<string|!Middleware>`](#chainrouteroute-middleware-arraystringmiddleware)
- [`async watchRoutes(watchConfig): !fs.FSWatcher`](#async-watchrouteswatchconfig-watchconfig-fsfswatcher)
- [Copyright & License](#copyright--license)

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/0.svg?sanitize=true">
</a></p>

## API

The package is available by importing its default function:

```js
import initRoutes, { watchRoutes } from '@idio/router'
```


<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/1.svg?sanitize=true">
</a></p>

## <code>async <ins>initRoutes</ins>(</code><sub><br/>&nbsp;&nbsp;`router: !_goa.Router,`<br/>&nbsp;&nbsp;`dir: string,`<br/>&nbsp;&nbsp;`config=: !RoutesConfig,`<br/></sub><code>): <i>!WatchConfig</i></code>
The `init` function will scan files in the passed `dir` folder and add routes found for each method to the router. The default `dir` is `src/routes` and the config should be passed to control how the middleware and aliases are set up for each method.

 - <kbd><strong>router*</strong></kbd> <em>`!_goa.Router`</em>: An instance of the router.
 - <kbd><strong>dir*</strong></kbd> <em>`string`</em>: The directory from where to init routes.
 - <kbd>config</kbd> <em><code><a href="#type-routesconfig" title="Options for the router.">!RoutesConfig</a></code></em> (optional): Additional configuration.

There are some rules when using this method:

1. Each route module should export the default function which will be initialised as the middleware.
1. The modules can also export the `aliases` property with an array of strings that are aliases for the route (alternatively, aliases can be specified via the configuration object &mdash; or when both ways are used, they are combined).
1. The exported `middleware` property specifies any middleware chain constructor that will take precedence over the method middleware chain constructor from the config. When strings are passed, the middleware functions will be looked up in the `middleware` object returned by the `idio`'s `start` method and passed in the configuration.
1. If the exported `middleware` property is an array, the route will be the last one in the chain call. Otherwise, exporting a middleware chain constructor as a function allows to control the order of execution.

__<a name="type-routesconfig">`RoutesConfig`</a>__: Options for the router.
<table>
 <thead><tr>
  <th>Name</th>
  <th>Type &amp; Description</th>
 </tr></thead>
 <tr>
  <td rowSpan="3" align="center">middlewareConfig</td>
  <td><em>!Object&lt;string, <a href="#chainrouteroute-middleware-arraystringmiddleware" title="Receives the route and returns an ordered array of middleware.">!chainRoute</a>&gt;</em></td>
 </tr>
 <tr></tr>
 <tr>
  <td>
   The method-level middleware configuration: for each method it specifies how to construct the middleware chain. If the string is found in the chain, the middleware will be looked up in the <code>middleware</code> object.
  </td>
 </tr>
 <tr>
  <td rowSpan="3" align="center">middleware</td>
  <td><em><a href="#type-configuredmiddleware">!ConfiguredMiddleware</a></em></td>
 </tr>
 <tr></tr>
 <tr>
  <td>
   The configured middleware object return by the Idio's <code>start</code> method.
  </td>
 </tr>
 <tr>
  <td rowSpan="3" align="center">aliases</td>
  <td><em>!Object&lt;string, !Array&lt;string&gt;&gt;</em></td>
 </tr>
 <tr></tr>
 <tr>
  <td>
   The map of aliases. Aliases can also be specified in routes by exporting the <code>aliases</code> property.
  </td>
 </tr>
 <tr>
  <td rowSpan="3" align="center">filter</td>
  <td><em>(filename: string) => boolean</em></td>
 </tr>
 <tr></tr>
 <tr>
  <td>
   The filter for filenames. Defaults to importing JS and JSX.<br/>
   <kbd><strong>filename*</strong></kbd> <em><code>string</code></em>: The filename.
  </td>
 </tr>
</table>


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
import core from '@idio/idio'
import initRoutes from '@idio/router'

const Server = async () => {
  const { app, url, router, middleware } = await core({
    bodyparser: {
      middlewareConstructor() {
        return async (ctx, next) => {
          const data = await collect(ctx.req)
          ctx.req.body = JSON.parse(data)
          ctx.request.body = JSON.parse(data)
          await next()
        }
      },
    },
    example: {
      middlewareConstructor() {
        return async (ctx, next) => {
          ctx.test = 'test'
          await next()
        }
      },
    },
  })
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

### <code><ins>chainRoute</ins>(</code><sub><br/>&nbsp;&nbsp;`route: !Middleware,`<br/></sub><code>): <i>!Array<string|!Middleware></i></code>
Receives the route and returns an ordered array of middleware.

 - <kbd><strong>route*</strong></kbd> <em><code><a href="https://github.com/idiocc/idio/wiki/Home#middlewarectx-contextnext-function-promisevoid" title="The function to handle requests which can be installed with the `.use` method.">!Middleware</a></code></em>: The route.

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/2.svg?sanitize=true">
</a></p>

## <code>async <ins>watchRoutes</ins>(</code><sub><br/>&nbsp;&nbsp;`watchConfig: !WatchConfig,`<br/></sub><code>): <i>!fs.FSWatcher</i></code>
After the routes were initialised, it is possible to pass the value returned by the `initRoutes` method to the `watchRoutes` function to enable hot-route reload on the development environment. Every change to the module source code will trigger an update of the route including its aliases. *The middleware and aliases changes are not currently implemented.*

 - <kbd><strong>watchConfig*</strong></kbd> <em>`!WatchConfig`</em>: The watch config returned by the `initRoutes` method.

```js
import idio from '@idio/idio'
import initRoutes, { watchRoutes } from '@idio/router'

const Server = async () => {
  const { app, url, router } = await idio({}, { port: 5001 })
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

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/3.svg?sanitize=true">
</a></p>

## Copyright & License

GNU Affero General Public License v3.0

<table>
  <tr>
    <th>
      <a href="https://www.artd.eco">
        <img width="100" src="https://raw.githubusercontent.com/wrote/wrote/master/images/artdeco.png"
          alt="Art Deco">
      </a>
    </th>
    <th>© <a href="https://www.artd.eco">Art Deco™</a> for <a href="https://idio.cc">Idio</a> 2020</th>
    <th>
      <a href="https://idio.cc">
        <img src="https://avatars3.githubusercontent.com/u/40834161?s=100" width="100" alt="Idio">
      </a>
    </th>
  </tr>
</table>

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/-1.svg?sanitize=true">
</a></p>