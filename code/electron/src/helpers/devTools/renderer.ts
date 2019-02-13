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
      .on<t.ClearConsoleEvent>('@platform/DEV_TOOLS/clearConsole')
      .pipe(delay(0))
      .subscribe(e => clearConsole());
  }

  /**
   * Issues a request to clear all dev consoles.
   */
  public clearConsoles() {
    clearConsole();
    if (this.ipc) {
      this.ipc.send<t.ClearConsoleEvent>(
        '@platform/DEV_TOOLS/clearConsole',
        {},
      );
    }
  }
}

/**
 * INTERNAL
 */
function clearConsole() {
  console.clear(); // tslint:disable-line
}
