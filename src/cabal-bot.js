var Client = require('cabal-client')
var events = require('events')

class CabalBot extends events.EventEmitter {
  constructor (name, opts) {
    super()
    if (!name) {
      throw new Error('name must be set')
    }
    opts = opts || { }
    if (!opts.clientOpts) opts.clientOpts = { config: { temp: false }}
    this.name = '~' + name + '[bot]'
    this.symbol = opts.symbol === undefined ? '!' : opts.symbol
    if (this.symbol.length !== 1) {
      throw new Error('symbol can\'t be longer than one character')
    }
    this.channels = opts.channels
    this.client = new Client(opts.clientOpts)
  }

  joinCabal (key) {
    console.log(`joining ${key}`)
    if (!key) {
      throw new Error('key must be set')
    }

    const initTime = new Date().getTime()

    this.client.addCabal(key).then(cabal => {
      console.log('initialized')
      cabal.publishNick(this.name, () => {})
      if (this.channels) {
        this.channels.forEach(ch => cabal.joinChannel(ch))
      }
      cabal.on('new-message', (envelope) => {
        this.processNewMessage(envelope, cabal, initTime)
      })
      this.emit('joined-cabal', cabal)
    })
  }

  processNewMessage (envelope, cabal, initTime) {
    if (envelope.author.key === cabal.user.key) return // don't process messages sent from this bot
    if (this.channels) {
      if (!this.channels.includes(envelope.channel)) return
    }

    const messageInfo = {}

    messageInfo.mention = envelope.message.value.content.text.includes(this.name)

    if (envelope.message.value.timestamp > initTime) {
      this.emit('new-message', envelope, cabal, messageInfo)

      if (envelope.message.value.content.text !== '') {
        if (envelope.message.value.content.text.charAt(0) === this.symbol) {
          this.emit('new-command', envelope, cabal, messageInfo)
        } else {
          this.emit('new-non-command', envelope, cabal, messageInfo)
        }
      }
    } else {
      this.emit('old-message', envelope, cabal, messageInfo)

      if (envelope.message.value.content.text !== '') {
        if (envelope.message.value.content.text.charAt(0) === this.symbol) {
          this.emit('old-command', envelope, cabal, messageInfo)
        } else {
          this.emit('old-non-command', envelope, cabal, messageInfo)
        }
      }
    }
  }

  joinCabals (keys) {
    keys.forEach(key => {
      this.joinCabal(key)
    })
  }

  post (cabal, channel, text) {
    cabal.publishMessage({
      type: 'chat/text',
      content: {
        text,
        channel
      }
    })
  }

  broadcast (channels, text) {
    this.client.cabals.forEach((cabal) =>
      channels.forEach((channel) => {
        cabal.publishMessage({
          type: 'chat/text',
          content: {
            text: text,
            channel: channel
          }
        })
      })
    )
  }
}

module.exports = CabalBot
