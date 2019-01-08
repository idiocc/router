const layout = require('../../layout')

module.exports = (ctx) => {
  ctx.body = `${layout} dynamic route`
}

module.exports.aliases = ['/getTest']