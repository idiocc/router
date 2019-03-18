## returns the correct output
export default (ctx) => {
  ctx.body = 'hello world'
}
export const middleware = ['middleware']

/* expected */
middleware-hello world
/**/