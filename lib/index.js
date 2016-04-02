// generate JS code

var codegen = require('shift-codegen')

var interp = require('tript-interp')
var compile = require('./compile')

function compileToString(script, options) {
  var ast = compile(script, options)
  var str = codegen.default(ast, new codegen.FormattedCodeGen())
  return str
}

module.exports = function compile(script, options) {
  var interped = interp(script)

  if (typeof interped !== 'function') {
    return interped
  }

  return compileToString(script, options)
}
