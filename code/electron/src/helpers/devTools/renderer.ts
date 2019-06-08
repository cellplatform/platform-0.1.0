import { delay } from 'rxjs/operators';
import * as t from './types';

/**
 * Renderer API for working with the dev-tools.
 * Call this from the root [/renderer] API.
 */
export class DevTools {
  private ipc: t.IpcInternal;

  /**
   * [Constructor]
   */
  constructor(args: { ipc: t.IpcClient }) {
    const ipc = (this.ipc = args.ipc);
    ipc
      .on<t.DevToolsClearConsoleEvent>('@platform/DEV_TOOLS/clearConsole')
      .pipe(delay(0))
      .subscribe(e => clearConsole());
  }

  /**
   * Issues a request to clear all dev consoles.
   */
  public clearConsoles() {
    clearConsole();
    if (this.ipc) {
      this.ipc.send<t.DevToolsClearConsoleEvent>('@platform/DEV_TOOLS/clearConsole', {});
    }
  }

  /**
   * Show the dev tools.
   */
  public show(options: { focus?: boolean } = {}) {
    const { focus } = options;
    this.ipc.send<t.DevToolsVisibilityEvent>('@platform/DEV_TOOLS/visibility', {
      show: true,
      focus,
    });
  }

  /**
   * Show the dev tools.
   */
  public hide() {
    this.ipc.send<t.DevToolsVisibilityEvent>('@platform/DEV_TOOLS/visibility', { show: false });
  }
}

/**
 * [Helpers]
 */
function clearConsole() {
  console.clear(); // tslint:disable-line
}
