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
    return this._constructResolver(this._resolveOnCommand(commandName))
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
    return this._constructResolver(this._resolveInChannel(channelName))
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

  inCabal (cabalKey) {
    if (!cabalKey || cabalKey.length !== 64) {
      throw new Error('key of cabal must be set and 64 characters long')
    }

    return this._constructResolver(this._resolveInCabal(cabalKey))
  }

  _resolveInCabal (cabalKey) {
    return (envelope, messageText, cabal) => {
      if (cabal._cabal.key === cabalKey) {
        return { match: true, messageText: messageText }
      } else {
        return { match: false }
      }
    }
  }

  do (cb) {
    this.cb = cb
  }

  _constructResolver (resolveMethod) {
    /* resolveMethod is a curried method with bounded check variables, so it can be called later */
    this.resolve = resolveMethod

    this.nextExpr = new CabalBotExpression(this.firstExpr)
    return this.nextExpr
  }

  _runExpression (cabal, envelope) {
    let messageText = envelope.message.value.content.text.substring(1)
    let currentExpression = this.firstExpr
    while (true) {
      /* when there is no resolve, this is the end of the pipeline (containing the cb) */
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
