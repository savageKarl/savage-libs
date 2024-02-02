## Feature

- two-way communication between the rendering process and the main process
- renderer process to renderer process bidirectional communication

## Usage

### between the renderer process and the main process

::: code-group

<<< ../../../packages/elec-ipc/playground/basic/main.js{10,20-42}
<<< ../../../packages/elec-ipc/playground/basic/preload.js

:::


### between the renderer process and the renderer process

::: code-group

<<< ../../../packages/elec-ipc/playground/render2render/main.js{9,18,19}
<<< ../../../packages/elec-ipc/playground/render2render/preload.js
<<< ../../../packages/elec-ipc/playground/render2render/preload2.js

:::
