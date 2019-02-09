import { time } from '@tdb/util';
import * as R from 'ramda';
import { Observable, Subject, timer as ObservableTimer } from 'rxjs';
import { filter, map, share, takeUntil, takeWhile } from 'rxjs/operators';

import { EVENT } from './constants';
import {
  IpcEvent,
  IpcEventHandler,
  IpcEventObservable,
  IpcHandlerResponseEvent,
  IpcIdentifier,
  IpcMessage,
  IpcSending,
  ISendResponse,
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
  results$: Observable<ISendResponse<any, D>>;
  cancel$: Subject<any>;
  complete$: Subject<any>;
  timeout$: Subject<any>;
  results: Array<{ sender: IpcIdentifier; data?: D; elapsed: number }>;
};

/**
 * A send response with methods for managing callbacks from handlers.
 */
export class SendResponse<M extends IpcMessage = any, D = any>
  implements IpcSending<M, D> {
  /**
   * [Fields]
   */
  private readonly _: Ref<D>;
  public isCancelled = false;

  /**
   * [Constructor].
   */
  constructor(args: SendResponseInit<M>) {
    const timer = time.timer();
    const { registeredClients } = args;
    const complete$ = new Subject();

    /**
     * Setup cancel operation.
     */
    const cancel$ = new Subject();
    cancel$.subscribe(() => (this.isCancelled = true));

    /**
     * Setup timeout.
     */
    const timeout$ = new Subject();
    timeout$.subscribe(() => {
      const err = `Send operation '${this.type}' timed out.`;
      response$.error(new Error(err));
    });

    ObservableTimer(args.timeout)
      .pipe(
        takeWhile(() => registeredClients.length > 0),
        takeUntil(cancel$),
        takeUntil(complete$),
      )
      .subscribe(() => timeout$.next());

    /**
     * Store state.
     */
    const response$ = new Subject<ISendResponse<M, D>>();
    this._ = {
      ...args,
      results: [],
      complete$,
      cancel$,
      timeout$,
      results$: response$.pipe(
        takeUntil(timeout$),
        takeUntil(cancel$),
        share(),
      ),
    };

    /**
     * Listen for the response from each handler.
     */
    args.events$
      .pipe(
        takeUntil(cancel$),
        takeUntil(timeout$),
        filter(e => e.type === EVENT.HANDLER),
        map(e => e as IpcEvent<IpcHandlerResponseEvent>),
        filter(e => e.payload.eid === this.eid),
      )
      .subscribe(e => {
        response$.next({
          data: e.payload.data,
          elapsed: timer.elapsed(),
          type: this.type,
          sender: e.sender,
        });
      });

    /**
     * Monitor for [complete] status.
     */
    let completed: number[] = [];
    this.results$.subscribe(e => {
      // Store result.
      const { sender, data, elapsed } = e;
      this._.results = [...this._.results, { data, sender, elapsed }];

      // Check for completeness.
      completed = [...completed, sender.id];
      const clients = registeredClients.map(c => c.id);
      if (R.equals(completed, clients)) {
        complete$.next();
      }
    });

    complete$.subscribe(() => response$.complete());
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

  public get results$() {
    return this._.results$;
  }

  public get results() {
    return this._.results;
  }

  public get cancel$() {
    return this._.cancel$.pipe(share());
  }

  public get timeout$() {
    return this._.timeout$.pipe(share());
  }

  public get complete$() {
    return this._.complete$.pipe(share());
  }

  /**
   * [Methods]
   */
  public cancel() {
    this._.cancel$.next();
    return this;
  }
}
