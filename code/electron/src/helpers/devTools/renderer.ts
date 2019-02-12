import { IpcInternal, IpcClient } from './types';

/**
 * Renderer API for working with the dev-tools.
 * Call this from the root [/renderer] API.
 */
export class DevToolsRenderer {
  private ipc: IpcInternal;

  /**
   * Initializes the dev tools.
   */
  public init(args: { ipc: IpcClient }) {
    const ipc = (this.ipc = args.ipc);
    ipc.on('DEV_TOOLS/clearConsole').subscribe(e => clearConsole());
  }

  /**
   * Issues a request to clear all dev consoles.
   */
  public clearConsoles() {
    clearConsole();
    if (this.ipc) {
      this.ipc.send('.SYS/DEV_TOOLS/clearConsole', {});
    }
  }
}

/**
 * INTERNAL
 */
function clearConsole() {
  console.clear(); // tslint:disable-line
}
