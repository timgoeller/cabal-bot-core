var Client = require('cabal-client')
var events = require('events')

class CabalBot extends events.EventEmitter {
  constructor (name, opts) {
    super()
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
  }

  joinCabal (key) {
    if (!key) {
      throw new Error('key must be set')
    }

    const initTime = new Date().getTime()

    this.client.addCabal(key).then(cabalDetails => {
      cabalDetails.on('init', () => {
        cabalDetails.publishNick('[BOT] ' + this.name, () => {})
        cabalDetails.on('new-message', (envelope) => {
          if (this.channels) {
            if (!this.channels.includes(envelope.channel)) return
          }

          if (envelope.message.value.timestamp > initTime) {
            this.emit('new-message', envelope, cabalDetails)

            if (envelope.message.value.content.text !== '') {
              if (envelope.message.value.content.text.charAt(0) === this.symbol) {
                this.emit('new-command', envelope, cabalDetails)
              }
            }
          } else {
            this.emit('old-message', envelope, cabalDetails)

            if (envelope.message.value.content.text !== '') {
              if (envelope.message.value.content.text.charAt(0) === this.symbol) {
                this.emit('old-command', envelope, cabalDetails)
              }
            }
          }
        })
        this.emit('joined-cabal', cabalDetails)
      })
    })
  }

  joinCabals (keys) {
    keys.forEach(key => {
      this.joinCabal(key)
    })
  }
}

module.exports = CabalBot
