import { id as idUtil, value as valueUtil } from '@platform/util.value';
import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { EVENT, GLOBAL } from './constants';
import { SendHandler, SendResponse } from './SendResponse';
import {
  IpcClient,
  IpcClientSendOptions,
  IpcEvent,
  IpcEventHandler,
  IpcEventHandlerArgs,
  IpcEventObservable,
  IpcFilter,
  IpcHandlerResponseEvent,
  IpcIdentifier,
  IpcMessage,
  ProcessType,
  IpcHandlerRefs,
} from './types';

export * from './types';

export type SendDelegate = (channel: string, ...args: any) => void;
export type HandlerRegistered = (args: { type: IpcMessage['type']; client: IpcIdentifier }) => void;
export type GetHandlerRefs = () => IpcHandlerRefs;

type Ref = {
  dispose$: Subject<any>;
  events$: Subject<IpcEvent>;
  handlers: SendHandler[];
  onSend?: SendDelegate;
  onHandlerRegistered?: HandlerRegistered;
  getHandlerRefs?: GetHandlerRefs;
};

/**
 * Generic IPC (inter-process-communication)
 * observable data structure.
 */
export class IPC<M extends IpcMessage = any> implements IpcClient<M> {
  /**
   * [Static]
   */
  public static readonly MAIN = 0;

  /**
   * [Lifecycle]
   */
  constructor(args: {
    id: number;
    process: ProcessType;
    events$: Observable<IpcEvent>;
    onSend: SendDelegate;
    onHandlerRegistered: HandlerRegistered;
    getHandlerRefs: GetHandlerRefs;
  }) {
    this.id = args.id;
    this.process = args.process;
    this._.onSend = args.onSend;
    this._.onHandlerRegistered = args.onHandlerRegistered;
    this._.getHandlerRefs = args.getHandlerRefs;

    // Ferry events through the client observable.
    if (args.events$) {
      args.events$.pipe(takeUntil(this.disposed$)).subscribe(e => this._.events$.next(e));
    }

    // Listen for events and run corresponding response-handlers.
    this.events$.pipe(filter(e => e.type !== EVENT.HANDLER)).subscribe(e => this.runHandlers(e));
  }

  /**
   * Disposes of the client.
   */
  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly _: Ref = {
    dispose$: new Subject(),
    events$: new Subject<IpcEvent<M>>(),
    handlers: [],
  };

  public readonly id: number;
  public readonly process: ProcessType;
  public readonly channel = GLOBAL.IPC_CHANNEL;
  public readonly MAIN = IPC.MAIN;
  public disposed$ = this._.dispose$.pipe(share());
  public timeout = 5000;
  public readonly dispose$ = this._.dispose$.pipe(share());

  /**
   * Observable of all IPC message events.
   */
  public readonly events$: IpcEventObservable<M> = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  /**
   * Get a filtered observable of IPC events.
   */
  public filter<T extends M>(criteria: IpcFilter<M> | T['type']): IpcEventObservable<T> {
    const $ =
      typeof criteria === 'string'
        ? this.events$.pipe(filter(e => e.type === criteria))
        : this.events$.pipe(filter(criteria));
    return $.pipe(map(e => e as IpcEvent<T>));
  }

  /**
   * Filters on the given IPC message-type.
   */
  public on<T extends M>(type: T['type']) {
    return this.events$.pipe(
      filter(e => e.type === type),
      map(e => e as IpcEvent<T>),
    );
  }

  /**
   * Sends an IPC message.
   * If target is not specified, broadcasts to all windows/processes.
   */
  public send<T extends M, D = any>(
    type: T['type'],
    payload: T['payload'],
    options: IpcClientSendOptions = {},
  ) {
    return this._send<T, D>(type, payload, options);
  }

  private _send<T extends IpcMessage, D = any>(
    type: T['type'],
    payload: T['payload'],
    options: IpcClientSendOptions = {},
  ) {
    if (this.isDisposed) {
      throw new Error(`The IPC client has been disposed.`);
    }

    const { target } = options;
    const id = this.id;
    const targets = IPC.asTarget(target);
    const process = this.process;
    const eid = `${process}-${id}/${idUtil.shortid()}`;
    const sender = IPC.toIdentifier(this as IpcClient);

    // Fire the event through the electron IPC system.
    const data: IpcEvent<T> = { eid, type, payload, sender, targets };
    const handlers = this._.handlers;
    const events$ = (this.events$ as unknown) as IpcEventObservable<T>;
    const timeout = valueUtil.defaultValue(options.timeout, this.timeout);
    const registeredClients = this
      // Clients handling the event, not including this one.
      .handlers(type, { exclude: id })
      .filter(c => c.id !== id);

    // Prepare the send response.
    const res = new SendResponse<T, D>({
      data,
      events$,
      handlers,
      registeredClients,
      timeout,
    });
    this.sendDelegate(this.channel, data);

    // Finish up.
    return res;
  }

  private get sendDelegate() {
    const delegate = this._.onSend;
    if (!delegate) {
      const msg = `An electron IPC 'send' delegate has not been provided.`;
      throw new Error(msg);
    }
    return delegate;
  }

  /**
   * Registers a response-handler for a specific event.
   */
  public handle<T extends M>(type: T['type'], handler: IpcEventHandler<T>): IpcClient<M> {
    // Store the handler in memory.
    this._.handlers = [...this._.handlers, { type, handler }];

    // Alert the process of the registration.
    if (this._.onHandlerRegistered) {
      const client = IPC.toIdentifier(this as IpcClient);
      this._.onHandlerRegistered({ type, client });
    }

    // Finish up.
    return this as IpcClient<M>;
  }

  /**
   * Invoke registered handlers and then alert callers.
   */
  private runHandlers(event: IpcEvent<M>) {
    const { type, eid } = event;
    return this._.handlers
      .filter(item => item.type === type)
      .map(item => item.handler)
      .map(async handler => {
        // Invoke the handler.
        const args: IpcEventHandlerArgs<M> = { ...event };
        const data = await handler(args);

        // Fire the response data through an event.
        const e: IpcHandlerResponseEvent['payload'] = { eid, data };
        this._send<IpcHandlerResponseEvent>('@platform/IPC/handler/response', e);
        return { args, data };
      });
  }

  private get handlerRefs() {
    const getHandlerRefs = this._.getHandlerRefs;
    if (!getHandlerRefs) {
      throw new Error(`The 'getHandlerRefs' delegate was not passed to the constructor.`);
    }
    return getHandlerRefs();
  }

  /**
   * Get a list of clients from all windows/processes that are
   * handling a particular event.
   */
  public handlers(type: M['type'], options: { exclude?: number | number[] } = {}): IpcIdentifier[] {
    const exclude =
      options.exclude === undefined
        ? []
        : Array.isArray(options.exclude)
        ? options.exclude
        : [options.exclude];
    const ref = this.handlerRefs[type];
    return (ref ? ref.clients : [])
      .filter(c => !exclude.includes(c.id))
      .map(({ id, process }) => ({ id, process }));
  }

  /**
   * `Static Helpers`
   */

  /**
   * Converts a potential target value to an array.
   */
  public static asTarget(value?: number | number[]) {
    const target = valueUtil.defaultValue(value, []);
    return Array.isArray(target) ? target : [target];
  }

  /**
   * Create an IPC identifier for the given client.
   */
  public static toIdentifier(ipc: IpcClient): IpcIdentifier {
    const { id, process } = ipc;
    return { id, process };
  }
}
