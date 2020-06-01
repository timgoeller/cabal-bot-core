/* global describe, it, context, beforeEach, before */
var expect = require('chai').expect

var CabalClient = require('cabal-client')
var CabalBot = require('../src/cabal-bot')

describe('CabalBot', function () {
  before(function () {
    var self = this

    self.firstKey = '0b54896461391fbb0649750defbbf1dd34bebf23fd2fb4ad344d051dd93228e4'
    self.secondKey = '92ae3209c636c8024da323d94ffdc891d7763cfa1ae1e88a08bbeb7a0f886781'
  })

  describe('#constructor()', function () {
    context('without arguments', function () {
      it('should reject missing name', function () {
        expect(() => new CabalBot()).to.throw()
      })
    })

    context('with a name', function () {
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

    context('with a name and opts', function () {
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

  describe('#joinCabal()', function () {
    beforeEach(function () {
      const self = this

      self.bot = new CabalBot('test', { clientOpts: { config: { temp: true } } })

      return new Promise((resolve) => {
        self.secondClient = new CabalClient({ config: { temp: true } })
        self.secondClient.addCabal(self.firstKey).then((cabal) => {
          self.secondClientCabal = cabal
          resolve()
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
          this.bot.joinCabal(this.firstKey)
        })
      })
      it('should call event when new message was published', function () {
        var self = this

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
          self.bot.joinCabal(self.firstKey)
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
          self.bot.joinCabal(self.firstKey)
        })
      })
    })
  })

  describe('#joinCabals()', function () {
    it('should join all given cabals', function (done) {
      const bot = new CabalBot('test', { clientOpts: { config: { temp: true } } })

      let joined = 0
      bot.on('joined-cabal', (cabal) => {
        joined += 1
        if (joined === 2) {
          done()
        }
      })
      bot.joinCabals([this.firstKey, this.secondKey])
    })
  })
})
