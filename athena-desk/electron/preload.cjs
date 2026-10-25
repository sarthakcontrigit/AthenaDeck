
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("athenaAPI", {
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),
  loadNotes: () => ipcRenderer.invoke("notes:load"),
  saveNotes: (notes) => ipcRenderer.invoke("notes:save", notes),
  exportNotes: (notes) => ipcRenderer.invoke("notes:export", notes),
  importNotes: () => ipcRenderer.invoke("notes:import"),
  showNotification: (options) =>
    ipcRenderer.invoke("notification:show", options),
});

