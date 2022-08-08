import { Subject } from 'rxjs';
import { filter, map, share, take, takeUntil } from 'rxjs/operators';

import { slug, t, time } from '../common';

type IItem<T = any> = { id: string; run: () => Promise<T>; handler: t.QueueHandler<T> };

let counter = 0;

type IArgs = { isRunning?: boolean };

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
    this._isRunning = args.isRunning ?? true;
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
  private _isRunning = true;
  private _dispose$ = new Subject<void>();
  private _event$ = new Subject<t.QueueEvent>();

  public readonly id = slug();
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

  public get isRunning() {
    return this._isRunning;
  }

  /**
   * [Methods]
   */

  public start() {
    this.throwIfDisposed('start');
    if (!this._isRunning) {
      this._isRunning = true;
      this.fireStatus();
    }
    this.pop();
    return this;
  }

  public stop() {
    this.throwIfDisposed('stop');
    if (this._isRunning) {
      this._isRunning = false;
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
      } catch (error: any) {
        const elapsed = timer.elapsed.msec;
        this.fire({ type: 'QUEUE/item/done', payload: { id, elapsed, error } });
      } finally {
        this._current = undefined;
      }
    };

    const item: IItem = { id, run, handler };
    this.items.push(item);

    const event$ = this.event$.pipe(filter((e) => e.payload.id === id));
    const done$ = event$.pipe(
      filter((e) => e.type === 'QUEUE/item/done'),
      map((e) => e.payload as t.IQueueItemDone),
    );

    const promise = new Promise<T>((resolve, reject) => {
      done$.pipe(take(1)).subscribe((e) => {
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
    const isRunning = this.isRunning;
    if (isRunning && !this._current) {
      this.pop();
    }

    this.fire({ type: 'QUEUE/pushed', payload: { id, isRunning } });
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
        length: this.length,
        isRunning: this.isRunning,
      },
    });
  }

  private async pop() {
    if (this.isDisposed || !this.isRunning) {
      return;
    }
    const item = this.items[0];
    if (item) {
      this.items = this.items.slice(1);
      this._current = item;
      await item.run();
      if (this.length > 0) {
        this.pop(); // <== 🌳RECURSION
      }
    }
  }

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because [Queue] is disposed.`);
    }
  }
}
