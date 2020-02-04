import { Message, User } from 'discord.js'
import emoji from 'node-emoji'

export async function awaitReaction(
  message: Message,
  author: User,
  reactions: string[],
  time = 30
) {
  for (const reaction of reactions) {
    await message.react(emoji.get(reaction))
  }

  const filter = (reaction, user) =>
    reactions.includes(reaction.emoji.name) && user.id === author.id

  return message
    .awaitReactions(filter, { max: 1, time: time * 1000 })
    .then(collected => collected.first() && collected.first().emoji.name)
}
