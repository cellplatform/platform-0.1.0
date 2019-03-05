import { equals } from 'ramda';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, share, takeUntil } from 'rxjs/operators';

import { Argv } from '../Argv';
import { t } from '../common';

type ICommandStateArgs = {
  root: t.ICommand;
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
    root: (undefined as unknown) as t.ICommand,
    text: '',
  };

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this._.dispose$),
    share(),
  );
  public readonly change$ = this.events$.pipe(
    filter(e => e.type === 'COMMAND/change'),
    map(e => e.payload),
    distinctUntilChanged((prev, next) => equals(prev, next)),
    share(),
  );
  public readonly invoke$ = this.events$.pipe(
    filter(e => e.type === 'COMMAND/invoke'),
    map(e => e.payload),
    // distinctUntilChanged((prev, next) => equals(prev, next)),
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
    const args = Argv.parse(this.text);
    const param = args.params[0];
    return param ? this.root.children.find(c => c.title === param) : undefined;
  }

  public get args() {
    const args = Argv.parse(this.text);

    /**
     * Trim params prior to the current command.
     * For example:
     *
     *    - with the command line `create foo bar`
     *    - if the command is `create`
     *    - the params would be `foo bar` excluding `create`.
     *
     */
    const command = this.command;
    if (command) {
      const index = args.params.indexOf(command.title);
      args.params = args.params.slice(index + 1);
    }

    return args;
  }

  /**
   * [Methods]
   */
  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  public change: t.CommandChangeDispatcher = e => {
    const { text, invoked } = e;
    const { events$ } = this._;
    this._.text = text;
    const payload = this.toObject();
    events$.next({ type: 'COMMAND/change', payload });
    if (invoked) {
      events$.next({ type: 'COMMAND/invoke', payload });
    }
  };

  public toString() {
    return this.text;
  }

  public toObject() {
    return { text: this.text, command: this.command, args: this.args };
  }
}
