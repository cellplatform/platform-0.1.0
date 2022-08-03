import { id as idUtil } from '@platform/util.value';
import { Observable, Subject } from 'rxjs';
import { filter, share, take, takeUntil } from 'rxjs/operators';

import { is, t } from '../common';
import { StateObject } from '../StateObject';
import { TreeIdentity } from '../TreeIdentity';
import { TreeQuery } from '../TreeQuery';
import { helpers } from './helpers';
import * as events from './TreeState.events';
import * as path from './TreeState.path';
import * as sync from './TreeState.sync';

type N = t.ITreeNode;

const Identity = TreeIdentity;

/**
 * State machine for programming a tree or partial leaf within a tree.
 *
 * NOTE:
 *    All changes to the state tree are immutable.
 *
 */
export class TreeState<T extends N = N> implements t.ITreeState<T> {
  public static create<T extends N = N>(args?: t.ITreeStateArgs<T>) {
    const root = args?.root || 'node';
    const e = { ...args, root } as t.ITreeStateArgs<T>;
    return new TreeState<T>(e) as t.ITreeState<T>;
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
    if (root.id.includes('/')) {
      const err = `Tree node IDs cannot contain the "/" character`;
      throw new Error(err);
    }

    // Store values.
    this.key = Identity.key(root.id);
    this.namespace = Identity.namespace(root.id) || idUtil.cuid();
    this.parent = args.parent;
    const store = (this._store = StateObject.create<T>(root));

    // Initialise events.
    this.event = events.create<T>({
      event$: this._event$,
      until$: this.dispose$,
    });

    // Set the object with the initial state.
    this._change((draft) => helpers.ensureNamespace(draft, this.namespace), {
      ensureNamespace: false, // NB: No need to "ensure namespace" in the function (we are doing it here).
    });

    // Bubble events.
    store.event.changed$.pipe(takeUntil(this.dispose$)).subscribe((e) => {
      this.fire({ type: 'TreeState/changed', payload: e });
    });
    store.event.patched$.pipe(takeUntil(this.dispose$)).subscribe((e) => {
      this.fire({ type: 'TreeState/patched', payload: e });
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
        payload: { final: this.state },
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

  // NB: Used by [isInstance] helper.
  private _kind = 'TreeState';

  public readonly key: string;
  public readonly namespace: string;
  public readonly parent: string | undefined;

  private _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private _event$ = new Subject<t.TreeStateEvent>();
  public readonly event: t.ITreeStateEvents<T>;

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get readonly() {
    return this as t.ITreeStateReadonly<T>;
  }

  public get state() {
    return this._store.state;
  }

  public get id() {
    return this.state.id;
  }

  public get children() {
    return this._children;
  }

  public get query(): t.ITreeQuery<T> {
    const root = this.state;
    const namespace = this.namespace;
    return TreeQuery.create<T>({ root, namespace });
  }

  public get path(): t.ITreeStatePath<T> {
    const self = this as t.ITreeState<T>;
    return path.create<T>(self);
  }

  /**
   * [Methods]
   */

  public change: t.TreeStateChange<T> = (fn) => {
    return this._change(fn);
  };

  private _change(fn: t.TreeStateChanger<T>, options: { ensureNamespace?: boolean } = {}) {
    return this._store.change((draft) => {
      const ctx = this.ctx(draft);
      fn(draft, ctx);
      if (options.ensureNamespace !== false) {
        helpers.ensureNamespace(draft, this.namespace);
      }
    });
  }

  public changeAsync: t.TreeStateChangeAsync<T> = (fn) => {
    return this._store.changeAsync(async (draft) => {
      const ctx = this.ctx(draft);
      await fn(draft, ctx);
    });
  };

  public add = <C extends N = N>(
    args: { parent?: string; root: C | string | t.ITreeState<C> } | t.ITreeState<C>,
  ): t.ITreeState<C> => {
    // Wrangle: Check if the arguments are in fact a [TreeState] instance.
    if (TreeState.isInstance(args)) {
      args = { parent: this.id, root: args as t.ITreeState<C> };
    }

    // Create the child instance.
    const self = this as t.ITreeState<any>;
    const child = this.getOrCreateInstance<any>(args as t.TreeStateAddArgs<C>);
    if (this.childExists(child)) {
      const err = `Cannot add child '${child.id}' as it already exists within the parent '${this.state.id}'.`;
      throw new Error(err);
    }

    // Store the child instance.
    this._children.push(child);

    // Insert data into state-tree.
    this.change((draft, ctx) => {
      const root = args.parent && args.parent !== draft.id ? ctx.findById(args.parent) : draft;
      if (!root) {
        const err = `Cannot add child-state because the parent sub-node '${args.parent}' within '${draft.id}' does not exist.`;
        throw new Error(err);
      }
      TreeState.children<any>(root).push(child.state);
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

  public remove = (input: string | t.ITreeState<any>) => {
    const child = this.child(input);
    if (!child) {
      const err = `Cannot remove child-state as it does not exist in the parent '${this.state.id}'.`;
      throw new Error(err);
    }

    // Remove from local state.
    this._children = this._children.filter((item) => item.state.id !== child.state.id);

    // Finish up.
    const self = this as t.ITreeState<any>;
    this.fire({ type: 'TreeState/child/removed', payload: { parent: self, child } });
    return child;
  };

  public clear = (): t.ITreeState<T> => {
    this.children.forEach((child) => this.remove(child));
    return this;
  };

  public contains: t.TreeStateContains<T> = (match) => {
    return Boolean(this.find(match));
  };

  public find: t.TreeStateFind<T> = (input) => {
    if (!input) {
      return undefined;
    }

    const match: t.TreeStateFindMatch<T> =
      typeof input === 'function'
        ? input
        : (e) => {
            const id = TreeIdentity.toNodeId(input);
            return e.id === id ? true : Boolean(e.tree.query.findById(id));
          };

    let result: t.ITreeState<T> | undefined;
    this.walkDown((e) => {
      if (e.level > 0) {
        if (match(e) === true) {
          e.stop();
          result = e.tree;
        }
      }
    });
    return result;
  };

  public walkDown: t.TreeStateWalkDown<T> = (visit) => {
    const inner = (
      level: number,
      index: number,
      tree: t.ITreeState<T>,
      parent: t.ITreeState<T> | undefined,
      state: { stopped?: boolean },
    ) => {
      if (state.stopped) {
        return;
      }
      let skipped = false;
      const args: t.ITreeStateDescend<T> = {
        level,
        id: tree.id,
        key: Identity.key(tree.id),
        namespace: tree.namespace,
        index,
        tree,
        parent,
        stop: () => (state.stopped = true),
        skip: () => (skipped = true),
        toString: () => tree.id,
      };
      visit(args);
      if (state.stopped) {
        return;
      }
      if (!skipped && tree.children.length) {
        tree.children.forEach((child, i) => {
          inner(level + 1, i, child, tree, state); // <== RECURSION 🌳
        });
      }
    };
    return inner(0, -1, this, undefined, {});
  };

  public syncFrom: t.TreeStateSyncFrom = (args) => {
    const { until$ } = args;
    const isObservable = is.observable((args.source as any).event$);

    const source$ = isObservable
      ? ((args.source as any).event$ as Observable<t.TreeStateEvent>)
      : (args.source as t.ITreeState).event.$;

    const parent = isObservable
      ? ((args.source as any).parent as string | undefined)
      : (args.source as t.ITreeState).parent;

    const initial = isObservable ? undefined : (args.source as t.ITreeState).state;

    const target = this as t.ITreeState<any>;
    return sync.syncFrom({ target, parent, initial, source$, until$ });
  };

  /**
   * [Internal]
   */
  private fire: t.FireEvent<t.TreeStateEvent> = (e) => this._event$.next(e);

  private ctx(root: T): t.TreeStateChangerContext<T> {
    const namespace = this.namespace;
    const query = TreeQuery.create<T>({ root, namespace });

    const ctx = {
      ...query,

      props: TreeState.props,
      children: TreeState.children,
      toObject: <D>(draft?: D) => StateObject.toObject(draft),

      query: (node?: T, namespace?: string) =>
        TreeQuery.create<T>({ root: node || root, namespace }),
    };

    return ctx as t.TreeStateChangerContext<T>;
  }

  private child(id: string | t.ITreeState<any>) {
    id = typeof id === 'string' ? id : id.state.id;
    return this.children.find((item) => item.id === id);
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

    if (!this.query.exists((e) => e.key === parent)) {
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
