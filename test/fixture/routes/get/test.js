module.exports = async (ctx) => {
  ctx.body = 'test dynamic route'
}

module.exports.aliases = ['/getTest']