import { app } from 'electron';
import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

export type IWindowsChange = {
  type: 'CREATED' | 'CLOSED';
  window: IWindowRef;
  total: number;
};

export type IWindowRef = {
  id: number;
};

/**
 * Keeps a set of reference to global windows.
 */
export class WindowsMain {
  private _refs: IWindowRef[] = [];

  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());
  public isDisposed = false;

  private readonly _change$ = new Subject<IWindowsChange>();
  public readonly change$ = this._change$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  constructor() {
    const change = (
      type: IWindowsChange['type'],
      id: number,
    ): IWindowsChange => {
      const total = this._refs.length;
      return { type, window: { id }, total };
    };

    // Keep a record of current windows.
    app.on('browser-window-created', (e, window) => {
      const id = window.id;
      this._refs = [...this._refs, { id }];
      this._change$.next(change('CREATED', id));
      window.on('close', () => {
        this._refs = this._refs.filter(ref => ref.id !== id);
        this._change$.next(change('CLOSED', id));
      });
    });
  }

  public dispose() {
    this.isDisposed = true;
    this._dispose$.next();
  }

  /**
   * [Properties]
   */
  public get refs() {
    return this._refs;
  }

  public get ids() {
    return this._refs.map(ref => ref.id);
  }
}
