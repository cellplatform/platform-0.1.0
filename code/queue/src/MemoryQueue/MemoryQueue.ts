import { Subject } from 'rxjs';
import { filter, map, share, take, takeUntil } from 'rxjs/operators';

import { defaultValue, id as idUtil, t, time } from '../common';

type IItem<T = any> = { id: string; run: () => Promise<T>; handler: t.QueueHandler<T> };

let counter = 0;

type IArgs = { isEnabled?: boolean };

/**
 * An in memory promise queue.
 */
export class MemoryQueue implements t.IMemoryQueue {
  public static create = (options: IArgs = {}): t.IMemoryQueue => new MemoryQueue(options);
  public static reset() {
    counter = 0;
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this._isEnabled = defaultValue(args.isEnabled, true);
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */

  private items: IItem[] = [];
  private _current: IItem | undefined;
  private _isEnabled = true;
  private _dispose$ = new Subject<{}>();
  private _event$ = new Subject<t.QueueEvent>();

  public readonly id = idUtil.shortid();
  public dispose$ = this._dispose$.pipe(share());
  public event$ = this._event$.pipe(takeUntil(this.dispose$), share());

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get length() {
    return this.items.length;
  }

  public get isEmpty() {
    return this.length === 0;
  }

  public get isEnabled() {
    return this._isEnabled;
  }

  /**
   * [Methods]
   */

  public start() {
    this.throwIfDisposed('start');
    if (!this._isEnabled) {
      this._isEnabled = true;
      this.fireStatus();
    }
    this.pop();
    return this;
  }

  public stop() {
    this.throwIfDisposed('stop');
    if (this._isEnabled) {
      this._isEnabled = false;
      this.fireStatus();
    }
    return this;
  }

  public push<T>(handler: t.QueueHandler<T>) {
    this.throwIfDisposed('push');
    counter++;
    const id = `${this.id}:${counter}`;

    const run = async () => {
      const timer = time.timer();
      try {
        this.fire({ type: 'QUEUE/item/start', payload: { id } });
        const result = await item.handler();
        const elapsed = timer.elapsed.msec;
        this.fire({ type: 'QUEUE/item/done', payload: { id, elapsed, result } });
      } catch (error) {
        const elapsed = timer.elapsed.msec;
        this.fire({ type: 'QUEUE/item/done', payload: { id, elapsed, error } });
      } finally {
        this._current = undefined;
      }
    };

    const item: IItem = { id, run, handler };
    this.items.push(item);

    const event$ = this.event$.pipe(filter(e => e.payload.id === id));
    const done$ = event$.pipe(
      filter(e => e.type === 'QUEUE/item/done'),
      map(e => e.payload as t.IQueueItemDone),
    );

    const promise = new Promise<T>((resolve, reject) => {
      done$.pipe(take(1)).subscribe(e => {
        res.isDone = true;
        res.elapsed = e.elapsed;
        res.result = e.result;
        res.error = e.error;
        if (e.error) {
          reject(e.error);
        } else {
          resolve(e.result);
        }
      });
    });

    const res = promise as any;
    res.id = id;
    res.event$ = event$;
    res.done$ = done$;
    res.isDone = false;
    res.elapsed = -1;

    // Finish up.
    const isEnabled = this.isEnabled;
    if (isEnabled && !this._current) {
      this.pop();
    }

    this.fire({ type: 'QUEUE/pushed', payload: { id, isEnabled } });
    return res as t.QueueItem<T>;
  }

  /**
   * [Internal]
   */

  private fire(e: t.QueueEvent) {
    this._event$.next(e);
  }

  private fireStatus() {
    this.fire({
      type: 'QUEUE/status',
      payload: {
        id: this.id,
        isEnabled: this.isEnabled,
        isEmpty: this.isEmpty,
        length: this.length,
      },
    });
  }

  private async pop() {
    if (this.isDisposed || !this.isEnabled) {
      return;
    }
    const item = this.items[0];
    if (item) {
      this.items = this.items.slice(1);
      this._current = item;
      await item.run();
      if (!this.isEmpty) {
        this.pop(); // <== 🌳RECURSION
      }
    }
  }

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because [TypedSheet] is disposed.`);
    }
  }
}
