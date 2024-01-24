const { receive, send } = require('elec-ipc')

receive('mainMsg', data => {
	console.log('RendererReceive', data)

	return 'hi,there'
})

send('rendererMsg', 'have a good day', data => {
	console.log('mainAnswer', data)
})
