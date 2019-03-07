import { equals } from 'ramda';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, share, takeUntil } from 'rxjs/operators';

import { Argv } from '../Argv';
import { t } from '../common';

type ICreateCommandState = {
  root: t.ICommand;
};

/**
 * Manages state of a CLI program.
 */
export class CommandState implements t.ICommandState {
  /**
   * [Static]
   */
  public static create(args: ICreateCommandState) {
    return new CommandState(args);
  }

  /**
   * [Constructor]
   */
  private constructor(args: ICreateCommandState) {
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
    events$: new Subject<t.CommandStateEvent>(),
    root: (undefined as unknown) as t.ICommand,
    text: '',
    namespace: undefined as t.ICommandNamespace | undefined,
  };

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this._.dispose$),
    share(),
  );
  public readonly change$ = this.events$.pipe(
    filter(e => e.type === 'COMMAND/state/change'),
    map(e => e.payload),
    distinctUntilChanged((prev, next) => equals(prev, next) && !next.invoked),
    share(),
  );
  public readonly invoke$ = this.change$.pipe(
    filter(e => e.invoked),
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
      const index = args.params.indexOf(command.name);
      args.params = args.params.slice(index + 1);
    }

    return args;
  }

  public get command() {
    const args = Argv.parse(this.text);
    const param = args.params[0];
    return param ? this.root.children.find(c => c.name === param) : undefined;
  }

  public get namespace() {
    return this._.namespace;
  }

  /**
   * [Methods]
   */
  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  public change: t.CommandChangeDispatcher = e => {
    const { text } = e;
    const { events$ } = this._;

    // Update state.
    this._.text = text;
    const props = this.toObject();
    const { command } = props;

    // Set namespace.
    if (e.namespace && command) {
      const namespace: t.ICommandNamespace = { command };
      this._.namespace = namespace;
    }

    // Alert listeners.
    const invoked = command ? Boolean(e.invoked) : false;
    const payload = { ...props, invoked };
    events$.next({ type: 'COMMAND/state/change', payload });
  };

  public toString() {
    return this.text;
  }

  public toObject(): t.ICommandState {
    return {
      text: this.text,
      args: this.args,
      command: this.command,
      namespace: this.namespace,
    };
  }
}
