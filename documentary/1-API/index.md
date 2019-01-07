## API

The package is available by importing its default function:

```js
import initRoutes from '@idio/router'
```

%~%

```## async initRoutes
[
  ["router", "Router"],
  ["dir", "string"],
  ["config", "RouterConfig"]
]
```

The `init` function will scan files in the passed `dir` folder and add routes found for each method to the router. Each module should export the default function which will be initialised as the middleware. The modules can also export the `aliases` property with an array of strings that are aliases for the route (alternatively, aliases can be specified via the configuration object).

%TYPEDEF types/index.xml%

For example, we can specify 1 GET and 1 POST routes in the `example/routes` directory:

%TREE example/routes%

*example/routes/get/index.js*
%EXAMPLE: example/routes/get/index.js%
*example/routes/post/example.js*
%EXAMPLE: example/routes/post/example.js%

Then the router can be automatically configured.

%EXAMPLE: example/example.js, ../src => @idio/router%
%FORK example example/example%

%~%