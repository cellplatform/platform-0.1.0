import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import * as minimist from 'minimist';

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
    const { root } = args;
    if (!root) {
      throw new Error(`A root [Command] spec must be passed to the state constructor.`);
    }

    this._.root = root;
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    dispose$: new Subject(),
    events$: new Subject<t.CommandEvent>(),
    root: (undefined as unknown) as ICommand,
    text: '',
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
  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  public get root() {
    return this._.root;
  }

  public get text() {
    return this._.text;
  }

  public get command() {
    const args = minimist(this.text.split(' '));
    const cmd = args._[0];
    return this.root.children.find(c => c.title === cmd);
  }

  /**
   * [Methods]
   */
  public onChange: t.CommandChangeDispatcher = e => {
    const { text } = e;
    this._.text = text;
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
