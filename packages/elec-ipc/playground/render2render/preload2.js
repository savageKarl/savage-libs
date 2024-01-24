const { receive, send } = require('elec-ipc')

console.log('here is renderer 2')

receive('renderer:msg', data => {
	console.log('renderer2 receive', data)

	return 'hi,there'
})

send('renderer2:msg', 'foo', data => {
	console.log('renderer2 get answer', data)
})
