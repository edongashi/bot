import Discord from 'discord.js'
import minimist from 'minimist'
import stringArgv from 'string-argv'
import commands from './commands'
import { botToken, prefix } from './config'
import * as db from './db'
import { Command, Dictionary, MessageContext } from './types'

commands.forEach(command => {
  if (command.setup) {
    command.setup({
      command: db.commandState(command.name),
      root: db.rootState
    })
  }
})

const commandsAssoc = commands.reduce((acc, command) => {
  const current = [command.name, ...(command.aliases || [])].reduce(
    (acc, id) => ({
      ...acc,
      [id.toLowerCase()]: command
    }),
    {}
  )

  return {
    ...acc,
    ...current
  }
}, {}) as Dictionary<Command>

const client = new Discord.Client()

client.on('message', async message => {
  if (
    message.author.bot ||
    !message.guild ||
    !message.content.startsWith(prefix)
  ) {
    return
  }

  if (!message.member) {
    message.member = await message.guild.fetchMember(message)
  }

  const [id, ...args] = stringArgv(message.content.substr(prefix.length))
  const command = commandsAssoc[id.toLowerCase()]
  if (command) {
    const context: MessageContext = {
      message: message,
      args: minimist(args, command.options),
      state: {
        user: db.userCommandState(command.name, message.author.id),
        command: db.commandState(command.name),
        root: db.rootState,
        userRoot: db.userRootState(message.author.id)
      }
    }

    command.run(context)
  }
})

client.login(botToken)
