import path from 'path'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { throttle } from 'lodash'
import { State } from './types'

const dbPath = path.resolve(__dirname, '..', 'db.json')
const adapter = new FileSync(dbPath)
const original = adapter.write
const write = throttle(data => original.call(adapter, data), 1000)
adapter.write = write
const db = low(adapter)

db.defaults({
  shared: {},
  commands: {}
}).write()

write.flush()

const createState = (makePath: (...args: string[]) => string[]) => <TState>(
  ...args: string[]
) => {
  const self = {
    get() {
      return db.get(makePath(...args)).value()
    },
    set(val) {
      db.set(makePath(...args), val).write()
    },
    map(mapper) {
      self.set(mapper(self.get()))
    }
  }

  return self as State<TState>
}

export const commandState = createState(commandId => [
  'commands',
  commandId,
  'state'
])

export const userCommandState = createState((commandId, userId) => [
  'commands',
  commandId,
  'users',
  userId
])

export const rootState = createState(() => ['root', 'state'])()

export const userRootState = createState(userId => ['root', 'users', userId])
