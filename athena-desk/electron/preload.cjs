
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("athenaAPI", {
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),
});
