const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("athenaAPI", {});