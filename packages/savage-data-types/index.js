'use strict'

if (process.env.NODE_ENV === 'production') {
	module.exports = require('./dist/data-types.cjs.prod.js')
} else {
	module.exports = require('./dist/data-types.cjs.js')
}
