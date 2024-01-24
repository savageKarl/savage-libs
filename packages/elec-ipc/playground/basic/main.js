const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const { send, receive } = require('elec-ipc')

function createWindow() {
	const mainWindow = new BrowserWindow({
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			// This option needs to be enable, otherwise preload cannot access the node module
			nodeIntegration: true
		}
	})

	mainWindow.webContents.openDevTools()

	send('mainMsg', 'mainMsg:hello', data => {
		console.log('rendererAnswer', data)
	})

	receive('rendererMsg', data => {
		console.log('mainReceive', data)

		return 'nice for you'
	})

	mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})
