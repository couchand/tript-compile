// compile

var ast = require('shift-ast')

var compileIdentifier = require('./utils/identifier')

function compileLogicalRest(op, next, rest, options) {
  if (rest.length === 0) {
    return compile(next, options)
  }

  return new ast.BinaryExpression({
    operator: op,
    left: compile(next, options),
    right: compileLogicalRest(op, rest[0], rest.slice(1), options)
  })
}

function pickOperator(type) {
  switch (type) {
    case 'And':
      return '&&'
    case 'Or':
      return '||'
    default:
      throw new Error('Unknown logical node type "' + type + '"')
  }
}

function compileLogical(node, options) {
  if (node.children.length === 0) {
    return new ast.LiteralBooleanExpression({
      value: node._type === 'And'
    })
  }

  if (node.children.length === 1) {
    return compile(node.children[0], options)
  }

  return compileLogicalRest(
    pickOperator(node._type),
    node.children[0],
    node.children.slice(1),
    options
  )
}

function compileFunction(node, options) {
  var params = node.parameters.map(function(param) {
    return new ast.BindingIdentifier({
      name: compileIdentifier(param.name, options)
    })
  })

  return new ast.FunctionExpression({
    name: new ast.BindingIdentifier({
      name: compileIdentifier(node.name)
    }),
    params: new ast.FormalParameters({
      items: params
    }),
    body: new ast.FunctionBody({
      directives: [],
      statements: [
        new ast.ReturnStatement({
          expression: compile(node.body)
        })
      ]
    })
  })
}

function compile(node, options) {
  switch (node._type) {
    case 'LiteralBoolean':
      return new ast.LiteralBooleanExpression({
        value: node.value
      })

    case 'Reference':
      return new ast.IdentifierExpression({
        name: compileIdentifier(node.name, options)
      })

    case 'And':
      return compileLogical(node, options)

    case 'Or':
      return compileLogical(node, options)

    case 'Function':
      return compileFunction(node, options)

    default:
      throw new Error('Unknown node type "' + node._type + '"')
  }
}

module.exports = compile
