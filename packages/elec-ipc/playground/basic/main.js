const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const { send, receive } = require('elec-ipc')

function createWindow () {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // This option needs to be enable, otherwise preload cannot access the node module
      nodeIntegration: true
    }
  })
  mainWindow.webContents.openDevTools()
  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  console.log('main send', 'first msg')
  send('mainMsg', 'first msg', data => {
    console.log('rendererAnswer', data)
  })

  setTimeout(() => {
    console.log('main send', 'second msg')
    send('mainMsg', 'second msg', data => {
      console.log('rendererAnswer', data)
    })
  }, 1000)

  setTimeout(() => {
    console.log('main send', 'third msg')
    send('mainMsg', 'third msg', data => {
      console.log('rendererAnswer', data)
    })
  }, 3000)

  receive('rendererMsg', data => {
    console.log('mainReceive', data)
    return 'nice for you'
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
