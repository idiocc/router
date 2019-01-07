'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true,
})

exports.default = async function(ctx) {
  const { message } = ctx.request.body
  ctx.body = `test default post request: ${message}`
}
