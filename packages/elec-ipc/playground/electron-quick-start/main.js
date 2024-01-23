const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const { send, addToChannel } = require('elec-ipc')

function createWindow() {
	const mainWindow = new BrowserWindow({
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			// This option needs to be enable, otherwise preload cannot access the node module
			nodeIntegration: true
		}
	})

	mainWindow.webContents.openDevTools()

	// Add windows that need to communicate, this step is very important
	addToChannel(mainWindow)

	setTimeout(() => {
		send('msg', 'hello')
			.then(res => {
				console.log(res)
			})
			.catch(err => {
				console.log(err)
			})
	}, 5000)

	mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})
