import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { t } from '../common';

/**
 * An in memory promise queue.
 */
export class MemoryQueue implements t.IMemoryQueue {
  public static create = (): t.IMemoryQueue => new MemoryQueue();

  /**
   * [Lifecycle]
   */
  private constructor() {}

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */

  private handlers: t.QueueHandler<any>[] = [];
  private _isRunning = false;
  private _dispose$ = new Subject<{}>();

  public dispose$ = this._dispose$.pipe(share());

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get length() {
    return this.handlers.length;
  }

  public get isEmpty() {
    return this.length === 0;
  }

  public get isRunning() {
    return this._isRunning;
  }

  /**
   * [Methods]
   */

  public push<T>(handler: t.QueueHandler<T>) {
    this.throwIfDisposed('push');
    return new Promise<T>((resolve, reject) => {
      this.handlers.push(async () => {
        try {
          this._isRunning = true;
          const res = await handler();
          resolve(res);
        } catch (error) {
          reject(error);
        } finally {
          this._isRunning = false;
        }
      });
      if (!this.isRunning) {
        this.pop();
      }
    });
  }

  /**
   * [Internal]
   */

  private async pop() {
    const item = this.handlers[0];
    if (!this.isDisposed && item) {
      this.handlers = this.handlers.slice(1);
      await item();
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
