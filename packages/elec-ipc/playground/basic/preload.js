/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-restricted-globals */
const { receive, send } = require('elec-ipc')

receive('mainMsg', data => {
  console.log('RendererReceive', data)

  return 'hi,there'
})

console.log('renderer send', 'have a good day')
send('rendererMsg', 'have a good day', data => {
  console.log('mainAnswer', data)
})
