
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");

// Create the application window
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

// Location of the persistent notes file
function getNotesPath() {
  return path.join(app.getPath("userData"), "athena-notes.json");
}

// IPC: Return the application version
ipcMain.handle("app:get-version", () => {
  return app.getVersion();
});

// IPC: Load saved notes
ipcMain.handle("notes:load", async () => {
  try {
    const content = await fs.readFile(getNotesPath(), "utf8");
    const notes = JSON.parse(content);

    return Array.isArray(notes) ? notes : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
});

// IPC: Save notes to the local filesystem
ipcMain.handle("notes:save", async (_event, notes) => {
  if (!Array.isArray(notes) || notes.length > 1000) {
    throw new Error("Invalid notes data.");
  }

  const isValid = notes.every(
    (note) =>
      note &&
      Number.isSafeInteger(note.id) &&
      typeof note.title === "string" &&
      typeof note.content === "string" &&
      note.title.length <= 200 &&
      note.content.length <= 20000
  );

  if (!isValid) {
    throw new Error("Invalid note format.");
  }

  const notesPath = getNotesPath();

  await fs.mkdir(path.dirname(notesPath), {
    recursive: true,
  });

  await fs.writeFile(
    notesPath,
    JSON.stringify(notes, null, 2),
    "utf8"
  );

  return { success: true };
});

// Start Electron after initialization
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit on all windows closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
