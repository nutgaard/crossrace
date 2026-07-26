import { app, BrowserWindow, ipcMain, Menu, dialog, shell, screen } from 'electron';
import { join, basename } from 'path';
import fs from 'fs';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import icon from '../../build/icon.png?asset';
import {
  CREATE_NEW, DIRTY_CONTENT,
  SAVE_REQUEST,
  SAVE_RESPONSE, SAVE_SUCCESS,
  SET_CONTENT, TOGGLE_DEBUG,
} from '../common/ipc-commands';
import { writeFileSync } from 'node:fs';

function createWindow(): void {
  let contentIsDirty: boolean = false;
  let currentFile: string | undefined = undefined;

  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'FFS',
    width: 900,
    height: 1270,
    x: screenSize.width - 900,
    y: 0,
    show: false,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    if (is.dev) {
      mainWindow.webContents.openDevTools({ mode: 'bottom' });
    }
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click(): void {
            if (contentIsDirty) {
              const confirmation = dialog.showMessageBoxSync(mainWindow, {
                type: 'question',
                title: 'Create new file?',
                message: 'This will discard any unsaved changed. Are you sure?',
                buttons: ['Yes', 'No']
              });
              if (confirmation  !== 0) return;
            }
            mainWindow.webContents.send(CREATE_NEW);
            currentFile = undefined;
            contentIsDirty = false;
          },
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click(): void {
            if (contentIsDirty) {
              const confirmation = dialog.showMessageBoxSync(mainWindow, {
                type: 'question',
                title: 'Open new file?',
                message: 'This will discard any unsaved changed. Are you sure?',
                buttons: ['Yes', 'No']
              });
              if (confirmation  !== 0) return;
            }

            const fileToOpen = dialog.showOpenDialogSync(mainWindow, {
              title: 'Open Crossracer File',
              message: 'Open Crossracer File',
              properties: ['openFile'],
              filters: [
                { name: 'crossracer', extensions: ['json'] },
              ]
            });
            if (fileToOpen && fileToOpen.length === 1) {
              const filename = fileToOpen.at(0)!;
              const content = fs.readFileSync(filename, 'utf-8');
              mainWindow.webContents.send(SET_CONTENT, {
                filename: basename(filename),
                content: JSON.parse(content)
              });
              currentFile = filename;
              contentIsDirty = false;
              updateTitle();
            }
          },
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click(): void {
            const filename: string | undefined = currentFile ?? dialog.showSaveDialogSync(mainWindow, {
              title: 'Save Crossracer File',
              message: 'Save Crossracer File',
              filters: [
                { name: 'crossracer', extensions: ['json'] }
              ]
            });

            if (filename) {
              mainWindow.webContents.send(SAVE_REQUEST, filename);
            }
          },
        },
        {
          label: 'Save as',
          accelerator: 'CmdOrCtrl+Shift+S',
          click(): void {
            const filename: string | undefined = dialog.showSaveDialogSync(mainWindow, {
              title: 'Save Crossracer File',
              message: 'Save Crossracer File',
              filters: [
                { name: 'crossracer', extensions: ['json'] }
              ]
            });
            if (filename) {
              mainWindow.webContents.send(SAVE_REQUEST, filename);
            }
          },
        },
        {
          label: 'Print',
          accelerator: 'CmdOrCtrl+P',
          click(): void {
            mainWindow.webContents.print();
          }
        },
        {
          label: 'Export PNG',
          accelerator: 'CmdOrCtrl+E',
          async click(): Promise<void> {
            const debuggerApi = mainWindow.webContents.debugger;
            const filename = dialog.showSaveDialogSync(mainWindow, {
              title: 'Save Crossracer PNG',
              message: 'Save Crossracer PNG',
              defaultPath: 'crossracer.png',
              filters: [{ name: 'crossracer', extensions: ['png'] }],
            });

            if (!filename) return;

            try {
              debuggerApi.attach();
              await debuggerApi.sendCommand('Emulation.setEmulatedMedia', { media: 'print' });

              await mainWindow.webContents.executeJavaScript(`
                new Promise(resolve => {
                  document.documentElement.classList.add('png-export');

                  // Remove keyboard focus.
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }

                  requestAnimationFrame(() => {
                    requestAnimationFrame(resolve);
                  });
                });
              `);
              const rectangle = await mainWindow.webContents.executeJavaScript(`
                new Promise(resolve => {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      const element = document.querySelector('.report');

                      if (!element) {
                        throw new Error('Could not find .report');
                      }

                      const rect = element.getBoundingClientRect();

                      resolve({
                        x: Math.floor(rect.left),
                        y: Math.floor(rect.top),
                        width: Math.ceil(rect.width),
                        height: Math.ceil(rect.height),
                      });
                    });
                  });
                })
              `);

              const image = await mainWindow.webContents.capturePage(rectangle);

              writeFileSync(filename, image.toPNG());
            } finally {
              await mainWindow.webContents.executeJavaScript(`
                document.documentElement.classList.remove('png-export');

                new Promise(resolve => {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(resolve);
                  });
                });
              `);
              await debuggerApi.sendCommand('Emulation.setEmulatedMedia', { media: 'screen' });
              debuggerApi.detach();
            }
          },
        },
        {
          label: 'Show debug calculations',
          accelerator: 'CmdOrCtrl+D',
          click(): void {
            mainWindow.webContents.send(TOGGLE_DEBUG);
          }
        },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click(): void {
            if (contentIsDirty) {
              const confirmation = dialog.showMessageBoxSync(mainWindow, {
                type: 'question',
                title: 'Open new file?',
                message: 'This will discard any unsaved changed. Are you sure?',
                buttons: ['Yes', 'No']
              });
              if (confirmation  !== 0) return;
            }

            app.quit();
          },
        },
      ],
    },
  ]);
  mainWindow.setMenu(menu);
  Menu.setApplicationMenu(menu);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  ipcMain.on(SAVE_RESPONSE, (_, { filename, content }) => {
    fs.writeFileSync(filename, JSON.stringify(content), 'utf-8');
    mainWindow.webContents.send(SAVE_SUCCESS, basename(filename));
    currentFile = filename;
    updateTitle();
  });

  ipcMain.on(DIRTY_CONTENT, (_, { hasChanges }) => {
    contentIsDirty = hasChanges;
    updateTitle();
  });

  function updateTitle(): void {
    if (currentFile) {
      const dirtyFlag = contentIsDirty ? '*' : '';
      mainWindow.setTitle(`Crossracer - ${basename(currentFile)}${dirtyFlag}`)
    } else {
      const dirtyFlag = contentIsDirty ? ' - Unsaved' : '';
      mainWindow.setTitle(`Crossracer${dirtyFlag}`)
    }
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('no.utgdev');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));
  ipcMain.handle('app:getVersion', () => app.getVersion());

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
