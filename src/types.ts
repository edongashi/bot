import { Message } from 'discord.js'
import { Opts, ParsedArgs } from 'minimist'

export interface State<T> {
  get(): T | undefined
  set(val: T): void
  map(fn: (current: T | undefined) => T): void
}

export interface Dictionary<TValue = any> {
  [key: string]: TValue
}

export interface MessageContext<TUserState = any, TCommandState = any> {
  message: Message
  args: ParsedArgs
  state: {
    user: State<TUserState>
    command: State<TCommandState>
    root: State<Dictionary>
    userRoot: State<Dictionary>
  }
}

export interface SetupContext<TCommandState = any> {
  command: State<TCommandState>
  root: State<Dictionary>
}

export interface Command<TUserState = any, TCommandState = any> {
  name: string
  aliases?: string[]
  options?: Opts
  setup?(context: SetupContext<TCommandState>): void
  run(context: MessageContext<TUserState, TCommandState>): void | Promise<void>
}
