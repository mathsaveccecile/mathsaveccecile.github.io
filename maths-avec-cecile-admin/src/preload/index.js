import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  chooseImage: () => ipcRenderer.invoke('choose-image'),
  chooseVideo: () => ipcRenderer.invoke('choose-video'),
  choosePdf: () => ipcRenderer.invoke('choose-pdf'),
  openCapsule: () => ipcRenderer.invoke('open-capsule'),
  exportSite: (data) => ipcRenderer.invoke('export-site', data),
  saveProject: (data) => ipcRenderer.invoke('save-project', data),
  listCapsules: () => ipcRenderer.invoke('list-capsules'),
openProject: (filename) => ipcRenderer.invoke('open-project', filename),
importSite: () => ipcRenderer.invoke('import-site')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
