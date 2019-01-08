```## async initRoutes
[
  ["router", "Router"],
  ["dir", "string?"],
  ["config", "RouterConfig?"]
]
```

The `init` function will scan files in the passed `dir` folder and add routes found for each method to the router. The default `dir` is `src/routes` and the config should be passed to control how the middleware and aliases are set up for each method.

* Each route module should export the default function which will be initialised as the middleware.

* The modules can also export the `aliases` property with an array of strings that are aliases for the route (alternatively, aliases can be specified via the configuration object &mdash; or when both ways are used, they are combined).

* The exported `middleware` property specifies any middleware chain constructor that will take precedence over the method middleware chain constructor from the config. When strings are passed, the middleware functions will be looked up in the `middleware` object returned by the `idio`'s `start` method and passed in the configuration.

%TYPEDEF types/index.xml%

For example, we can specify 1 `GET` and 1 `POST` route in the `example/routes` directory:

%TREE example/routes%

*example/routes/get/index.js*
%EXAMPLE: example/routes/get/index.js%
*example/routes/post/example.js*
%EXAMPLE: example/routes/post/example.js%

Then the router can be automatically configured.

%EXAMPLE: example/example.js, ../src => @idio/router%
%FORK example example/example%

%~%