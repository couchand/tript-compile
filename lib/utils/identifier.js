// compile an identifier

var reserved = require('reserved-words')

function underscore(word) {
  return '_' + word
}

// options:
//  - reconcile: the reconciliation strategy (default: underscore in front)
//  - dialect: ECMAScript dialect to protect against (default: ES6)
//  - strict: check against strict mode? (default: true)

function compileIdentifier(word, options) {
  var opts = typeof options === 'object' ? options : {}

  var unreserve = typeof opts.reconcile === 'function' ? opts.reconcile : underscore
  var dialect = typeof opts.dialect === 'string' || typeof opts.dialect === 'number' ? opts.dialect : 6
  var strict = typeof opts.strict === 'boolean' ? opts.strict : true

  return reserved.check(word, dialect, strict) ? unreserve(word) : word
}

module.exports = compileIdentifier
