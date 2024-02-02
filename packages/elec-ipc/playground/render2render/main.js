/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-restricted-globals */
const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const { send, addToChannel } = require('elec-ipc')

function createWindow (preload) {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, preload + '.js'),
      // This option needs to be enable, otherwise preload cannot access the node module
      nodeIntegration: true
    }
  })

  mainWindow.webContents.openDevTools()

  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow('preload')
  createWindow('preload2')

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
