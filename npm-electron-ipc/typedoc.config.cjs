/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
	entryPoints: ['./src/index.ts'],
	out: 'docs',
	// disableGit: true,
	// disableSources: true,
	readme: './readme.md',
	plugin: ['@mxssfd/typedoc-theme'],
	theme: 'my-theme'
}
