
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("athenaAPI", {
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),

  loadNotes: () => ipcRenderer.invoke("notes:load"),
  saveNotes: (notes) => ipcRenderer.invoke("notes:save", notes),
  exportNotes: (notes) => ipcRenderer.invoke("notes:export", notes),
  importNotes: () => ipcRenderer.invoke("notes:import"),

  loadTasks: () => ipcRenderer.invoke("tasks:load"),
  saveTasks: (tasks) => ipcRenderer.invoke("tasks:save"),

  showNotification: (options) =>
    ipcRenderer.invoke("notification:show", options),

  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  toggleMaximizeWindow: () =>
    ipcRenderer.invoke("window:toggle-maximize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  isWindowMaximized: () => ipcRenderer.invoke("window:is-maximized"),

  getSystemInfo: () => ipcRenderer.invoke("system:get-info"),
  openExternal: (url) => ipcRenderer.invoke("shell:open-external", url),
});
