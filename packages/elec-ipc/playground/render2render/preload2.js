/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-restricted-globals */
const { receive, send } = require('elec-ipc')

console.log('here is renderer 2')

receive('renderer:msg', data => {
  console.log('renderer2 receive', data)

  console.log('renderer2 answer', 'hi,there')
  return 'hi,there'
})

console.log('renderer2 send', 'foo')
send('renderer2:msg', 'foo', data => {
  console.log('renderer2 get answer', data)
})
