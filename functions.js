const db = require('./db')
const { isEqual, union, difference } = require('lodash')

function toArray(val) {
  return Array.isArray(val) ? val : [val]
}

function getRoles(userId) {
  return db
    .get('users')
    .getById(userId)
    .get('roles')
    .value() || []
}

function hasRole(userId, roles) {
  roles = toArray(roles)
  return db
    .users(userId)
    .every(user =>
      user.roles && roles.every(r => user.roles.includes(r))
    )
    .value()
}

function addRoles(userId, roles) {
  roles = toArray(roles)
  db
    .users(userId)
    .onEach(user => user
      .defaults({ roles: [] })
      .update('roles', r => union(r, roles))
    )
    .write()
}

function removeRoles(userId, roles) {
  roles = toArray(roles)
  db
    .users(userId)
    .onEach(user => user
      .defaults({ roles: [] })
      .update('roles', r => difference(r, roles))
    )
    .write()
}

function clearRoles(userId) {
  db
    .users(userId)
    .onEach(user => user.set('roles', []))
    .write()
}

function getData(userId, key, value) {
  key = toArray(key)
  db
    .users(userId)
    .first()
    .get(['data', ...key])
    .value()
}

function setData(userId, key, value) {
  key = toArray(key)
  db
    .users(userId)
    .onEach(user => user
      .defaults({ data: {} })
      .set(['data', ...key], value)
    )
    .write()
}

module.exports = {
  getRoles,
  hasRole,
  addRoles,
  removeRoles,
  clearRoles,
  getData,
  setData
}
