import { equals } from 'ramda';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, share, takeUntil } from 'rxjs/operators';

import { Argv } from '../Argv';
import { R, t, value as valueUtil, str } from '../common';
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
    autoCompleted: undefined as t.ICommandAutoCompleted | undefined,
    prevChange: undefined as t.ICommandChangeArgs | undefined,
  };

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );
  public readonly changing$ = this.events$.pipe(
    filter(e => e.type === 'COMMAND/state/changing'),
    map(e => e.payload as t.ICommandStateChanging),
    share(),
  );
  public readonly changed$ = this.events$.pipe(
    filter(e => e.type === 'COMMAND/state/changed'),
    map(e => e.payload as t.ICommandStateChanged),
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

  public get autoCompleted() {
    return this._.autoCompleted;
  }

  public get fuzzyMatches() {
    const currentId = this.command ? this.command.id : undefined;
    const root = this.namespace ? this.namespace.command : this.root;
    const input = (this.autoCompleted
      ? this.autoCompleted.matches.map(cmd => cmd.name)
      : [this.text]
    ).filter(text => Boolean(text.trim()));
    const isEmpty = input.length === 0;
    return root.children
      .map(command => {
        const { name } = command;
        const isMatch = isEmpty ? true : input.some(text => str.fuzzy.isMatch(text, name));
        return { command, isMatch };
      })
      .map(item => {
        const isCurrent = item.command.id === currentId;
        return isCurrent ? { ...item, isMatch: true } : item;
      });
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
  public change(e: t.ICommandChangeArgs, options: { silent?: boolean } = {}) {
    // Fire BEFORE event.
    const { silent } = options;
    const { events$ } = this._;
    const prev = this._.prevChange;
    this._.prevChange = e;
    if (!silent) {
      let isCancelled = false;
      events$.next({
        type: 'COMMAND/state/changing',
        payload: {
          prev,
          next: e,
          get isCancelled() {
            return isCancelled;
          },
          cancel() {
            isCancelled = true;
          },
        },
      });
      if (isCancelled) {
        return this;
      }
    }

    // Setup initial conditions.
    let namespace = e.namespace;
    let text = e.text === undefined ? this.text : e.text;

    // Reset namespace if parent requested.
    if (namespace === 'PARENT' && this._.namespace) {
      const parent = this._.namespace.command.tree.parent(this.root);
      this.clear({ silent: true });
      if (parent) {
        namespace = true;
        text = this.root.tree
          .toPath(parent)
          .slice(1)
          .map(cmd => cmd.name)
          .join(' ');
      }
    }

    // Update state.
    this._.text = text;
    const command = this.command;
    const prevNamespace = this.namespace;

    const trimNamespacePrefix = (
      text: string,
      prev: t.ICommandNamespace | undefined,
      next: t.ICommandNamespace,
    ) => {
      const textParts = text.split(' ');
      const nsPrev = prev ? prev.path.map(item => item.name) : [];
      const nsNext = next.path.map(item => item.name).slice(nsPrev.length);
      let index = 0;
      for (const level of nsNext) {
        textParts[index] = textParts[index] === level ? '' : textParts[index];
        index++;
      }
      return textParts.join(' ').trim();
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
      const nextNamespace: t.ICommandNamespace = {
        command: ns,
        name,
        get path() {
          return Command.tree.toPath(root, id).slice(1);
        },
        toString(options = {}) {
          const { delimiter = '.' } = options;
          return nextNamespace.path.map(c => c.name).join(delimiter);
        },
      };
      this._.namespace = nextNamespace;
      this._.text = trimNamespacePrefix(text, prevNamespace, nextNamespace); // Reset the text as we are now witin a new namespace.
    };

    if (command && namespace === true) {
      if (!this.namespace || (this.namespace ? this.namespace.command.id !== command.id : true)) {
        setNamespace(text, command);
      }
    }

    // Clear the namespace if requested.
    if (e.namespace === false) {
      this._.namespace = undefined;
    }

    // Store the auto-complete value.
    this._.autoCompleted = e.autoCompleted;
    if (!silent && e.autoCompleted) {
      events$.next({ type: 'COMMAND/state/autoCompleted', payload: e.autoCompleted });
    }

    // Fire AFTER event.
    if (!silent) {
      const props = this.toObject();
      const invoked = props.command ? Boolean(e.invoked) : false;
      const payload = { props, invoked, namespace: Boolean(this.namespace) };
      events$.next({ type: 'COMMAND/state/changed', payload });
    }

    // Finish up.
    return this;
  }

  /**
   * Clears the state of the current command/namespace.
   */
  public clear(options: { silent?: boolean } = {}) {
    this.change({ text: '', namespace: false }, options);
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
          get isCancelled() {
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
      autoCompleted: this.autoCompleted,
      fuzzyMatches: this.fuzzyMatches,
    };
  }
}
