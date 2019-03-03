import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { ICommand } from './libs';
import * as t from './types';

type ICommandStateArgs = {
  root: ICommand;
};

/**
 * Manages state of a CLI program.
 */
export class CommandState<P extends object = any> implements t.ICommandState<P> {
  /**
   * [Static]
   */
  public static create<P extends object = any>(args: ICommandStateArgs) {
    return new CommandState<P>(args);
  }

  /**
   * [Constructor]
   */
  private constructor(args: ICommandStateArgs) {
    this._.root = args.root;
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    dispose$: new Subject(),
    events$: new Subject<t.CommandEvent>(),
    root: (undefined as unknown) as ICommand,
  };

  public readonly dispose$ = this._.dispose$.pipe(share());
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
    return 'TEXT'; // TEMP 🐷
  }

  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  /**
   * [Methods]
   */
  public onChange: t.CommandChangeDispatcher = e => {
    this._.events$.next({ type: 'COMMMAND/change', payload: this });
  };

  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  public toString() {
    return this.text;
  }
}
