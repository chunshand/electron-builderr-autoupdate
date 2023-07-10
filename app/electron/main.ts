import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { autoUpdater } from "electron-updater"
import { updateHandle } from './lib/update';
import { resHandle } from './lib/resload';

Object.defineProperty(app, 'isPackaged', {
  get() {
    return true;
  }
});

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')
app.setLoginItemSettings({
  openAtLogin: true
})

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false,
    fullscreen: true
  })
  ipcMain.on('update', function (event) {
    const webContents = event.sender
    updateHandle(autoUpdater, webContents);
    autoUpdater.checkForUpdates();
  })
  ipcMain.on("res", function (event) {
    const webContents = event.sender
    resHandle(webContents);
  })
  ipcMain.on("getAppInfo", function (event) {
    const webContents = event.sender
    webContents.send("getAppInfo", app.getVersion());
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
  // win.webContents.openDevTools()

}

app.on('window-all-closed', () => {
  win = null
})

app.whenReady().then(createWindow)
