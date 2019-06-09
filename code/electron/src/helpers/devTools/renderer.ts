import { KeyBinding, Keyboard } from '@platform/react';
import { delay } from 'rxjs/operators';

import { TAG_DEV_TOOLS } from '../constants';
import * as t from './types';

const TAG = TAG_DEV_TOOLS.tag;

type DevToolKeyCommands = 'TOGGLE' | 'CLEAR_CONSOLE';

export type IDevToolsOptions = {
  keyboard?: {
    toggle: string | boolean; //       eg. CMD+ALT+I
    clearConsole: string | boolean; // eg. CMD+K
  };
};

/**
 * Renderer API for working with the dev-tools.
 * Call this from the root [/renderer] API.
 */
export class DevTools {
  public readonly log: t.ILog;
  private readonly ipc: t.IpcInternal;
  private readonly windows: t.IWindows;

  /**
   * [Constructor]
   */
  constructor(args: { ipc: t.IpcClient; windows: t.IWindows; log: t.ILog } & IDevToolsOptions) {
    const { windows, keyboard, log } = args;
    this.windows = windows;
    this.log = log;

    /**
     * Listen to IPC events.
     */
    const ipc = (this.ipc = args.ipc);
    ipc
      .on<t.DevToolsClearConsoleEvent>('@platform/DEV_TOOLS/clearConsole')
      .pipe(delay(0))
      .subscribe(e => clearConsole());

    /**
     * Setup keyboard bindings.
     */
    let bindings: Array<KeyBinding<DevToolKeyCommands>> = [];
    if (keyboard) {
      if (keyboard.toggle) {
        const key = keyboard.toggle === true ? 'CMD+ALT+I' : keyboard.toggle;
        bindings = [...bindings, { command: 'TOGGLE', key }];
      }
      if (keyboard.clearConsole) {
        const key = keyboard.clearConsole === true ? 'CMD+ALT+K' : keyboard.clearConsole;
        bindings = [...bindings, { command: 'CLEAR_CONSOLE', key }];
      }
    }
    Keyboard
      // Invoke key commands.
      .create<DevToolKeyCommands>({ bindings })
      .bindingPress$.subscribe(e => {
        switch (e.command) {
          case 'CLEAR_CONSOLE':
            return this.clearConsoles();
          case 'TOGGLE':
            return this.toggle();
        }
      });
  }

  /**
   * [Properties]
   */
  public get isShowing() {
    const ref = this.ref.devTools;
    return ref ? ref.isVisible : false;
  }

  private get ref() {
    const windows = this.windows;
    const id = this.ipc.id;
    return {
      id,
      windows,
      get devTools() {
        return windows.byTag(TAG).find(({ parent }) => parent === id);
      },
    };
  }

  /**
   * [Methods]
   */

  /**
   * Issues a request to clear all dev consoles.
   */
  public clearConsoles() {
    clearConsole();
    if (this.ipc) {
      this.ipc.send<t.DevToolsClearConsoleEvent>(
        '@platform/DEV_TOOLS/clearConsole',
        {},
        { target: this.ipc.MAIN },
      );
    }
  }

  /**
   * Show the dev-tools.
   */
  public show(options: { focus?: boolean } = {}) {
    const { focus } = options;
    this.ipc.send<t.DevToolsVisibilityEvent>(
      '@platform/DEV_TOOLS/visibility',
      {
        show: true,
        focus,
      },
      { target: this.ipc.MAIN },
    );
  }

  /**
   * Show the dev-tools.
   */
  public hide() {
    this.ipc.send<t.DevToolsVisibilityEvent>(
      '@platform/DEV_TOOLS/visibility',
      { show: false },
      { target: this.ipc.MAIN },
    );
  }

  /**
   * Shows or hides the dev-tools.
   */
  public toggle(options: { focus?: boolean } = {}) {
    if (this.isShowing) {
      this.hide();
    } else {
      this.show(options);
    }
  }
}

/**
 * [Helpers]
 */
function clearConsole() {
  console.clear(); // tslint:disable-line
}
