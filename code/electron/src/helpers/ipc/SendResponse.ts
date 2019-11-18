import { ITimer, time, value as valueUtil } from '@platform/util.value';
import * as R from 'ramda';
import { Observable, Subject, timer as ObservableTimer } from 'rxjs';
import { filter, map, share, takeUntil, takeWhile } from 'rxjs/operators';

import { EVENT } from './constants';
import {
  IpcEvent,
  IpcEventHandler,
  IpcEventObservable,
  IpcHandlerResponseEvent,
  IpcHandlerResult,
  IpcIdentifier,
  IpcMessage,
  IpcSending,
  IpcSendResponse,
  ProcessType,
} from './types';

export type SendHandler = { type: IpcEvent['type']; handler: IpcEventHandler };

type SendResponseInit<M extends IpcMessage> = {
  data: IpcEvent;
  events$: IpcEventObservable<M>;
  handlers: SendHandler[];
  registeredClients: IpcIdentifier[];
  timeout: number;
};

type Ref<D> = SendResponseInit<any> & {
  $: Observable<IpcSendResponse<any, D>>;
  cancel$: Subject<any>;
  complete$: Subject<any>;
  timeout$: Subject<any>;
  results: Array<IpcHandlerResult<D>>;
  timer: ITimer;
  isTimedOut: boolean;
  elapsed?: number;
  promise?: Promise<IpcSending<any, any>>;
};

/**
 * A send response with methods for managing callbacks from handlers.
 */
export class SendResponse<M extends IpcMessage = any, D = any> implements IpcSending<M, D> {
  /**
   * [Fields]
   */
  private readonly _: Ref<D>;
  public isCancelled = false;
  public isComplete = false;

  /**
   * [Constructor].
   */
  constructor(args: SendResponseInit<M>) {
    const timer = time.timer();
    const { registeredClients } = args;
    const complete$ = new Subject<{}>();

    /**
     * Setup cancel operation.
     */
    const cancel$ = new Subject<{}>();
    cancel$.subscribe(() => (this.isCancelled = true));

    /**
     * Setup timeout.
     */
    const timeout$ = new Subject<{}>();
    timeout$.subscribe(() => (this._.isTimedOut = true));
    ObservableTimer(args.timeout)
      .pipe(
        takeUntil(cancel$),
        takeUntil(complete$),
        takeWhile(() => registeredClients.length > 0),
      )
      .subscribe(() => timeout$.next());

    /**
     * Store state.
     */
    const response$ = new Subject<IpcSendResponse<M, D>>();
    this._ = {
      ...args,
      timer,
      results: [],
      complete$,
      cancel$,
      timeout$,
      isTimedOut: false,
      $: response$.pipe(takeUntil(timeout$), takeUntil(cancel$), share()),
    };

    /**
     * Listen for the response from each handler.
     */
    args.events$
      .pipe(
        takeUntil(cancel$),
        takeUntil(timeout$),
        filter(e => e.type === EVENT.HANDLER),
        map(e => (e as unknown) as IpcEvent<IpcHandlerResponseEvent>),
        filter(e => e.payload.eid === this.eid),
      )
      .subscribe(e => {
        response$.next({
          eid: this.eid,
          data: e.payload.data,
          elapsed: timer.elapsed.msec,
          type: this.type,
          sender: e.sender,
        });
      });

    /**
     * Monitor for [complete] status.
     */
    let completed: number[] = [];
    complete$.subscribe(() => {
      this.isComplete = true;
      this._.elapsed = timer.elapsed.msec;
      response$.complete();
    });
    this.$.subscribe(e => {
      // Store result.
      const { sender, data, elapsed, eid } = e;
      const result: IpcHandlerResult<D> = { data, sender, elapsed, eid };
      this._.results = [...this._.results, result];

      // Check for completeness.
      completed = [...completed, sender.id];
      const clients = registeredClients.map(c => c.id);
      if (R.equals(completed, clients)) {
        complete$.next();
      }
    });
    if (registeredClients.length === 0) {
      complete$.next();
    }

    /**
     * Monitor for [timeout].
     */
    this.timeout$.subscribe(() => {
      const err = `Send operation '${this.type}' timed out (${this.eid}).`;
      response$.error(new Error(err));
    });
  }

  /**
   * [Properties]
   */
  public get eid() {
    return this._.data.eid;
  }

  public get type() {
    return this._.data.type;
  }

  public get $() {
    return this._.$;
  }

  public get promise() {
    const promise =
      this._.promise ||
      new Promise<IpcSending<M, D>>(async (resolve, reject) => {
        try {
          await this.$.toPromise();
          resolve(this);
        } catch (error) {
          reject(error);
        }
      });
    this._.promise = promise;
    return promise;
  }

  public get results() {
    return this._.results;
  }

  public resultFrom(sender: number | ProcessType) {
    return this.results.find(item =>
      typeof sender === 'number' ? item.sender.id === sender : item.sender.process === sender,
    );
  }

  public dataFrom(sender: number | ProcessType) {
    const res = this.resultFrom(sender);
    return res ? res.data : undefined;
  }

  public get cancel$() {
    return this._.cancel$.pipe(share());
  }

  public get timeout$() {
    return this._.timeout$.pipe(takeUntil(this.cancel$), takeUntil(this.complete$), share());
  }

  public get complete$() {
    return this._.complete$.pipe(share());
  }

  public get elapsed() {
    return valueUtil.defaultValue(this._.elapsed, this._.timer.elapsed.msec);
  }

  public get isTimedOut() {
    return this._.isTimedOut;
  }

  /**
   * [Methods]
   */
  public cancel() {
    this._.cancel$.next();
    return this;
  }
}
