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