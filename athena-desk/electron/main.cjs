
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");

function createWindow() {
  const mainWindow = new BrowserWindow({
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
  if (!validateNotes(notes)) {
    throw new Error("Invalid notes data.");
  }

  const filePath = getNotesPath();

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(notes, null, 2), "utf8");

  return { success: true };
});

// Export notes using the native Save dialog.
ipcMain.handle("notes:export", async (_event, notes) => {
  if (!validateNotes(notes)) {
    throw new Error("Invalid notes data.");
  }

  const result = await dialog.showSaveDialog({
    title: "Export Athena Desk Notes",
    defaultPath: "athena-notes.json",
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  await fs.writeFile(
    result.filePath,
    JSON.stringify(notes, null, 2),
    "utf8"
  );

  return { success: true };
});

// Import notes using the native Open dialog.
ipcMain.handle("notes:import", async () => {
  const result = await dialog.showOpenDialog({
    title: "Import Athena Desk Notes",
    properties: ["openFile"],
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const content = await fs.readFile(result.filePaths[0], "utf8");
  const notes = JSON.parse(content);

  if (!validateNotes(notes)) {
    throw new Error("The selected file does not contain valid Athena notes.");
  }

  return { success: true, notes };
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
