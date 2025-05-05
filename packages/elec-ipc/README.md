# elec-ipc

`elec-ipc`是一个使不同进程之间通信更加简单，更加方便的模块， 开箱即用！

## 功能

- 主进程到渲染进程的双向通信
- 渲染进程到主进程的双向通信
- 渲染进程到渲染进程的双向通信

## 使用

### 主进程与渲染进程通信

> main.ts (Main Process)

```typescript
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import ipc from "elec-ipc";

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
      // 需要打开这个选项，要不然 preload 无法访问 node 模块
      nodeIntegration: true,
    },
  });

  // 添加需要进行通信的窗口，这一步很重要
  ipc.addToChannel(mainWindow);

  ipc
    .send<string>("滴滴滴", "天王盖地虎")
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
  mainWindow.loadFile("index.html");
}
// ...
```

> preload.ts (Preload Script)

```typescript
import ipc from "elec-ipc";

ipc.renderFromMain("滴滴滴", (e, arg) => {
  console.log(arg);
  return "宝塔镇河妖";
});
```

### 渲染进程与主进程通信

> main.ts (Main Process)

```typescript
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import ipc from "elec-ipc";

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
    },
  });

  // 添加需要进行通信的窗口
  ipc.addToChannel(mainWindow);

  ipc.receive("msg", (e, v) => {
    console.log(v); // 'hello'
    return "how dare you!";
  });
  mainWindow.loadFile("index.html");
}
// ...
```

> preload.ts (Preload Script)

```typescript
import ipc from "elec-ipc";

ipc.send("msg", "hello");
```

### 渲染进程与渲染进程通信

> main.ts (Main Process)

```typescript
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import ipc from "elec-ipc";

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

  // 添加需要进行通信的窗口
  ipc.addToChannel([mainWindow, secondWindow]);

  mainWindow.loadFile("index.html");
  secondWindow.loadFile("index.html");
}
// ...
```

> preload.ts (Preload Script)

```typescript
import ipc from "elec-ipc";

ipc.send("msg", "hello");
```

> preload2.ts (Preload Script)

```typescript
import ipc from "elec-ipc";

ipc.receive("msg", (e, v) => {
  console.log(v); // 'hello'
  return "how dare you!";
});
```
