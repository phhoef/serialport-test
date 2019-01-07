const electron = require('electron')
const { app, Menu, BrowserWindow, ipcMain } = electron
const isDev = require('electron-is-dev');
const windowStateKeeper = require('electron-window-state')
const serialport = require('serialport')

// Let electron reloads by itself when webpack watches changes in ./app/
if (isDev) {
  require('electron-reload')(__dirname)
  require('electron-debug')({ showDevTools: false });
}

// To avoid being garbage collected
let mainWindow = null

app.on("ready", createWindow);

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});


ipcMain.on('request-serial-ports', () => {
  serialport.list((err, ports) => {
    mainWindow.webContents.send('response-serial-ports', ports)
  })
})

let port
ipcMain.on('request-serial-connect', (event, device) => {
  if(port)
    port.close()
    
  port = new serialport(device, {
    baudRate: 9600
  })
  port.on('data', onData)
  port.on('error', onError)
})

function onData(data) {
  mainWindow.webContents.send('response-serial-command', data)
}

function onError(error) {

}

ipcMain.on('request-serial-command', (event, command) => {
  console.log(command)
  port.write(command)
})

function setMenu() {
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
}

function createWindow() {

  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1300,
    defaultHeight: 900,
    file: 'main-window-state-json'
  });

  mainWindow = new BrowserWindow({ x: mainWindowState.x, y: mainWindowState.y, width: mainWindowState.width, minWidth: 800, height: mainWindowState.height, minHeight: 600 })
  mainWindow.loadURL(`file://${__dirname}/app/views/index.html`)
  setMenu()

  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: app.getName(),
      applicationVersion: app.getVersion(),
    })
  }
  mainWindow.on("closed", () => app.quit());

  mainWindowState.manage(mainWindow)
}

// Create menu template
const mainMenuTemplate = [
  {
    label: 'Edit',
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select all", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
      { type: "separator" }
    ]
  }
];

// If OSX, add empty object to menu
if (process.platform === 'darwin') {
  mainMenuTemplate.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })
}
else {
  mainMenuTemplate.unshift({
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  })
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push(createDevMenuItem());
}

function createDevMenuItem() {
  return {
    label: 'Developer Tools',
    submenu: [
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator: 'CmdOrCtrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  }
}