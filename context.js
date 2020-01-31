const functions = require('./functions')

function getIds(msg) {
  const users = msg.mentions.users
  const ids = []
  for (const [key, value] of users) {
    if (value.bot) {
      continue
    }

    ids.push(key)
  }

  return ids
}

function buildContext(msg, matches) {
  const sender = msg.author.id
  const message = typeof msg.content === 'string' ? msg.content : null
  const mentions = getIds(msg)
  const reply = (...args) => msg.reply(...args)
  const send = (...args) => msg.channel.send(...args)
  const hasRole = (mark) => functions.hasRole(sender, mark)

  return {
    sender,
    message,
    mentions,
    reply,
    send,
    hasRole,
    matches
  }
}

module.exports = {
  buildContext
}
