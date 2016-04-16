// compile

var ast = require('shift-ast')

var compileIdentifier = require('./utils/identifier')

var trueLiteral = new ast.LiteralBooleanExpression({
  value: true
})

var falseLiteral = new ast.LiteralBooleanExpression({
  value: false
})

var zeroLiteral = new ast.LiteralNumericExpression({
  value: 0
})

function compileBinaryRest(op, next, rest, options) {
  if (rest.length === 0) {
    return compile(next, options)
  }

  return new ast.BinaryExpression({
    operator: op,
    left: compile(next, options),
    right: compileBinaryRest(op, rest[0], rest.slice(1), options)
  })
}

function pickOperator(type) {
  switch (type) {
    case 'And':
      return '&&'
    case 'Or':
      return '||'
    case 'Sum':
      return '+'
    default:
      throw new Error('Unknown binary node type "' + type + '"')
  }
}

function compileBinary(node, options, defaultValue) {
  if (node.children.length === 0) {
    return defaultValue
  }

  if (node.children.length === 1) {
    return compile(node.children[0], options)
  }

  return compileBinaryRest(
    pickOperator(node._type),
    node.children[0],
    node.children.slice(1),
    options
  )
}

function compileEqual(node, options) {
  if (node.children.length < 2) {
    return trueLiteral
  }

  if (node.children.length === 2) {
    return new ast.BinaryExpression({
      operator: '==',
      left: compile(node.children[0]),
      right: compile(node.children[1])
    })
  }

  var firstValue = node.children[0]
  var othersEqualFirst = {
    _type: 'And',
    children: node.children.slice(1).map(function(other) {
      return {
        _type: 'Equal',
        children: [
          firstValue,
          other
        ]
      }
    })
  }

  return compile(othersEqualFirst, options)
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

    case 'LiteralNumber':
      return new ast.LiteralNumericExpression({
        value: node.value
      })

    case 'Reference':
      return new ast.IdentifierExpression({
        name: compileIdentifier(node.name, options)
      })

    case 'And':
      return compileBinary(node, options, trueLiteral)

    case 'Or':
      return compileBinary(node, options, falseLiteral)

    case 'Sum':
      return compileBinary(node, options, zeroLiteral)

    case 'Equal':
      return compileEqual(node, options)

    case 'Function':
      return compileFunction(node, options)

    default:
      throw new Error('Unknown node type "' + node._type + '"')
  }
}

module.exports = compile
