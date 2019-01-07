export default async (ctx) => {
  const { message } = ctx.request.body
  ctx.body = `example post response: ${message}`
}
export const aliases = ['/']