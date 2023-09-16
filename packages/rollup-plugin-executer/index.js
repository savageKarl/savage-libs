'use strict'

if (process.env.NODE_ENV === 'production') {
	module.exports = require('./dist/rollup-command.cjs.prod.js')
} else {
	module.exports = require('./dist/rollup-command.cjs.js')
}
