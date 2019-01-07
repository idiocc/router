export default async (ctx) => {
  const { test } = ctx
  ctx.body = `example get response: ${test}`
}

export const aliases = ['/']

// The router util will lookup the middleware by its name.
export const middleware = (route) => {
  return ['example', route]
}