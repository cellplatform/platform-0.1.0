import { DevToolsRenderer } from '../helpers/devTools/renderer';
import {
  init as initIpc,
  IpcClient,
  IpcMessage,
} from '../helpers/ipc/renderer';
import { init as initLog, log } from '../helpers/logger/renderer';
import {
  init as initStore,
  IStoreObject,
  IStoreClient,
} from '../helpers/store/renderer';

export { log };

type Refs = {
  ipc?: IpcClient;
  store?: IStoreClient;
};

/**
 * Safe import of the `electron` module.
 */
const electron = (window as any).require('electron');

class Renderer {
  private _: Refs = {};
  public readonly devTools = new DevToolsRenderer();
  public isInitialized = false;

  /**
   * Initializes [Renderer] systems (safely).
   */
  public init<M extends IpcMessage = any, S extends IStoreObject = any>(
    args: {} = {},
  ) {
    if (!this.isInitialized) {
      // Inter-process-communication.
      const ipc = initIpc<M>();
      initLog({ ipc });
      this._.ipc = ipc;

      // Store.
      const store = initStore<S>();
      this._.store = store;

      // Dev tools.
      this.devTools.init({ ipc });
    }

    // Finish up.
    this.isInitialized = true;
    return this.toObject<M, S>();
  }

  /**
   * Retrieves the ID of the current window.
   */
  public get id() {
    return this.remote().getCurrentWindow().id;
  }

  /**
   * The logger for the [Renderer] process.
   */
  public log() {
    return log;
  }

  /**
   * A "remote" proxy to the [Main] process.
   */
  public remote() {
    return electron.remote as Electron.Remote;
  }

  public ipc<M extends IpcMessage = any>() {
    return this._.ipc as IpcClient<M>;
  }

  public store<S extends IStoreObject = any>() {
    return this._.store as IStoreClient<S>;
  }

  /**
   * Converts the class to a simple object.
   */
  public toObject<M extends IpcMessage, S extends IStoreObject = any>() {
    const ipc = this.ipc<M>();
    const store = this.store<S>();
    const log = this.log();
    const remote = this.remote();
    return { remote, log, ipc, store };
  }
}

export const singleton = new Renderer();
