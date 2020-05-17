var Client = require('cabal-client')
var CabalBotExpression = require('./expression')

class CabalBot {
  constructor (name, opts) {
    if (!name) {
      throw new Error('name must be set')
    }
    opts = opts || {}
    this.name = name
    this.symbol = opts.symbol === undefined ? '!' : opts.symbol
    if (this.symbol.length !== 1) {
      throw new Error('symbol can\'t be longer than one character')
    }
    this.channels = opts.channels
    this.client = new Client(opts.clientOpts)
    this.expressions = []
  }

  joinCabal (key) {
    const initTime = new Date().getTime()

    this.client.addCabal(key).then(cabalDetails => {
      cabalDetails.on('init', () => {
        cabalDetails.publishNick('[BOT] ' + this.name, () => {})
        cabalDetails.on('new-message', (envelope) => {
          if (envelope.message.value.timestamp > initTime) {
            this._onNewMessage(envelope, cabalDetails)
          }
        })
      })
    })
  }

  _onNewMessage (envelope, cabalDetails) {
    if (this.channels) {
      if (!this.channels.includes(envelope.channel)) return
    }
    if (envelope.message.value.content.text !== '') {
      if (envelope.message.value.content.text.charAt(0) === this.symbol) {
        this.expressions.forEach(expr => {
          expr._runExpression(cabalDetails, envelope)
        })
      }
    }
  }

  pipeline () {
    const expr = new CabalBotExpression()
    this.expressions.push(expr)
    return expr
  }
}

module.exports = CabalBot
