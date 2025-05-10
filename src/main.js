import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'node:path';
import fs, { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { set_fs, readFile, utils } from 'xlsx';
import started from 'electron-squirrel-startup';

set_fs(fs);

if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'), // __dirname is safe here (main process)
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();
};

// IPC handler to open file dialog and read Excel
ipcMain.handle('read-excel', async () => {
  try {
    const downloadsPath = join(homedir(), 'Downloads');
    const filePath = join(downloadsPath, 'file.xlsx');

    if (!existsSync(filePath)) {
      return { success: false, error: 'File "file.xlsx" not found in Downloads folder' };
    }

    const workbook = readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Read only first 4 columns, skip header, treat null as empty, limit to 24 rows
    const data = utils.sheet_to_json(sheet, {
      header: ['time', 'lot_number', 'camera', 'status'],
      range: 1, // Skip first row (header)
      defval: '' // Replace null/undefined with empty string
    }).map(row => ({
      time: row.time,
      lot_number: row.lot_number,
      camera: row.camera,
      status: row.status
    })).slice(0, 24); // Limit to 24 rows

    return { success: true, data };
  } catch (error) {
    return { success: false, error: `Error reading file: ${error.message}` };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});