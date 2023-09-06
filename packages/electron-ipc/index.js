'use strict'

if (process.env.NODE_ENV === 'production') {
	module.exports = require('./dist/electron-ipc.cjs.prod.js')
} else {
	module.exports = require('./dist/electron-ipc.cjs.js')
}
