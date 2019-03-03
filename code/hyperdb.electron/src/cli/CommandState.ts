import { Subject } from 'rxjs';
import { map, share, take, takeUntil, filter } from 'rxjs/operators';

import * as t from './types';

/**
 * Manages state of a CLI program.
 */
export class CommandState implements t.ICommandState {
  /**
   * [Static]
   */
  public static create() {
    return new CommandState();
  }

  /**
   * [Constructor]
   */
  private constructor() {
    this.disposed$.pipe(take(1)).subscribe(() => (this._.isDisposed = true));
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    isDisposed: false,
    dispose$: new Subject(),
    events$: new Subject<t.CommandEvent>(),
  };

  public readonly disposed$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this._.dispose$),
    share(),
  );
  public readonly change$ = this.events$.pipe(
    filter(e => e.type === 'COMMMAND/change'),
    map(e => e.payload),
    share(),
  );

  /**
   * [Properties]
   */
  public get text() {
    return 'FOO';
  }

  public get isDisposed() {
    return this._.isDisposed;
  }

  /**
   * [Methods]
   */
  public onChange: t.CommandChangeDispatcher = e => {
    this._.events$.next({ type: 'COMMMAND/change', payload: this });
  };

  public dispose() {
    this._.dispose$.next();
  }
}
