require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const { buildContext } = require('./context')
const { getRoles, addRoles, removeRoles, clearRoles } = require('./functions')

const privileged = fn => ctx => {
  if (ctx.hasRole('admin')) {
    fn(ctx)
  } else {
    return ctx.reply('no permission!')
  }
}

const split = str => str.trim().split(/\s+/).map(x => x.trim()).filter(x => x)
const delim = '```'
const jsBlock = code => '```js\n' + code + '\n```'

function handleGetUserRoles({ reply, mentions }) {
  const roles = getRoles(mentions[0]).join(', ')
  if (roles) {
    reply(roles)
  } else {
    reply('<no roles>')
  }
}

function handleGetRoles({ reply, sender }) {
  const roles = getRoles(sender).join(', ')
  if (roles) {
    reply(roles)
  } else {
    reply('<no roles>')
  }
}

function handleAddRoles({ mentions, reply, matches }) {
  addRoles(mentions, split(matches[1]))
  reply('done!')
}

function handleRemoveRoles({ mentions, reply, matches }) {
  removeRoles(mentions, split(matches[1]))
  reply('done!')
}

function handleRemoveAllRoles({ mentions, reply, matches }) {
  clearRoles(mentions)
  reply('done!')
}

function evalInContext(js, context) {
  return function (str) {
    return eval(str);
  }.call(context, 'with(this) { ' + js + ' }');
}

function exec(ctx) {
  const { message } = ctx
  const index = message.indexOf('```js')
  const end = message.lastIndexOf(delim)
  const code = message.substring(index + '```js'.length, end)

  try {
    evalInContext(code, ctx)
  } catch (e) {
    console.error(e)
    ctx.reply('error: ' + e.message)
  }
}

const commands = [
  [/^!roles? (?:<@!\S+?>)$/i, privileged(handleGetUserRoles)],
  [/^!roles$/i, handleGetRoles],
  [/^!addroles?\s+(?:<@!\S+?>)(?:\s+<@!\S+?>)*((?:\s+[a-z]+)*)$/i, privileged(handleAddRoles)],
  [/^!rmroles?\s+(?:<@!\S+?>)(?:\s+<@!\S+?>)*((?:\s+[a-z]+)*)$/i, privileged(handleRemoveRoles)],
  [/^!clroles?\s+(?:<@!\S+?>)(?:\s+<@!\S+?>)*$/i, privileged(handleRemoveAllRoles)],
  [/^!exec(?:\s+<@!\S+?>)*\s+```js/i, privileged(exec)]
]

client.on('message', msg => {
  if (msg.author.bot) {
    return
  }

  if (msg.content && typeof msg.content === 'string') {
    const content = msg.content.trim()

    for (const [pattern, callback] of commands) {
      const matches = content.match(pattern)
      if (matches) {
        const ctx = buildContext(msg, matches)
        callback(ctx)
        return
      }
    }
  }
})

client.login(process.env.BOT_TOKEN)
