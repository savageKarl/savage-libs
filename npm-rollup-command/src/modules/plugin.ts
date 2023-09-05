import type { InputOptions, OutputOptions, OutputChunk } from 'rollup'

import del from 'del'

import { runCommand, RunCommand } from './run'

export { RunCommand, CommandCaller } from './run'

/** provide some powerful api */
export interface IContext {
	/** be use to execute command by custom */
	run: RunCommand
	/** be use to del any file or folder by del lib  */
	del: typeof del
}

export interface hookOptions {
	/** build phase: the fist running hook */
	options?: (context: IContext, options: InputOptions) => void
	/** build phase: the second running hook */
	buildStart?: (context: IContext) => void
	/** build phase: the last running hook */
	buildEnd?: (context: IContext) => void

	/** Output Generation phase: the fist running hook */
	outputOptions?: (context: IContext, options: OutputOptions) => void
	/** Output Generation phase: the second running hook */
	renderStart?: (
		context: IContext,
		outputOptions: OutputOptions,
		inputOptions: InputOptions
	) => void
	/** Output Generation phase: the penultimate running hook */
	writeBundle?: (
		context: IContext,
		options: OutputOptions,
		bundle: OutputChunk
	) => void
	/** Output Generation phase: the last running hook */
	closeBundle?: (context: IContext) => void
}

const defaultHookOptions: hookOptions = {
	options() {
		return null
	},
	buildStart() {
		return null
	},
	buildEnd() {
		return null
	},
	outputOptions() {
		return null
	},
	renderStart() {
		return null
	},
	writeBundle() {
		return null
	},
	closeBundle() {
		return null
	}
}

const context: IContext = {
	run: runCommand,
	del
}
/**
 * a plugin function of rollup return config
 */
export const rollupCommand = (hookOptions?: hookOptions) => {
	const mergedOptions = Object.assign(
		{},
		defaultHookOptions,
		hookOptions
	) as Required<hookOptions>

	return {
		name: 'savage-rollup-command',
		options(options: InputOptions) {
			mergedOptions.options(context, options)
			return options
		},
		buildStart() {
			mergedOptions.buildStart(context)
		},
		buildEnd() {
			mergedOptions.buildEnd(context)
		},
		outputOptions(options: OutputOptions) {
			mergedOptions.outputOptions(context, options)
		},
		renderStart(outputOptions: OutputOptions, inputOptions: InputOptions) {
			mergedOptions.renderStart(context, outputOptions, inputOptions)
		},
		writeBundle(options: OutputOptions, bundle: OutputChunk) {
			mergedOptions.writeBundle(context, options, bundle)
		},
		closeBundle() {
			mergedOptions.closeBundle(context)
		}
	}
}

rollupCommand({
	options(context: IContext, options: InputOptions) {
		console.log(context, options)
		return options
	},
	buildStart(context: IContext) {
		console.log(context)
	},
	buildEnd(context: IContext) {
		// You can delete files here whenever you want
		context.del('./dist/*')
	},
	outputOptions(context: IContext, options: OutputOptions) {
		// or you can print options
		console.log(options)
	},
	renderStart(
		context: IContext,
		outputOptions: OutputOptions,
		inputOptions: InputOptions
	) {
		console.log(context, outputOptions, inputOptions)
	},
	writeBundle(context: IContext, options: OutputOptions, bundle: OutputChunk) {
		console.log(context, options, bundle)
	},
	closeBundle(context: IContext) {
		// You can also run some commands here\
		context.run('npm run test')
	}
})
