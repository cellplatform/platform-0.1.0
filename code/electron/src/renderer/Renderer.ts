import { DevToolsRenderer } from '../helpers/devTools/renderer';
import {
  init as initIpc,
  IpcClient,
  IpcMessage,
} from '../helpers/ipc/renderer';
import { init as initLog, log } from '../helpers/logger/renderer';
// import * as store from '../helpers/store';

export { log };

/**
 * Safe import of the `electron` module.
 */
const electron = (window as any).require('electron');

class Renderer {
  public isInitialized = false;
  public ipc: IpcClient;
  public devTools = new DevToolsRenderer();

  /**
   * Initializes [Renderer] systems (safely).
   */
  public init<M extends IpcMessage>(args: {} = {}) {
    if (!this.isInitialized) {
      const ipc = (this.ipc = initIpc<M>());
      initLog({ ipc });
      this.devTools.init({ ipc });
    }
    this.isInitialized = true;
    return this.toObject<M>();
  }

  /**
   * Retrieves the ID of the current window.
   */
  public get id() {
    return this.remote.getCurrentWindow().id;
  }

  /**
   * The logger for the [Renderer] process.
   */
  public get log() {
    return log;
  }

  /**
   * Retrieves the config [Store].
   */
  // public get store() {
  //   return store;
  // }

  /**
   * A "remote" proxy to the [Main] process.
   */
  public get remote() {
    return electron.remote as Electron.Remote;
  }

  /**
   * Converts the class to a simple object.
   */
  public toObject<M extends IpcMessage>() {
    const ipc = this.ipc as IpcClient<M>;
    return { log, ipc };
  }
}

export const singleton = new Renderer();
