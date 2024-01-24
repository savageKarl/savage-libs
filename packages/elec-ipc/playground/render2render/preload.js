const { send, receive } = require('elec-ipc')

console.log('here is renderer 1')

send('renderer:msg', 'hello', data => {
	console.log('renderer1 get answer', data)
})

receive('renderer2:msg', data => {
	console.log('renderer1 receive', data)

	return 'baz'
})
