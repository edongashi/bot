const path = require('path')
const low = require('lowdb')
const { forEach } = require('lodash')
const lodashId = require('lodash-id')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync(path.resolve(__dirname, 'db.json'))
const db = low(adapter)

function toArray(val) {
  return Array.isArray(val) ? val : [val]
}

db._.mixin(lodashId)

db._.mixin({
  onEach(val, fun) {
    forEach(val, (x, ...rest) => {
      const result = fun(db._.chain(x), ...rest)
      if ('commit' in result) {
        result.commit()
      }
    })
  },
  first(val) {
    return val[0]
  }
})

db.users = function (userId) {
  const ids = toArray(userId)
  const users = db.get('users').value()
  let update = false
  for (const id of ids) {
    if (!users.some(u => u.id === id)) {
      users.push({ id })
      update = true
    }
  }

  if (update) {
    db.write()
  }

  return db
    .get('users')
    .filter(u => ids.includes(u.id))
}

db
  .defaults({ users: [] })
  .write()

module.exports = db
