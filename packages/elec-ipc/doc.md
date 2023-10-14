## feature

- Two-way communication from main process to rendering process
- Two-way communication from renderer process to main process
- Render process to render process bidirectional communication

## use

### The main process communicates with the rendering process

> main.ts (Main Process)

```typescript
import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import path from 'path'
import { send, addToChannel } from 'elec-ipc'

function createWindow() {
	const mainWindow = new BrowserWindow({
		webPreferences: {
			preload: path.join(__dirname, 'preload.ts'),
			// This option needs to be enable, otherwise preload cannot access the node module
			nodeIntegration: true
		}
	})

	// Add windows that need to communicate, this step is very important
	addToChannel(mainWindow)

	send<string>('msg', 'hello')
		.then(res => {
			console.log(res)
		})
		.catch(err => {
			console.log(err)
		})
	mainWindow.loadFile('index.html')
}

// ...
```

> preload.ts (Preload Script)

```typescript
import { receive } from "elec-ipc";

receive("msg", (e, arg) => {
  console.log(arg);
  return "hi,there!";
});
```

### The rendering process communicates with the main process

> main.ts (Main Process)

```typescript
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import { addToChannel, receive } from "elec-ipc";

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
    },
  });

  // Add windows that need to communicate, this step is very important
  addToChannel(mainWindow);

  receive("msg", (e, v) => {
    console.log(v); // 'hello'
    return "how dare you!";
  });
  mainWindow.loadFile("index.html");
}
// ...
```

> preload.ts (Preload Script)

```typescript
import { send } from "elec-ipc";

send("msg", "hello");
```

### Rendering process communicates with rendering process

> main.ts (Main Process)

```typescript
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import { addToChannel, receive } from "elec-ipc";

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
    },
  });

  const secondWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
    },
  });

  // Add windows that need to communicate, this step is very important
  addToChannel([mainWindow, secondWindow]);

  mainWindow.loadFile("index.html");
  secondWindow.loadFile("index.html");
}
// ...
```

> preload.ts (Preload Script)

```typescript
import { send } from "elec-ipc";

send("msg", "hello");
```

> preload2.ts (Preload Script)

```typescript
import { receive } from "elec-ipc";

ireceive("msg", (e, v) => {
  console.log(v); // 'hello'
  return "how dare you!";
});
```
