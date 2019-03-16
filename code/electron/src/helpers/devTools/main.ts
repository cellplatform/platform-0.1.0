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

export type ICreateDevToolResponse = {
  id: number;
};

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
  windows: IWindows;
  title?: string;
  fileName?: string;
  dirName?: string;
  focus?: boolean;
}) {
  return new Promise<ICreateDevToolResponse>((resolve, reject) => {
    const { parent, title = 'DevTools', dirName = 'window-state', windows } = args;

    const done = (id: number) => {
      resolve({ id });
    };

    const show = (devTools: BrowserWindow) => {
      const isParentFocused = parent.isFocused();
      devTools.show();
      if (args.focus === true) {
        devTools.focus();
      }
      if (!args.focus && isParentFocused) {
        parent.focus();
      }
    };

    /**
     * Check if the dev-tools for the given parent window already exists.
     */
    const existing = getChildDevTools(windows, parent);
    if (existing) {
      show(existing);
      return done(existing.id);
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
      parent,
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
      show(devTools);
      done(devTools.id);
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
  });
}

/**
 * Hides the DevTools if they exist.
 */
export function hide(args: { parent: BrowserWindow; windows: IWindows }) {
  const { parent, windows } = args;
  const window = getChildDevTools(windows, parent);
  if (window) {
    window.hide();
  }
}

/**
 * Determines whether the given `parent` window currently has DevTools.
 */
export function exists(args: { parent: BrowserWindow; windows: IWindows }) {
  const { parent, windows } = args;
  return Boolean(getChildDevTools(windows, parent));
}

/**
 * Determines whether the given `parent` window currently has DevTools.
 */
export function isShowing(args: { parent: BrowserWindow; windows: IWindows }) {
  const { parent, windows } = args;
  const window = getChildDevTools(windows, parent);
  return window ? window.isVisible() : false;
}

/**
 * [Internal]
 */

const isDevTools = (windows: IWindows, id: number) => {
  return windows.byTag(DEV_TOOLS.tag, DEV_TOOLS.value).some(ref => ref.id === id);
};

const getChildDevTools = (windows: IWindows, parent: BrowserWindow) => {
  const children = parent ? parent.getChildWindows() : [];
  return children.find(window => isDevTools(windows, window.id));
};
