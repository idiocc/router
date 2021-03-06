import { relative, sep } from 'path'
import { removeExtension, getName, importRoute } from './'

const recursiveCachePurge = (path) => {
  const children = findChildrenInCache(path)
  children.forEach((c) => {
    recursiveCachePurge(c)
  })
  delete require.cache[path]
  process.stdout.write('.')
}

/**
 * @param {string} path
 */
export const findAllChildren = (path) => {
  const children = findChildrenInCache(path)
  const all = children.reduce((acc, child) => {
    const c = findAllChildren(child)
    acc.push(child, ...c)
    return acc
  }, [])
  return all
}

export const onChange = (path, dir, router, aliases) => {
  const rel = relative(dir, path)
  const [method, file] = rel.split(sep)
  const route = `/${removeExtension(file)}`
  const name = getName(method, route)
  const layer = router.route(name)
  const fn = layer.stack.find(({ _route }) => _route)
  if (!fn) return
  const i = layer.stack.indexOf(fn)
  recursiveCachePurge(path)
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

/**
 * Finds all children except for node_modules and returns list of their filepaths.
 * @param {string} path The full path to the module.
 */
export const findChildrenInCache = (path) => {
  const item = require.cache[path]
  if (!item) return []
  const { children } = item
  const res = children
    .filter((c) => {
      return !/node_modules/.test(c.filename)
    })
    .map(({ id }) => id)
  return res
}
