var chai = require('chai')
chai.should()
var expect = chai.expect

var ast = require('tript-ast').default

var compile = require('../lib/compile')

describe('compile', function() {
  it('is a function', function() {
    compile.should.be.a('function')
  })

  it('throws on invalid nodes', function() {
    (function() {
      compile(
        {
          _type: 'foobar'
        }
      )
    }).should.throw(/node type/)
  })

  describe('literal', function() {
    describe('LiteralBoolean', function() {
      it('returns a LiteralBooleanExpression', function() {
        var result = compile(
          new ast.LiteralBoolean({
            value: false
          })
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('LiteralBooleanExpression')
        result.should.have.property('value')
          .that.equals(false)
      })
    })
  })

  describe('Reference', function() {
    it('returns an IdentifierExpression', function() {
      var result = compile(
        new ast.Reference({
          name: 'foobar'
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('type')
        .that.equals('IdentifierExpression')
      result.should.have.property('name')
        .that.equals('foobar')
    })
  })

  describe('logical expression', function() {
    function makeLogical(op, literals) {
      return new ast[op]({
        children: literals.map((literal) =>
          new ast.LiteralBoolean({
            value: literal
          })
        )
      })
    }

    describe('And', function() {
      it('is literal true for empty children', function() {
        var result = compile(
          makeLogical('And', [])
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('LiteralBooleanExpression')
        result.should.have.property('value')
          .that.equals(true)
      })

      it('compiles to a binary expression', function() {
        var result = compile(
          makeLogical('And', [true, true, true])
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('BinaryExpression')
        result.should.have.property('operator')
          .that.equals('&&')
        result.should.have.property('left')
          .that.has.property('type')
          .that.equals('LiteralBooleanExpression')
        result.should.have.property('right')
          .that.has.property('type')
          .that.equals('BinaryExpression')
        result.right.should.have.property('operator')
          .that.equals('&&')
        result.right.should.have.property('left')
        result.right.left.should.have.property('type')
          .that.equals('LiteralBooleanExpression')
        result.right.should.have.property('right')
        result.right.right.should.have.property('type')
          .that.equals('LiteralBooleanExpression')
      })
    })

    describe('Or', function() {
      it('is literal false for empty children', function() {
        var result = compile(
          makeLogical('Or', [])
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('LiteralBooleanExpression')
        result.should.have.property('value')
          .that.equals(false)
      })

      it('compiles to a binary expression', function() {
        var result = compile(
          makeLogical('Or', [true, true, true])
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('BinaryExpression')
        result.should.have.property('operator')
          .that.equals('||')
        result.should.have.property('left')
          .that.has.property('type')
          .that.equals('LiteralBooleanExpression')
        result.should.have.property('right')
          .that.has.property('type')
          .that.equals('BinaryExpression')
        result.right.should.have.property('operator')
          .that.equals('||')
        result.right.should.have.property('left')
        result.right.left.should.have.property('type')
          .that.equals('LiteralBooleanExpression')
        result.right.should.have.property('right')
        result.right.right.should.have.property('type')
          .that.equals('LiteralBooleanExpression')
      })
    })
  })

  describe('Function', function() {
    it('returns the value of the body', function() {
      var result = compile(
        new ast.Function({
          name: 'foobar',
          parameters: [],
          body: new ast.LiteralBoolean({
            value: false
          })
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('type')
        .that.equals('FunctionExpression')
      result.should.have.property('body')
      result.body.should.have.property('type')
        .that.equals('FunctionBody')
      result.body.should.have.property('statements')
        .that.has.lengthOf(1)

      var stmt = result.body.statements[0]

      stmt.should.have.property('type')
        .that.equals('ReturnStatement')
      stmt.should.have.property('expression')
      
      var expr = result.body.statements[0].expression

      expr.should.have.property('type')
        .that.equals('LiteralBooleanExpression')
    })

    it('puts parameters in scope', function() {
      var result = compile(
        new ast.Function({
          name: 'foobar',
          parameters: [
            new ast.Parameter({
              name: 'baz',
              type: 'Boolean'
            })
          ],
          body: new ast.Reference({
            name: 'baz'
          })
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('type')
        .that.equals('FunctionExpression')
      result.should.have.property('params')

      var params = result.params

      params.should.have.property('type')
        .that.equals('FormalParameters')
      params.should.have.property('items')
        .that.has.lengthOf(1)

      var param = result.params.items[0]
      
      param.should.have.property('type')
        .that.equals('BindingIdentifier')
      param.should.have.property('name')
        .that.equals('baz')
    })
  })
})
