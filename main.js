
const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const imagemin = require('imagemin');

const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');



// Env & platform
process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;

function createMainWindow () {
    mainWindow = new BrowserWindow({
        title: '画像リサイズ',
        width: isDev ? 800 : 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor: 'white',
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
        },
    });

    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}

ipcMain.on('image:minimize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageshrink');
  shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, dest }) {
  const pngQuality = quality / 100;
  try {
    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality]
        })
      ]
    });

    console.log(files);
    shell.openPath(dest);
  } catch (err) {
    console.log(err);
  }
}

app.on('ready', () => {
  createMainWindow();
  mainWindow.on('closed', () => mainWindow = null);
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
})

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
})