var chai = require('chai')
chai.should()
var expect = chai.expect

var compileIdentifier = require('../lib/utils/identifier')

describe('compileIdentifier', function() {
  describe('with unreserved word', function() {
    it('passes through unchanged', function() {
      var names = [
        'foo',
        'bar',
        'baz',
        'qux',
        'clas',
        'classy',
        'va',
        'variable',
        'func',
        'functional',
        'typeo',
        'typeofit',
        'nothing'
      ]

      names.forEach(function(name) {
        var result = compileIdentifier(name)

        expect(result).to.be.a('string')
        result.should.equal(name)
      })
    })
  })

  describe('with reserved word', function() {
    it('mangles the name', function() {
      var names = [
        'class',
        'var',
        'function',
        'typeof',
        'new'
      ]

      names.forEach(function(name) {
        var result = compileIdentifier(name)

        expect(result).to.be.a('string')
        result.should.equal('_' + name)
      })
    })
  })

  describe('options', function() {
    describe('reconcile', function() {
      it('changes reconciliation strategy', function() {
        var names = [
          'class',
          'var',
          'function',
          'typeof',
          'new'
        ]

        var appendUnderscore = function(name) {
          return name + '_'
        }

        names.forEach(function(name) {
          var result = compileIdentifier(name, {
            reconcile: appendUnderscore
          })

          expect(result).to.be.a('string')
          result.should.equal(name + '_')
        })
      })

      it('defaults to prepend underscore', function() {
        compileIdentifier('class').should.equal('_class')
      })
    })

    describe('dialect', function() {
      it('changes ECMAScript dialect', function() {
        var onlyInSix = 'await'
        var onlyInThree = 'volatile'

        compileIdentifier(onlyInSix, {
          dialect: 3
        }).should.equal(onlyInSix)
        compileIdentifier(onlyInSix, {
          dialect: 5
        }).should.equal(onlyInSix)
        compileIdentifier(onlyInSix, {
          dialect: 6
        }).should.equal('_' + onlyInSix)

        compileIdentifier(onlyInThree, {
          dialect: 3
        }).should.equal('_' + onlyInThree)
        compileIdentifier(onlyInThree, {
          dialect: 5
        }).should.equal(onlyInThree)
        compileIdentifier(onlyInThree, {
          dialect: 6
        }).should.equal(onlyInThree)
      })

      it('defaults to ES6', function() {
        compileIdentifier('await').should.equal('_await')
      })
    })

    describe('strict', function() {
      it('determines strict mode', function() {
        compileIdentifier('public', {
          strict: true
        }).should.equal('_public')
        compileIdentifier('public', {
          strict: false
        }).should.equal('public')
      })

      it('defaults to true', function() {
        compileIdentifier('public').should.equal('_public')
      })
    })
  })
})
