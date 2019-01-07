export default async (ctx) => {
  const { message } = ctx.request.body
  ctx.body = `example post response: ${message}`
}

// The aliases exported in the module will extend
// the ones specified in the config
export const aliases = ['/']