import { ProcessType } from '../../types';
import { Observable } from 'rxjs';
export { ProcessType };

/**
 * Global refs in [main] process.
 */
export type IpcHandlerRef = {
  type: IpcMessage['type'];
  clients: IpcIdentifier[];
};
export type IpcHandlerRefs = { [key: string]: IpcHandlerRef };
export type IpcGlobalMainRefs = {
  // NB: Internal use only. DO NOT TOUCH THESE.
  _ipcRefs: {
    client?: IpcClient;
    handlers: IpcHandlerRefs;
  };
};

/**
 * Message types/events.
 */
export type IpcMessageType = string;
export type IpcPayload = object;

export type IpcMessage = {
  type: string;
  payload: { [key: string]: any };
};

export type IpcIdentifier = { id: number; process: ProcessType };

export type IpcEvent<M extends IpcMessage = any> = {
  eid: string; // Unique "event id".
  type: M['type'];
  payload: M['payload'];
  sender: IpcIdentifier;
  targets: number[]; // BrowserWindow ID, or `0` for MAIN process.
};

export type IpcEventObservable<M extends IpcMessage> = Observable<IpcEvent<M>>;

export type IpcFilter<M extends IpcMessage> = (
  e: IpcEvent<M>,
  index: number,
) => boolean;

/**
 * Definition of the IPC client.
 */
export type IpcClient<M extends IpcMessage = any> = {
  /**
   * [Properties]
   */
  readonly MAIN: number; // The ID of the main process.
  readonly process: ProcessType;
  readonly events$: IpcEventObservable<M>;
  readonly id: number;

  /**
   * [Methods]
   */
  dispose: () => void;

  filter: <T extends M>(
    criteria: IpcFilter<T> | T['type'],
  ) => IpcEventObservable<T>;

  on: <T extends M>(type: T['type']) => IpcEventObservable<T>;

  send: <T extends M, D = any>(
    type: T['type'],
    payload: T['payload'],
    options?: IpcClientSendOptions,
  ) => IpcSend<T, D>;

  handle: <T extends M>(
    type: T['type'],
    handler: IpcEventHandler<T>,
  ) => IpcClient<M>;
};

export type IpcClientSendOptions = {
  target?: number | number[]; // Target window-id, or `0` for MAIN process.
  timeout?: number; // Msecs.  Default taken from `client.timeout`.
};

/**
 * The response object returned by a `send` operation.
 */
export type IpcSend<M extends IpcMessage, D = any> = {
  eid: string; // The unique event-id.
  type: M['type'];
  results$: Observable<ISendResponse<M, D>>;
  timeout$: Observable<{}>;
  cancel$: Observable<{}>;
  results: Array<{ sender: IpcIdentifier; data?: D; elapsed: number }>;
  cancel: () => IpcSend<M, D>;
  isCancelled: boolean;
};

/**
 * Response data sent from an event handler.
 */
export type ISendResponse<M extends IpcMessage, D = any> = {
  elapsed: number;
  data: D;
  type: M['type'];
  sender: IpcIdentifier;
};

/**
 * The event passed to an event-handler with methods for responding.
 */
export type IpcEventHandlerArgs<M extends IpcMessage> = IpcEvent<M> & {};
export type IpcEventHandler<M extends IpcMessage = any> = (
  e: IpcEventHandlerArgs<M>,
) => Promise<any>;

/**
 * [EVENTS]
 */

/**
 * The response fired back from a registered handler.
 */
export type IpcHandlerResponseEvent = {
  type: './SYS/IPC/handler/response';
  payload: {
    eid: string;
    data?: any;
  };
};

/**
 * A notification that an event-handler has been registered.
 */
export type IpcRegisterHandlerEvent = {
  type: './SYS/IPC/register-handler';
  payload: {
    type: IpcMessage['type'];
    stage: 'CREATE' | 'DISPOSE';
  };
};
