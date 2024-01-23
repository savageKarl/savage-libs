const { receive } = require('elec-ipc')

document.addEventListener('DOMContentLoaded', () => {
	const btn = document.getElementById('btn')
	btn.addEventListener('click', async () => {
		// receive('msg').then(arg => {
		// 	debugger
		// 	console.log(arg)
		// 	return 'hi,there!'
		// })
		const args = await receive('msg')
		console.log(args)
		return 'hi,there'
	})
})
