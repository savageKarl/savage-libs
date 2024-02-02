const { send, receive } = require('elec-ipc')

console.log('here is renderer1')
console.log('renderer1 send', 'hello')
send('renderer:msg', 'hello', (data) => {
  console.log('renderer1 get answer', data)
})

receive('renderer2:msg', (data) => {
  console.log('renderer1 receive', data)
  console.log('renderer1 answer', 'baz')
  return 'baz'
})
