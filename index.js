module.exports = require('./src/cabal-bot.js')

CabalBot = require('./src/cabal-bot.js')

const cb = new CabalBot('example-bot', { channels: ["default","weather"] })

// react to !log ping
cb.pipeline().onCommand('log').inCabal('e3b140ac59be0987e8ee01f4ba6a79c804a75985731e2cbeefe45f4e92c79170').do(
  (messageText, cabal, envelope) => {
    console.log('ping!')
  }
)

cb.joinCabal('e3b140ac59be0987e8ee01f4ba6a79c804a75985731e2cbeefe45f4e92c79170')
