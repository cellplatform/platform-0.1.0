import { equals } from 'ramda';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, share, takeUntil } from 'rxjs/operators';

import { Argv } from '../Argv';
import { R, t, value as valueUtil } from '../common';
import { Command } from '../Command/Command';
import { DEFAULT } from '../common/constants';

type ICommandStateArgs = {
  root: Command;
  getInvokeArgs: t.InvokeCommandArgsFactory;
};

/**
 * Manages state of a CLI program.
 */
export class CommandState implements t.ICommandState {
  /**
   * [Static]
   */
  public static create(args: ICommandStateArgs) {
    return new CommandState(args);
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
    this._.getInvokeArgs = args.getInvokeArgs;
    this.change = this.change.bind(this);
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    getInvokeArgs: (undefined as unknown) as t.InvokeCommandArgsFactory,
    dispose$: new Subject(),
    events$: new Subject<t.CommandStateEvent>(),
    root: (undefined as unknown) as Command,
    text: '',
    namespace: undefined as t.ICommandNamespace | undefined,
  };

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this._.dispose$),
    share(),
  );
  public readonly changed$ = this.events$.pipe(
    filter(e => e.type === 'COMMAND/state/changed'),
    map(e => e.payload as t.ICommandStateChanged),
    distinctUntilChanged((prev, next) => equals(prev, next) && !next.invoked),
    share(),
  );
  public readonly invoke$ = this.changed$.pipe(
    filter(e => e.invoked),
    share(),
  );
  public readonly invoking$ = this.events$.pipe(
    filter(e => e.type === 'COMMAND/state/invoking'),
    map(e => e.payload as t.ICommandStateInvoking),
    share(),
  );
  public readonly invoked$ = this.events$.pipe(
    filter(e => e.type === 'COMMAND/state/invoked'),
    map(e => e.payload as t.ICommandStateInvokeResponse),
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
    const root = this.namespace ? this.namespace.command : this.root;
    const args = Argv.parse(this.text);
    const path = [root.name, ...args.params];

    // NB: Catch the lowest level command, leaving params intact (ie. strict:false).
    const res = Command.tree.fromPath(root, path, { strict: false });
    if (!res) {
      return undefined;
    } else {
      return res.id === root.id ? undefined : res;
    }
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

  /**
   * Changes the current state.
   */
  public change(e: t.ICommandChangeArgs) {
    const { events$ } = this._;
    const { text, namespace } = e;

    // Update state.
    this._.text = text;
    const command = this.command;

    const trimNamespacePrefix = (text: string, namespace: t.ICommandNamespace) => {
      const ns = namespace.path.map(item => item.name);
      const parts = text.split(' ');
      let index = 0;
      for (const level of ns) {
        parts[index] = parts[index] === level ? '' : parts[index];
        index++;
      }
      return parts.join(' ').trim();
    };

    // Set namespace if requested.
    const setNamespace = (text: string, command: t.ICommand) => {
      const root = this.root;
      const isLeaf = command.children.length === 0;
      const ns = isLeaf ? command.tree.parent(root) : command;
      if (!ns || ns.id === root.id) {
        return;
      }
      const id = ns.id;
      const name = ns.name;
      const namespace: t.ICommandNamespace = {
        command: ns,
        name,
        get path() {
          return Command.tree.toPath(root, id).slice(1);
        },
        toString() {
          return namespace.path.map(c => c.name).join('.');
        },
      };
      this._.namespace = namespace;
      this._.text = trimNamespacePrefix(text, namespace); // Reset the text as we are now witin a new namespace.
    };

    if (
      command &&
      namespace === true &&
      !(this.namespace && this.namespace.command.id === command.id) // Not the current namespace.
    ) {
      setNamespace(text, command);
    }

    // Clear the namespace if requested.
    if (e.namespace === false) {
      this._.namespace = undefined;
    }

    // Alert listeners.
    const props = this.toObject();
    const invoked = props.command ? Boolean(e.invoked) : false;
    const payload = { props, invoked, namespace };
    events$.next({ type: 'COMMAND/state/changed', payload });

    // Finish up.
    return this;
  }

  /**
   * Invokes the current command, if there is one.
   */
  public async invoke(
    options: t.ICommandStateInvokeArgs = {},
  ): Promise<t.ICommandStateInvokeResponse> {
    const { events$ } = this._;
    const state = this.toObject();
    let namespaceChanged = false;

    const invoke = async (command?: t.ICommand) => {
      // Prepare the args to pass to the command.
      const args = { ...(await this._.getInvokeArgs(state)) };
      args.props = options.props !== undefined ? options.props : args.props;
      args.args = options.args !== undefined ? options.args : args.args || state.args;
      args.timeout = options.timeout !== undefined ? options.timeout : args.timeout;
      const timeout = valueUtil.defaultValue(args.timeout, DEFAULT.TIMEOUT);

      // Ensure there is a command to invoke.
      let result: t.ICommandStateInvokeResponse = {
        invoked: false,
        cancelled: false,
        namespaceChanged,
        state,
        props: args.props,
        args: typeof args.args === 'object' ? args.args : Argv.parse<any>(args.args || ''),
        timeout,
      };
      if (!command) {
        return result;
      }

      // Fire BEFORE event and exit if any listeners cancel the operation.
      let isCancelled = false;
      events$.next({
        type: 'COMMAND/state/invoking',
        payload: {
          get cancelled() {
            return isCancelled;
          },
          cancel: () => (isCancelled = true),
          state,
          args,
        },
      });
      if (isCancelled) {
        result = { ...result, invoked: false, cancelled: true };
        events$.next({ type: 'COMMAND/state/invoked', payload: result });
        return result;
      }

      // Invoke the command.
      const response = await command.invoke(args);
      result = { ...result, invoked: true, response };
      events$.next({ type: 'COMMAND/state/invoked', payload: result });

      // Finish up.
      return result;
    };

    // Step into namespace (if required).
    let ns = this.namespace;
    if (valueUtil.defaultValue(options.stepIntoNamespace, true)) {
      this.change({ text: this.text, namespace: true });
      namespaceChanged = !R.equals(ns, this.namespace);
      ns = this.namespace;
      if (namespaceChanged && ns && ns.command.handler && ns.command !== state.command) {
        invoke(ns.command);
      }
    }

    // Invoke the command
    return invoke(state.command);
  }

  public toString() {
    return this.text;
  }

  public toObject(): t.ICommandStateProps {
    return {
      root: this.root,
      text: this.text,
      args: this.args,
      command: this.command,
      namespace: this.namespace,
    };
  }
}
