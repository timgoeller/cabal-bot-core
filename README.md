cabal-bot

```javascript
cb = new CabalBot('example-bot', {channels: ["default","weather"]})

//react to !log ping
cb.pipeline().onCommand('log').onCommand('ping').thenDo(
  (messageText, cabal, envelope) => 
  {console.log("ping!")}
)

//react to !log pong
cb.pipeline().onCommand('log').onCommand('pong').thenDo(
  (messageText, cabal, envelope) => 
  {console.log('pong!')}
)

//return whatever the user enters after !return
cb.pipeline().onCommand('return').thenDo(
  (messageText, cabal, envelope) => 
  {cabal.publishMessage({
    type: 'chat/text',
    content: {
      text: messageText,
      channel: envelope.channel
    }})
  }
)

//react to !weatherreport in a channel named weather
cb.pipeline().onCommand('weatherreport').inChannel('weather').thenDo(
  (messageText, cabal, envelope) => 
  {cabal.publishMessage({
    type: 'chat/text',
    content: {
      text: 'the weather is nice and clear',
      channel: envelope.channel
    }})
  }
)
cb.joinCabal('{key}')
```