import { BrowserWindow, app } from 'electron';
import { Schema, constants } from './common';

export function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      // allow
    },
  });

  // and load the index.html of the app.
  // const path = '../../demo/index.html';
  // win.loadFile(path);

  // console.log('process.versions', process.versions);
  // console.log('-------------------------------------------');
  // console.log('process.env', process.env);

  // const url =
  //   'http://localhost:8080/cell:ck6bmume4000008mqhkkdaebj!A2/file/dist/index.html?def=ns:ck6h33tit000008mt36b74r2v';

  const NODE_ENV = process.env.NODE_ENV;

  const urls = Schema.urls(constants.HOST);

  const index = urls
    .cell(constants.URI.UI_FILES)
    .file.byName('index.html')
    .toString();

  // console.log('f', f);

  const url = NODE_ENV === 'development' ? 'http://localhost:1234' : index;

  console.log('url', url);

  win.loadURL(url);
  // win.webContents.openDevTools();
}
