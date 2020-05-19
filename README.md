# Cabal Bot Core
Basic functionality for cabal bots (https://cabal.chat/). For more advanced command parsing see `cabal-bot-pipeline`.

## Getting Started 
### Installing
`npm install cabal-bot-core`

### Examples

```javascript
var CabalBot = require('cabal-bot')

const cb = new CabalBot('test-bot')

cb.on('new-command', (envelope, cabalDetails) => {
  console.log('command entered!')
})

cb.on('new-message', (envelope, cabalDetails) => {
  cabal.publishMessage({
    type: 'chat/text',
    content: {
      text: envelope.message.value.content.text,
      channel: envelope.channel
    }
  })
})

cb.joinCabal("{key})
```
