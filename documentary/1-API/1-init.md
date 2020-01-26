<typedef name="initRoutes" noArgTypesInToc>types/api.xml</typedef>

* Each route module should export the default function which will be initialised as the middleware.

* The modules can also export the `aliases` property with an array of strings that are aliases for the route (alternatively, aliases can be specified via the configuration object &mdash; or when both ways are used, they are combined).

* The exported `middleware` property specifies any middleware chain constructor that will take precedence over the method middleware chain constructor from the config. When strings are passed, the middleware functions will be looked up in the `middleware` object returned by the `idio`'s `start` method and passed in the configuration.

* If the exported `middleware` property is an array, the route will be the last one in the chain call. Otherwise, exporting a middleware chain constructor as a function allows to control the order of execution.

<typedef narrow>types/index.xml</typedef>

For example, we can specify 1 `GET` and 1 `POST` route in the `example/routes` directory:

%TREE example/routes%

*example/routes/get/index.js*
%EXAMPLE: example/routes/get%
*example/routes/post/example.js*
%EXAMPLE: example/routes/post/example%

Then the router can be automatically configured.

%EXAMPLE: example, ../src => @idio/router%
%FORK example%

%~%