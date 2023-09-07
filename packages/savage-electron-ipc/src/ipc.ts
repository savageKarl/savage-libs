import {
	ipcMain,
	ipcRenderer,
	IpcRendererEvent,
	IpcMainInvokeEvent,
	BrowserWindow
} from 'electron'

/** render process send message to main process  */
const renderToMain = <T = any>(channel: string, args: any[]) => {
	return ipcRenderer.invoke(channel, args) as Promise<T>
}

/** main process receive message from render process  */
const mainFromRender = <T = any[]>(
	channel: string,
	listener: (event: IpcMainInvokeEvent, args: T) => any
) => {
	return ipcMain.handle(channel, listener)
}

/** main process send message to render process  */
const mainToRender = <T = any[]>(channel: string, args: any[]) => {
	windowList.forEach(w => w.webContents.send(channel, args))
	return new Promise<T>(resolve => {
		ipcMain.on('bi-directional', (e, args) => {
			resolve(args)
		})
	})
}

/**
 * render process receive message from main process
 * @param channel - The name of the event.
 * @param listener - The callback function
 */
const renderFromMain = <T = any[]>(
	channel: string,
	listener: (event: IpcRendererEvent, args: T) => void
) => {
	ipcRenderer.on(channel, (e, args) => {
		ipcRenderer.send('bi-directional', listener(e, args))
	})
}

// use to have the main process send message to render process
const windowList: BrowserWindow[] = []

function isBrowserWindow(v: unknown): v is BrowserWindow {
	return Object.prototype.toString.call(v) === '[object Object]'
}

function isBrowserWindowArray(v: unknown): v is BrowserWindow[] {
	return Object.prototype.toString.call(v) === '[object Array]'
}

/**
 * add window to communication channel
 * @public
 *
 * @param window - The window that needs to communicate
 *
 */
export function addToChannel(window: BrowserWindow | BrowserWindow[]) {
	if (isBrowserWindow(window)) windowList.push(window)
	if (isBrowserWindowArray(window)) windowList.push(...window)
}

/**
 * render process receive message from main process
 * @public
 *
 * @param channel - The name of the event.
 * @param args - What you want to send
 *
 * @example
 *
 * ```typescript
 * ipc.receive("msg", (e, v) => {
 *   console.log(v); // 'hello'
 *   return "how dare you!";
 * });
 * ```
 */
export function send<T = any>(channel: string, ...args: any[]) {
	let p = new Promise<T>(() => null)

	if (ipcMain) p = mainToRender(channel, args)
	if (ipcRenderer) {
		p = renderToMain(channel, args)
		renderToMain('forward', [channel, args])
	}
	return p
}

/**
 * render process receive message from main process
 *
 * @public
 * @param channel - The name of the event.
 * @param listener - The callback function
 */
export function receive<T = any[]>(
	channel: string,
	listener: (event: IpcMainInvokeEvent | IpcRendererEvent, args: T) => any
) {
	if (ipcMain) mainFromRender(channel, listener)
	if (ipcRenderer) renderFromMain(channel, listener)
}

// proxy forward message from render process to render process
receive<[string, any]>('forward', (e, args) => mainToRender(args[0], args[1]))
