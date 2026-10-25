
const { app, BrowserWindow, ipcMain, dialog, Notification } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 760,
    minHeight: 600,
    title: "Athena Desk",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function getNotesPath() {
  return path.join(app.getPath("userData"), "athena-notes.json");
}

function validateNotes(notes) {
  return (
    Array.isArray(notes) &&
    notes.length <= 1000 &&
    notes.every(
      (note) =>
        note &&
        Number.isSafeInteger(note.id) &&
        typeof note.title === "string" &&
        typeof note.content === "string" &&
        note.title.length <= 200 &&
        note.content.length <= 20000
    )
  );
}

ipcMain.handle("app:get-version", () => app.getVersion());

ipcMain.handle("notes:load", async () => {
  try {
    const content = await fs.readFile(getNotesPath(), "utf8");
    const notes = JSON.parse(content);
    return validateNotes(notes) ? notes : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
});

ipcMain.handle("notes:save", async (_event, notes) => {
  if (!validateNotes(notes)) throw new Error("Invalid notes data.");

  const filePath = getNotesPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(notes, null, 2), "utf8");

  return { success: true };
});

ipcMain.handle("notes:export", async (_event, notes) => {
  if (!validateNotes(notes)) throw new Error("Invalid notes data.");

  const result = await dialog.showSaveDialog({
    title: "Export Athena Desk Notes",
    defaultPath: "athena-notes.json",
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  });

  if (result.canceled || !result.filePath) return { canceled: true };

  await fs.writeFile(result.filePath, JSON.stringify(notes, null, 2), "utf8");
  return { success: true };
});

ipcMain.handle("notes:import", async () => {
  const result = await dialog.showOpenDialog({
    title: "Import Athena Desk Notes",
    properties: ["openFile"],
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const notes = JSON.parse(await fs.readFile(result.filePaths[0], "utf8"));

  if (!validateNotes(notes)) throw new Error("Invalid notes file.");

  return { success: true, notes };
});

ipcMain.handle("notification:show", (_event, options) => {
  if (
    !options ||
    typeof options.title !== "string" ||
    typeof options.body !== "string"
  ) {
    throw new Error("Invalid notification data.");
  }

  if (!Notification.isSupported()) {
    return { success: false, reason: "unsupported" };
  }

  new Notification({
    title: options.title.slice(0, 100),
    body: options.body.slice(0, 300),
  }).show();

  return { success: true };
});

// Window-control IPC handlers
ipcMain.handle("window:minimize", () => {
  mainWindow?.minimize();
});

ipcMain.handle("window:toggle-maximize", () => {
  if (!mainWindow) return false;

  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }

  return mainWindow.isMaximized();
});

ipcMain.handle("window:close", () => {
  mainWindow?.close();
});

ipcMain.handle("window:is-maximized", () => {
  return mainWindow?.isMaximized() ?? false;
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
