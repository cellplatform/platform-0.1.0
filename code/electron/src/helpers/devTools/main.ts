import { BrowserWindow } from 'electron';
import * as WindowState from 'electron-window-state';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as t from './types';

const OPACITY = {
  FULL: 1,
  DIM: 1,
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
export function create(
  args: t.IContext & { parent: BrowserWindow; title?: string },
) {
  const { parent, title = 'DevTools' } = args;
  const ipc: t.IpcInternal = args.ipc;

  const file = `[window].${parent
    .getTitle()
    .replace(/\s/g, '_')}.devTools.json`;

  const windowBounds = parent.getBounds();
  const state = WindowState({
    defaultWidth: windowBounds.width / 2,
    defaultHeight: windowBounds.height,
    file,
  });
  const saveState$ = new Subject();
  saveState$.pipe(debounceTime(50)).subscribe(() => saveState());
  const saveState = () => state.saveState(devTools);

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

  // const webContents = parent.webContents;
  parent.webContents.setDevToolsWebContents(devTools.webContents);
  parent.webContents.openDevTools({ mode: 'detach' });

  const updatePosition = () => {
    const bounds = parent.getBounds();
    devTools.setPosition(bounds.x + bounds.width + 10, bounds.y);
    saveState$.next();
  };

  const updateSize = () => {
    try {
      const bounds = parent.getBounds();
      devTools.setSize(state.width, bounds.height);
      updatePosition();
    } catch (error) {
      // Ignore.
    }
  };

  const updateOpacity = () => {
    const isFocused = parent.isFocused() || devTools.isFocused();
    const opacity = isFocused ? OPACITY.FULL : OPACITY.DIM;
    devTools.setOpacity(opacity);
  };

  // Dev-tools events.
  parent.webContents.once('did-finish-load', () => {
    updateSize();
  });

  devTools.on('resize', () => saveState$.next());
  devTools.once('ready-to-show', () => {
    updatePosition();
    updateOpacity();
    devTools.show();
  });
  devTools.on('close', e => {
    e.preventDefault();
    saveState();
    devTools.hide();
  });

  // Update size on parent window changes.
  parent.on('close', () => devTools.close());
  parent.on('move', () => updatePosition());
  parent.on('resize', () => updateSize());

  // Manage opacity.
  parent.on('focus', () => updateOpacity());
  parent.on('blur', () => updateOpacity());
  devTools.on('focus', () => updateOpacity());
  devTools.on('blur', () => updateOpacity());

  // Finish up.
  return {
    window: { parent, devTools },
  };
}
