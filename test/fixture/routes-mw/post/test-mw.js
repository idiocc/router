module.exports = async (ctx) => {
  const { test } = ctx
  const { message } = ctx.request.body
  ctx.body = `${test} default post request: ${message}`
}

module.exports.middleware = (route) => ['bodyparser', 'test', route]