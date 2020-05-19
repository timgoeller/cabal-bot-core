/* global describe, it, context, beforeEach */
var expect = require('chai').expect

var CabalClient = require('cabal-client')
var CabalBot = require('../src/cabal-bot')

describe('CabalBot', function () {
  describe('#constructor()', function () {
    context('without arguments', function() {
      it('should reject missing name', function () {
        expect(() => new CabalBot()).to.throw()
      })
    })

    context('with a name', function() {
      it('should set name', function () {
        const cabalBot = new CabalBot('test')
        expect(cabalBot.name).to.equal('test')
      })
      it('should fill with defaults when called without any opts', function () {
        const cabalBot = new CabalBot('test')
        expect(cabalBot.symbol).to.equal('!')
        expect(cabalBot.client).to.exist
      })
    })

    context('with a name and opts', function() {
      it('should reject symbol with a length > 1', function () {
        expect(() => new CabalBot('test', { symbol: '!!' })).to.throw()
      })
      it('should assign opts', function () {
        const cabalBot = new CabalBot('test', { symbol: '?', channels: ['test1', 'test2'] })
        expect(cabalBot.symbol).to.equal('?')
        expect(cabalBot.channels).to.have.members(['test1', 'test2'])
        expect(cabalBot.client).to.exist
      })
    })
  })

  describe('#join()', function () {
    beforeEach(function () {
      const self = this

      self.bot = new CabalBot('test', { clientOpts: { config: { temp: true } } })
      const botPromise = new Promise((resolve) => {
        self.bot.client.createCabal().then((cabalDetails) => {
          cabalDetails.on('init', () => {
            self.key = cabalDetails._cabal.key
            resolve()
          })
        })
      })

      return new Promise((resolve) => {
        botPromise.then(function () {
          self.secondClient = new CabalClient({ config: { temp: true } })
          self.secondClient.addCabal(self.key).then((cabal) => {
            self.secondClientCabal = cabal
            resolve()
          })
        })
      })
    })

    context('without arguments', function () {
      it('should reject missing key', function () {
        expect(() => this.bot.join(''))
      })
    })

    context('with key', function () {
      it('should call event when joined successfully', function () {
        return new Promise((resolve) => {
          this.bot.on('joined-cabal', (cabal) => {
            expect(cabal).to.exist
            resolve()
          })
          this.bot.joinCabal(this.key)
        })
      })
      it('should call event when new message was published', function () {
        var self = this

        self.timeout(10000)
        return new Promise((resolve) => {
          self.bot.on('joined-cabal', (cabal) => {
            self.bot.on('new-message', (envelope, cabalDetails) => {
              resolve()
            })

            self.secondClientCabal.publishMessage({
              type: 'chat/text',
              content: {
                text: 'test',
                channel: 'default'
              }
            })
          })
          self.bot.joinCabal(self.key)
        })
      })
      it('should call event when new message with symbol prefix was published', function () {
        var self = this

        return new Promise((resolve) => {
          self.bot.on('joined-cabal', (cabal) => {
            self.bot.on('new-command', (envelope, cabalDetails) => {
              resolve()
            })

            self.secondClientCabal.publishMessage({
              type: 'chat/text',
              content: {
                text: '!testcommand',
                channel: 'default'
              }
            })
          })
          self.bot.joinCabal(self.key)
        })
      })
    })
  })
})
