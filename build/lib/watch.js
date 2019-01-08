const { removeExtension, getName, importRoute } = require('.');
const { relative, sep } = require('path');

       const onChange = (path, dir, router, aliases) => {
  const rel = relative(dir, path)
  const [method, file] = rel.split(sep)
  const route = `/${removeExtension(file)}`
  const name = getName(method, route)
  const layer = router.route(name)
  const fn = layer.stack.find(({ _route }) => _route)
  if (!fn) return
  const i = layer.stack.indexOf(fn)
  const children = findChildrenInCache(path)
  children.forEach((c) => {
    delete require.cache[c]
  })
  delete require.cache[path]
  const { fn: newFn, aliases: ma = [] } = importRoute(dir, rel)
  newFn._route = true
  layer.stack[i] = newFn

  const methodAliases = aliases[method] || {}
  const a = methodAliases[route] || []
  const aa = [...a, ...ma]
  const reloadedAliases = aa.map((alias) => {
    const aliasName = getName(method, alias)
    const l = router.route(aliasName)
    const fun = l.stack.find(({ _route }) => _route)
    if (!fun) return
    const j = l.stack.indexOf(fun)
    l.stack[j] = newFn
    return alias
  })

  console.log('> hot reloaded %s %s', name, reloadedAliases.length ? `${reloadedAliases.join(', ')}` : '')
}

       const findChildrenInCache = (path) => {
  const item = require.cache[path]
  if (!item) return []
  const { children } = item
  const res = children
    .filter((c) => {
      return !/node_modules/.test(c)
    })
    .map(({ id }) => id)
  return res
}


module.exports.onChange = onChange
module.exports.findChildrenInCache = findChildrenInCache