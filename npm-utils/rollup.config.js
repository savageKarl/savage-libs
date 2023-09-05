import { getRollupConfig } from 'savage-rollup-config'

export default getRollupConfig(function (o) {
	const i = o[0].plugins.findIndex(v => v.name === 'savage-rollup-command')
	o[0].plugins.splice(i, 1)
})
