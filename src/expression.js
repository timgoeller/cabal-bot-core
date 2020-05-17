class CabalBotExpression {
  constructor (firstExpr) {
    this.firstExpr = firstExpr

    if (!this.firstExpr) {
      this.firstExpr = this
    }
  }

  onCommand (commandName) {
    if (!commandName) {
      throw new Error('name of command must be set')
    }
    this.resolve = this._resolveOnCommand(commandName)

    this.nextExpr = new CabalBotExpression(this.firstExpr)
    return this.nextExpr
  }

  _resolveOnCommand (commandName) {
    return (envelope, messageText, cabal) => {
      let beforeWhitespace = messageText.match(/^([^\s]+)/g)
      if (beforeWhitespace) {
        beforeWhitespace = beforeWhitespace[0]
      } else return { match: false }

      if (beforeWhitespace === commandName) {
        let afterWhitespace = messageText.match(/\s[\s\S]*/g)
        if (afterWhitespace) {
          afterWhitespace = afterWhitespace[0].substring(1)
        } else afterWhitespace = ''

        return { match: true, messageText: afterWhitespace }
      } else {
        return { match: false }
      }
    }
  }

  inChannel (channelName) {
    if (!channelName) {
      throw new Error('name of channel must be set')
    }
    this.resolve = this._resolveInChannel(channelName)

    this.nextExpr = new CabalBotExpression(this.firstExpr)
    return this.nextExpr
  }

  _resolveInChannel (channelName) {
    return (envelope, messageText, cabal) => {
      if (envelope.channel === channelName) {
        return { match: true, messageText: messageText }
      } else {
        return { match: false }
      }
    }
  }

  thenDo (cb) {
    this.cb = cb
  }

  _runExpression (cabal, envelope) {
    let messageText = envelope.message.value.content.text.substring(1)
    let currentExpression = this.firstExpr
    while (true) {
      if (!currentExpression.resolve) break
      const resolveResult = currentExpression.resolve(envelope, messageText, cabal)
      if (!resolveResult.match) return
      messageText = resolveResult.messageText
      currentExpression = currentExpression.nextExpr
    }

    if (currentExpression.cb) {
      currentExpression.cb(messageText, cabal, envelope)
    }
  }
}

module.exports = CabalBotExpression
