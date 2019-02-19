import { BrowserWindow } from 'electron';
import * as WindowState from 'electron-window-state';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IWindows } from '../windows/main';
import { TAG_DEV_TOOLS as DEV_TOOLS } from '../constants';

type Ref = {
  parent: BrowserWindow;
  devTools: BrowserWindow;
};
const refs: { [key: string]: Ref } = {};

/**
 * Control the position of the detached dev-tools.
 *
 * Source:
 *    https://stackoverflow.com/questions/53678438/dev-tools-size-and-position-in-electron
 *
 * Docs for dev-tools:
 *    https://github.com/electron/electron/blob/master/docs/tutorial/devtools-extension.md
 *
 */
export function create(args: {
  parent: BrowserWindow;
  title?: string;
  fileName?: string;
  dirName?: string;
  windows: IWindows;
}) {
  const { parent, title = 'DevTools', dirName = 'window-state', windows } = args;

  /**
   * Check if the dev-tools for the given parent window already exists.
   */
  if (refs[parent.id]) {
    const ref = refs[parent.id];
    ref.devTools.show();
    return ref;
  }

  /**
   * Setup window-state manager.
   */
  const fileName = args.fileName ? args.fileName : parent.getTitle().replace(/\s/g, '_');
  const file = `${dirName}/${fileName}.devTools.json`;
  const windowBounds = parent.getBounds();
  const state = WindowState({
    defaultWidth: windowBounds.width / 2,
    defaultHeight: windowBounds.height,
    file,
  });
  const saveState$ = new Subject();
  saveState$.pipe(debounceTime(50)).subscribe(() => saveState());
  const saveState = () => state.saveState(devTools);

  /**
   * Create the dev-tool browser window.
   */
  const devTools = new BrowserWindow({
    title,
    width: state.width,
    height: windowBounds.height,
    parent: parent,
    opacity: 0,
    show: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    acceptFirstMouse: true,
  });
  parent.webContents.setDevToolsWebContents(devTools.webContents);
  parent.webContents.openDevTools({ mode: 'detach' });

  const updatePosition = () => {
    const bounds = parent.getBounds();
    devTools.setPosition(bounds.x + bounds.width + 10, bounds.y);
    saveState$.next();
  };

  // Add an identifying tag to the window.
  const tagWindow = () => {
    if (windows) {
      windows.tag(devTools.id, DEV_TOOLS);
    }
  };

  tagWindow();

  /**
   * Manage state changes (size/position).
   */
  const updateSize = () => {
    try {
      const bounds = parent.getBounds();
      devTools.setSize(state.width, bounds.height);
      updatePosition();
    } catch (error) {
      // Ignore.
    }
  };

  // Dev-tools events.
  parent.webContents.once('did-finish-load', () => {
    updateSize();
  });

  devTools.on('resize', () => saveState$.next());
  devTools.once('ready-to-show', () => {
    updatePosition();
    devTools.show();
  });
  devTools.on('close', e => {
    e.preventDefault();
    saveState();
    devTools.hide();
  });

  const destroy = () => {
    devTools.close();
    delete refs[parent.id];
  };

  // Update size on parent window changes.
  parent.on('close', () => destroy());
  parent.on('move', () => updatePosition());
  parent.on('resize', () => updateSize());

  // Store a reference.
  const ref: Ref = { parent, devTools };
  refs[parent.id] = ref;

  // Finish up.
  return { window: ref };
}

/**
 * [INTERNAL]
 */

const getWindow = (id: number) => BrowserWindow.getAllWindows().find(window => window.id === id);

const isDevTools = (windows: IWindows, id: number) => {
  return windows.byTag(DEV_TOOLS.tag, DEV_TOOLS.value).some(ref => ref.id === id);
};

const getChildDevTools = (windows: IWindows, parent: BrowserWindow) => {
  const children = parent ? parent.getChildWindows() : [];
  return children.find(window => isDevTools(windows, window.id));
};
