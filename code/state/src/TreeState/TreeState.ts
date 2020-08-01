import { StateObject } from '../StateObject';
import { id as idUtil } from '@platform/util.value';
import { Subject, Observable } from 'rxjs';
import { filter, share, take, takeUntil } from 'rxjs/operators';

import { t, is } from '../common';
import { TreeIdentity } from '../TreeIdentity';
import { TreeQuery } from '../TreeQuery';
import { helpers } from './helpers';
import * as events from './TreeState.events';
import * as sync from './TreeState.sync';

type O = Record<string, unknown>;
type Event = t.Event<O>;
type N = t.ITreeNode;
const Identity = TreeIdentity;

/**
 * State machine for programming a tree or partial leaf within a tree.
 *
 * NOTE:
 *    All changes to the state tree are immutable.
 *
 */
export class TreeState<T extends N = N, E extends Event = Event> implements t.ITreeState<T, E> {
  public static create<T extends N = N, E extends Event = Event>(args?: t.ITreeStateArgs<T>) {
    const root = args?.root || 'node';
    const e = { ...args, root } as t.ITreeStateArgs<T>;
    return new TreeState<T, E>(e) as t.ITreeState<T, E>;
  }

  public static identity = Identity;
  public static props = helpers.props;
  public static children = helpers.children;
  public static isInstance = helpers.isInstance;

  /**
   * Lifecycle
   */
  private constructor(args: t.ITreeStateArgs<T>) {
    // Wrangle the {root} argument into an object.
    const root = (typeof args.root === 'string' ? { id: args.root } : args.root) as T;

    // Store values.
    this.namespace = Identity.namespace(root.id) || idUtil.cuid();
    this.parent = args.parent;
    this._store = StateObject.create<T>(root);

    // Set the object with the initial state.
    this._change((draft) => helpers.ensureNamespace(draft, this.namespace), {
      silent: true,
      ensureNamespace: false, // NB: No need to do it in the function (we are doing it here).
    });

    // Dispose if given observable fires.
    if (args.dispose$) {
      args.dispose$.subscribe(() => this.dispose());
    }
  }

  public dispose() {
    if (!this.isDisposed) {
      this.children.forEach((child) => child.dispose());
      this._store.dispose();
      this.fire({
        type: 'TreeState/disposed',
        payload: { final: this.root },
      });
      this._dispose$.next();
      this._dispose$.complete();
    }
  }

  /**
   * [Fields]
   */
  private _store: t.IStateObjectWritable<T>;
  private _children: t.ITreeState<any>[] = [];
  private _kind = 'TreeState'; // NB: Used by [isInstance] helper.

  public readonly namespace: string;
  public readonly parent: string | undefined;

  private _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private _event$ = new Subject<t.TreeStateEvent>();
  public readonly event = events.create<T>(this._event$, this._dispose$);

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get store() {
    return this._store;
  }

  public get root() {
    return this._store.state;
  }

  public get id() {
    return this.root.id;
  }

  public get children() {
    return this._children;
  }

  public get query(): t.ITreeQuery<T> {
    const root = this.root;
    const namespace = this.namespace;
    return TreeQuery.create<T>({ root, namespace });
  }

  /**
   * [Methods]
   */

  public dispatch: t.IStateObjectDispatchMethods<T, E>['dispatch'] = (e) => {
    return this._store.dispatch(e);
  };

  public action: t.IStateObjectDispatchMethods<T, E>['action'] = (takeUntil$) => {
    return this._store.action(takeUntil$) as t.IStateObjectAction<T, E>;
  };

  public toId = (input?: string): string => {
    const id = Identity.parse(input).id;
    return Identity.format(this.namespace, id);
  };

  public change: t.TreeStateChange<T, E> = (fn, options) => this._change(fn, options);
  private _change(
    fn: t.TreeStateChanger<T>,
    options: { silent?: boolean; ensureNamespace?: boolean; action?: E['type'] } = {},
  ) {
    const { action } = options;
    const res = this._store.change(
      (draft) => {
        const ctx = this.ctx(draft);
        fn(draft, ctx);
        if (options.ensureNamespace !== false) {
          helpers.ensureNamespace(draft, this.namespace);
        }
      },
      { action },
    );

    if (!options.silent && res.changed) {
      this.fire({ type: 'TreeState/changed', payload: res.changed });
    }

    return res;
  }

  public add = <C extends N = N>(args: { parent?: string; root: C | string | t.ITreeState<C> }) => {
    // Wrangle: Check if the arguments are in fact a [TreeState] instance.
    if (TreeState.isInstance(args)) {
      args = { parent: this.id, root: args as t.ITreeState<C> };
    }

    // Create the child instance.
    const self = this as t.ITreeState<any>;
    const child = this.getOrCreateInstance<any>(args);
    if (this.childExists(child)) {
      const err = `Cannot add child '${child.id}' as it already exists within the parent '${this.root.id}'.`;
      throw new Error(err);
    }

    // Store the child instance.
    this._children.push(child);

    // Insert data into state-tree.
    this.change((root, ctx) => {
      TreeState.children<any>(root).push(child.root);
    });

    // Update state-tree when child changes.
    this.listen(child);

    // Remove when child is disposed.
    child.dispose$
      .pipe(take(1))
      .pipe(filter(() => this.childExists(child)))
      .subscribe(() => this.remove(child));

    // Finish up.
    this.fire({ type: 'TreeState/child/added', payload: { parent: self, child } });
    return child as t.ITreeState<C>;
  };

  public remove = (input: string | t.ITreeState) => {
    const child = this.child(input);
    if (!child) {
      const err = `Cannot remove child-state as it does not exist in the parent '${this.root.id}'.`;
      throw new Error(err);
    }

    // Remove from local state.
    this._children = this._children.filter((item) => item.root.id !== child.root.id);

    // Finish up.
    const self = this as t.ITreeState<any>;
    this.fire({ type: 'TreeState/child/removed', payload: { parent: self, child } });
    return child;
  };

  public clear = (): t.ITreeState<T> => {
    this.children.forEach((child) => this.remove(child));
    return this;
  };

  public find: t.TreeStateFind<T> = (match) => this._find(0, match);
  private _find(level: number, match: t.TreeStateFindMatch<T>): t.ITreeState<T> | undefined {
    const children = this.children;
    if (children.length === 0) {
      return undefined;
    } else {
      for (const child of children) {
        const tree = child as TreeState<T>;
        let stopped = false;
        const args: t.TreeStateFindMatchArgs<T> = {
          level,
          id: Identity.id(child.id),
          namespace: child.namespace,
          tree,
          stop: () => (stopped = true),
        };
        if (match(args)) {
          return child;
        } else {
          return stopped ? undefined : tree._find(level + 1, match); // <== RECURSION 🌳
        }
      }
      return undefined;
    }
  }

  public syncFrom: t.TreeStateSyncFrom = (args) => {
    const { until$ } = args;
    const isObservable = is.observable((args.source as any).event$);

    const source$ = isObservable
      ? ((args.source as any).event$ as Observable<t.TreeStateEvent>)
      : (args.source as t.ITreeState).event.$;

    const parent = isObservable
      ? ((args.source as any).parent as string | undefined)
      : (args.source as t.ITreeState).parent;

    const initial = isObservable ? undefined : (args.source as t.ITreeState).root;

    return sync.syncFrom({ target: this, parent, initial, source$, until$ });
  };

  /**
   * [Internal]
   */
  private fire: t.FireEvent<t.TreeStateEvent> = (e) => this._event$.next(e);

  private ctx(root: T): t.TreeStateChangerContext<T> {
    const namespace = this.namespace;
    const query = TreeQuery.create<T>({ root, namespace });
    return {
      ...query,
      props: TreeState.props,
      children: TreeState.children,
    };
  }

  private child(id: string | t.ITreeState<any>) {
    id = typeof id === 'string' ? id : id.root.id;
    return this.children.find((item) => item.root.id === id);
  }

  private childExists(input: string | t.ITreeState<any>) {
    return Boolean(this.child(input));
  }

  private getOrCreateInstance<C extends N = N>(args: {
    parent?: string;
    root: C | string | t.ITreeState<C>;
  }): t.ITreeState<C> {
    const root = (typeof args.root === 'string' ? { id: args.root } : args.root) as C;
    if (TreeState.isInstance(root)) {
      return args.root as t.ITreeState<C>;
    }

    let parent = Identity.toString(args.parent);
    parent = parent ? parent : Identity.stripNamespace(this.id);

    if (!this.query.exists((e) => e.id === parent)) {
      const err = `Cannot add child-state because the parent node '${parent}' does not exist.`;
      throw new Error(err);
    }

    parent = Identity.format(this.namespace, parent);
    return TreeState.create<C>({ parent, root });
  }

  private listen(child: t.ITreeState<any>) {
    type Changed = t.ITreeStateChangedEvent;
    type Removed = t.ITreeStateChildRemovedEvent;

    const removed$ = this.event
      .payload<Removed>('TreeState/child/removed')
      .pipe(filter((e) => e.child.id === child.id));

    removed$.subscribe((e) => {
      this.change((draft, ctx) => {
        // REMOVE child in state-tree.
        draft.children = TreeState.children(draft).filter(({ id }) => id !== child.id);
      });
    });

    child.event
      .payload<Changed>('TreeState/changed')
      .pipe(takeUntil(child.dispose$), takeUntil(removed$))
      .subscribe((e) => {
        this.change((draft, ctx) => {
          // UPDATE child in state-tree.
          const children = TreeState.children(draft);
          const index = children.findIndex(({ id }) => id === child.id);
          if (index > -1) {
            children[index] = e.to as T;
          }
        });
      });
  }
}
