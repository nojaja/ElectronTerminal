'use strict'

import { app, protocol, BrowserWindow, ipcMain} from 'electron'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
const execa = require('execa');
const iconv = require("iconv-lite");
const isDevelopment = process.env.NODE_ENV !== 'production'
const fixPath = require('fix-path');
fixPath();
var path = require('path');
var sys = require('sys');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let child

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600, webPreferences: {
    nodeIntegration: true
  } })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })


  win.webContents.on('did-finish-load', () => {
    let command = "cmd";
    let args = [];

    // console.log("env:"+JSON.stringify(process.env));
    console.log("path:"+path.dirname(__dirname));


    child = execa(command, args, {
          cwd: path.dirname(__dirname),//__dirname,
          stdio: ['pipe', 'pipe', 'pipe'],
          //shell: true,
          env: process.env,
        })

    child.stdout.on('data', buffer => {
      if (process.platform === 'win32') {
          buffer = iconv.decode(buffer, "windows-31j");
      }
      console.log(buffer.toString());
      win.webContents.send('terminal', buffer.toString());
    })

    child.stderr.on('data', buffer => {
      if (process.platform === 'win32') {
          buffer = iconv.decode(buffer, "windows-31j");
      }
      console.log(buffer.toString());
      win.webContents.send('terminal', buffer.toString());
    })
    child.on('exit', (code, signal) => {
      console.log('Task exit', command, args, 'code:', code, 'signal:', signal)
     })

    child.on('error', error => {
     console.error(error)
     win.webContents.send('terminal', error.message.toString());
    });

    child.on('close', (code) => {
      console.log('pid:'+ child.pid)
      console.log(`child process exited with code ${code}`);
    });

    //win.webContents.send('terminal', "process.env:"+JSON.stringify(process.env));
    win.webContents.send('terminal', "__dirname:"+__dirname);

  });




}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})
ipcMain.on('terminal', (event, arg) => {
  console.log(arg);
  let _ev = JSON.parse(arg);
  process.stdout.write(_ev.key);
  //event.reply('terminal', 'pong')
  child.stdin.write(_ev.key);
  if (_ev.key === "\r") {
    child.stdin.write("\n");
    console.log('pid:'+ child.pid)
    //child.stdin.end();
  }

})


ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.reply('terminal', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.returnValue = 'pong'
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
