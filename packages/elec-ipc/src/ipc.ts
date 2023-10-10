import {
	ipcMain,
	ipcRenderer,
	IpcRendererEvent,
	IpcMainInvokeEvent,
	BrowserWindow
} from 'electron'

/** render process send message to main process  */
const renderToMain = <T = unknown>(channel: string, ...args: unknown[]) => {
	return ipcRenderer.invoke(channel, ...args) as Promise<T>
}

/** main process receive message from render process  */
const mainFromRender = <T = unknown>(
	channel: string,
	listener: (event: IpcMainInvokeEvent, ...args: T[]) => unknown
) => {
	return ipcMain.handle(channel, listener)
}

/** main process send message to render process  */
const mainToRender = <T = unknown>(channel: string, ...args: unknown[]) => {
	windowList.forEach(w => w.webContents.send(channel, ...args))
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
const renderFromMain = <T = unknown>(
	channel: string,
	listener: (event: IpcRendererEvent, ...args: T[]) => void
) => {
	ipcRenderer.on(channel, (e, args) => {
		ipcRenderer.send('bi-directional', listener(e, args))
	})
}

// use to have the main process send message to render process
const windowList: BrowserWindow[] = []

const isInMainProcess = ipcMain
const isInRenderProcess = ipcRenderer

/**
 * add window to communication channel
 * @public
 *
 * @param window - The window that needs to communicate
 *
 */
export function addToChannel(window: BrowserWindow | BrowserWindow[]) {
	window = Array.isArray(window) ? window : [window]
	windowList.push(...window)
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
export function send<T = unknown>(channel: string, ...args: unknown[]) {
	let p = new Promise<T>(() => null)

	if (isInMainProcess) p = mainToRender(channel, args)
	if (isInRenderProcess) {
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
export function receive<T = unknown[]>(
	channel: string,
	listener: (event: IpcMainInvokeEvent | IpcRendererEvent, args: T) => unknown
) {
	if (isInMainProcess) mainFromRender(channel, listener)
	if (isInRenderProcess) renderFromMain(channel, listener)
}

// proxy forward message from render process to render process
receive<[string, unknown]>('forward', (e, args) =>
	mainToRender(args[0], args[1])
)
