import { ipcMain, ipcRenderer } from 'electron'
import process from 'process'

import {
  mainToRender,
  renderFromMain,
  renderToMain,
  mainFromRender
} from '../src/ipc'

type Listener = (e: string, data: any) => any
type MsgItem = {
  type: 'on' | 'once'
  cb: Listener
}

vi.mock('electron', () => {
  function eventCenter(tab: string) {
    return {
      eventMap: new Map<string, Set<MsgItem>>(),
      on(channel: string, cb: Listener) {
        let msgs = this.eventMap.get(channel)
        if (!msgs) {
          msgs = new Set()
          this.eventMap.set(channel, msgs)
        }

        msgs.add({
          type: 'on',
          cb
        })
      },
      off(channel: string, cb: Listener) {
        let msgs = this.eventMap.get(channel)
        if (msgs) {
          const item = [...msgs].filter((v) => (v.cb = cb))[0]
          if (item) msgs.delete(item)
        }
      },
      emit(channel: string, data: any) {
        let msgs = this.eventMap.get(channel)
        if (msgs) {
          const arr = [...msgs]
          const onces = arr.filter((v) => v.type === 'once')
          arr.forEach((v) => v.cb(tab, data))
          onces.forEach((v) => msgs?.delete(v))
        }
      },
      once(channel: string, cb: Listener) {
        let msgs = this.eventMap.get(channel)

        if (!msgs) {
          msgs = new Set()
          this.eventMap.set(channel, msgs)
        }

        msgs.add({
          type: 'once',
          cb
        })
      },
      send(channel: string, data: any) {}
    }
  }
  const mockIpcMain = Object.assign(eventCenter('ipcMain'), {
    send(channel: string, data: any) {
      debugger
      mockIpcRenderer.emit(channel, data)
    }
  })

  const mockIpcRenderer = Object.assign(eventCenter('ipcRenderer'), {
    send(channel: string, data: any) {
      debugger
      mockIpcMain.emit(channel, data)
    }
  })

  return {
    ipcMain: mockIpcMain,
    ipcRenderer: mockIpcRenderer
  }
})

describe('should send to message', () => {
  test('test', () => {
    renderFromMain('hello', (data) => {
      console.log(data)
    })
  })
})
