
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
  shell,
} = require("electron");

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

function getDataPath(filename) {
  return path.join(app.getPath("userData"), filename);
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

function validateTasks(tasks) {
  return (
    Array.isArray(tasks) &&
    tasks.length <= 5000 &&
    tasks.every(
      (task) =>
        task &&
        Number.isSafeInteger(task.id) &&
        typeof task.title === "string" &&
        task.title.trim().length > 0 &&
        task.title.length <= 500 &&
        typeof task.completed === "boolean"
    )
  );
}

async function readJsonFile(filename) {
  try {
    return JSON.parse(
      await fs.readFile(getDataPath(filename), "utf8")
    );
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeJsonFile(filename, data) {
  const filePath = getDataPath(filename);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  await fs.writeFile(
    filePath,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

ipcMain.handle("app:get-version", () => app.getVersion());

ipcMain.handle("notes:load", async () => {
  const notes = await readJsonFile("athena-notes.json");
  return validateNotes(notes) ? notes : [];
});

ipcMain.handle("notes:save", async (_event, notes) => {
  if (!validateNotes(notes)) {
    throw new Error("Invalid notes data.");
  }

  await writeJsonFile("athena-notes.json", notes);
  return { success: true };
});

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

ipcMain.handle("notes:import", async () => {
  const result = await dialog.showOpenDialog({
    title: "Import Athena Desk Notes",
    properties: ["openFile"],
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  });

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }

  const notes = JSON.parse(
    await fs.readFile(result.filePaths[0], "utf8")
  );

  if (!validateNotes(notes)) {
    throw new Error("Invalid notes file.");
  }

  return { success: true, notes };
});

// Persistent task storage
ipcMain.handle("tasks:load", async () => {
  const tasks = await readJsonFile("athena-tasks.json");
  return validateTasks(tasks) ? tasks : [];
});

ipcMain.handle("tasks:save", async (_event, tasks) => {
  if (!validateTasks(tasks)) {
    throw new Error("Invalid tasks data.");
  }

  await writeJsonFile("athena-tasks.json", tasks);
  return { success: true };
});

// Native notifications
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

// Window controls
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

// System information
ipcMain.handle("system:get-info", () => ({
  platform: process.platform,
  architecture: process.arch,
  electron: process.versions.electron,
  chrome: process.versions.chrome,
  node: process.versions.node,
  appVersion: app.getVersion(),
}));

ipcMain.handle("shell:open-external", async (_event, url) => {
  if (typeof url !== "string") {
    throw new Error("Invalid URL.");
  }

  const parsedUrl = new URL(url);

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Only HTTPS links are allowed.");
  }

  await shell.openExternal(parsedUrl.toString());
  return { success: true };
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
  if (process.platform !== "darwin") {
    app.quit();
  }
});
