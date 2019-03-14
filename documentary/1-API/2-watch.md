```## async watchRoutes => Watcher
[
  ["config", "WatchConfig"]
]
```

After the routes were initialised, it is possible to pass the value returned by the `initRoutes` method to the `watchRoutes` function to enable hot-route reload on the development environment. Every change to the module source code will trigger an update of the route including its aliases. *The middleware and aliases changes are not currently implemented.*

%EXAMPLE: example/watch.js, ../src => @idio/router%
%FORK example example/watch%

%~%