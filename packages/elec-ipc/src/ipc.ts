import { ipcMain, ipcRenderer, IpcMainEvent, BrowserWindow } from 'electron'
import { getUniqueId } from './utils'

type Callback<T = any> = (data: T) => any
type Payload<T = unknown> = {
	data: T
	id: string
}

/** render process send message to main process  */
export const renderToMain = <T = unknown>(
	channel: string,
	data: unknown,
	callback: Callback<T>
) => {
	const id = getUniqueId()
	const payload: Payload = { data, id }
	const listener = async (e: any, payload: Payload<T>) => callback(payload.data)

	ipcRenderer.once(id, listener)
	ipcRenderer.send(channel, payload)
}

/** main process receive message from render process  */
export const mainFromRender = <T = unknown>(
	channel: string,
	callback: Callback<T>
) => {
	const listener = async (e: IpcMainEvent, payload: Payload<T>) => {
		const { id } = payload
		payload.data = await callback(payload.data)

		const window = BrowserWindow.fromWebContents(e.sender)
		if (!(window && window.isDestroyed())) {
			e.sender.send(id, payload)
		}
	}

	ipcMain.on(channel, listener)
	return () => ipcMain.off(channel, listener)
}

/** main process send message to render process  */
export const mainToRender = <T = unknown>(
	channel: string,
	data: unknown,
	callback: Callback<T>
) => {
	debugger
	const id = getUniqueId()
	const payload: Payload = { data, id }
	const listener = (e: any, payload: Payload<T>) => callback(payload.data)

	ipcMain.once(id as any, listener)
	BrowserWindow.getAllWindows().forEach(w => {
		if (w.webContents) {
			w.webContents.send(channel, payload)
		}
	})
}

/**
 * render process receive message from main process
 * @param channel - The name of the event.
 * @param callback - The callback function
 */
export const renderFromMain = <T = unknown>(
	channel: string,
	callback: Callback<T>
) => {
	const listener = async (e: any, payload: Payload<T>) => {
		const { id } = payload
		payload.data = await callback(payload.data)
		ipcRenderer.send(id, payload)
	}

	ipcRenderer.on(channel, listener)
	return () => ipcRenderer.off(channel, listener)
}

export const processType = {
	isMainProcess: process.type === 'browser',
	isRenderProcess: process.type === 'renderer'
}

export function send<T = unknown>(
	channel: string,
	data: unknown,
	callback: Callback<T>
) {
	if (processType.isMainProcess) mainToRender(channel, data, callback)
	if (processType.isRenderProcess) {
		renderToMain(channel, data, callback)
		renderToMain('forward', [channel, data], callback)
	}
}

/**
 * render process receive message from main process
 *
 * @public
 * @param channel - The name of the event.
 * @param listener - The callback function
 */
export function receive<T = unknown[]>(channel: string, callback: Callback<T>) {
	if (processType.isMainProcess) return mainFromRender(channel, callback)
	if (processType.isRenderProcess) return renderFromMain(channel, callback)
}

// proxy forward message from render process to render process
if (processType.isMainProcess) {
	mainFromRender<[string, unknown]>('forward', async data => {
		let resolve: Callback<any>
		let result: any

		function setP() {
			const p = new Promise(res => {
				resolve = res
			}).then(res => (result = res))
			return p
		}

		const p = setP()
		mainToRender(data[0], data[1], resolve!)
		await p
		return result
	})
}
