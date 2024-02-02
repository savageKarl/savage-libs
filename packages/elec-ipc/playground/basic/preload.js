const { receive, send } = require('elec-ipc')

const cancel = receive('mainMsg', data => {
  console.log('RendererReceive', data)
  return 'hi,there'
})

setTimeout(() => {
  cancel()
}, 2000)

console.log('renderer send', 'have a good day')
send('rendererMsg', 'have a good day', data => {
  console.log('mainAnswer', data)
})
