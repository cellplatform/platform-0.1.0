import { Observable, Subject } from 'rxjs';
import { take, filter, map, share, takeUntil } from 'rxjs/operators';
import { id as idUtil, rx } from '@platform/util.value';
import { TreeUtil } from '../TreeUtil';
import { StateObject } from '@platform/state';
import { id } from './TreeState.id';
import * as util from './util';

type N = t.ITreeNode;

import { t } from '../common';

/**
 * State machine for programming a tree, or partial leaf within a tree.
 * NOTE:
 *    All changes to the state tree are immutable.
 *
 */
export class TreeState<T extends N = N> implements t.ITreeState<T> {
  public static create<T extends N = N>(args: t.ITreeStateArgs<T>) {
    return new TreeState<T>(args) as t.ITreeState<T>;
  }

  public static id = id;

  /**
   * Lifecycle
   */
  private constructor(args: t.ITreeStateArgs<T>) {
    const root = (typeof args.root === 'string' ? { id: args.root } : args.root) as T;
    this._store = StateObject.create<T>(root);
    this.parent = args.parent;
    this.change((root) => ensureNamespacePrefix(root, this.namespace), { silent: true });

    this.treeview$ = (args.treeview$ || new Subject<t.TreeViewEvent>()).pipe(
      takeUntil(this.dispose$),
    );

    if (args.dispose$) {
      args.dispose$.subscribe((e) => this.dispose());
    }
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private _store: t.IStateObjectWrite<T>;
  private _children: t.ITreeState[] = [];
  private treeview$: Observable<t.TreeViewEvent>;

  public readonly namespace = idUtil.cuid();
  public readonly parent: string | undefined;

  private _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private _event$ = new Subject<t.TreeStateEvent>();
  public readonly event$ = this._event$.pipe(takeUntil(this.dispose$), share());

  public readonly changed$ = this.event$.pipe(
    filter((e) => e.type === 'TreeState/changed'),
    map((e) => e.payload as t.ITreeStateChanged<T>),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get root() {
    return this._store.state;
  }

  public get id() {
    return this.root.id;
  }

  public get children() {
    return [...this._children];
  }

  private get traverseMethods(): t.ITreeTraverse<T> {
    const find = this.find;
    const exists = this.exists;
    const walkDown = this.walkDown;
    return { find, exists, walkDown };
  }

  private get changeCtx(): t.TreeStateChangerContext<T> {
    return {
      ...this.traverseMethods,
      props: util.assignProps,
      children: util.assignChildren,
    };
  }

  /**
   * [Methods]
   */

  public payload<E extends t.TreeStateEvent>(type: E['type']) {
    return rx.payload<E>(this.event$, type);
  }

  public change: t.TreeStateChange<T> = (fn, options = {}) => {
    const from = this.root;
    const ctx = this.changeCtx;
    this._store.change((draft) => fn(draft, ctx));
    if (!options.silent) {
      const to = this.root;
      this.fire({ type: 'TreeState/changed', payload: { from, to } });
    }
  };

  public add<C extends N = N>(args: { parent?: string; root: C | string | t.ITreeState<C> }) {
    // Create and store child instance.
    const child = this.getOrCreateInstance(args);
    this._children.push(child);

    // Insert data into state-tree.
    this.change((root, ctx) => {
      ctx.children<C>(root).push(child.root);
    });

    // Update state-tree when child changes.
    this.listen(child);

    // Finish up.
    child.dispose$.pipe(take(1)).subscribe(() => this.remove(child));
    this.fire({ type: 'TreeState/child/added', payload: { parent: this, child } });
    return child;
  }

  public remove(input: string | t.ITreeState) {
    const child = this._children.find((item) => {
      const id = typeof input === 'string' ? input : input.root.id;
      return item.root.id === id;
    });

    if (!child) {
      const err = `Cannot remove child-state as it does not exist in the parent '${this.root.id}'.`;
      throw new Error(err);
    }

    // Remove from local state.
    this._children = this._children.filter((item) => item.root.id !== child.root.id);

    // Finish up.
    this.fire({ type: 'TreeState/child/removed', payload: { parent: this, child } });
    return child;
  }

  /**
   * [Methods] - data traversal.
   */
  public walkDown: t.TreeStateWalkDown<T> = (fn) => {
    TreeUtil.walkDown(this.root, (e) => {
      const node = e.node;
      const { id, namespace } = TreeState.id.parse(node.id);
      if (namespace === this.namespace) {
        fn({
          id,
          namespace,
          node,
          stop: e.stop,
          skip: e.skip,
        });
      }
    });
    return;
  };

  public find: t.TreeStateFind<T> = (fn) => {
    let result: T | undefined;
    this.walkDown((e) => {
      if (fn(e)) {
        result = e.node;
        e.stop();
      }
    });
    return result;
  };

  public exists: t.TreeStateExists<T> = (fn) => Boolean(this.find(fn));

  /**
   * [Internal]
   */
  private fire(e: t.TreeStateEvent) {
    this._event$.next(e);
  }

  private getOrCreateInstance<C extends N = N>(args: {
    parent?: string;
    root: C | string | t.ITreeState<C>;
  }): t.ITreeState<C> {
    const root = (typeof args.root === 'string' ? { id: args.root } : args.root) as C;
    if (util.isTreeStateInstance(root)) {
      return args.root as t.ITreeState<C>;
    }

    let parent = id.toString(args.parent);
    parent = parent ? parent : id.stripPrefix(this.id);

    if (!this.exists((e) => e.id === parent)) {
      const err = `Cannot add child-state because the parent node '${parent}' does not exist.`;
      throw new Error(err);
    }

    parent = id.format(this.namespace, parent);
    const treeview$ = this.treeview$;
    return TreeState.create<C>({ parent, root, treeview$ });
  }

  private listen(child: t.ITreeState) {
    type Changed = t.ITreeStateChangedEvent;
    type Removed = t.ITreeStateChildRemovedEvent;

    const removed$ = this.payload<Removed>('TreeState/child/removed').pipe(
      filter((e) => e.child.id === child.id),
    );

    removed$.subscribe((e) => {
      this.change((draft, ctx) => {
        // REMOVE child in state-tree.
        draft.children = ctx.children(draft).filter(({ id }) => id !== child.id);
      });
    });

    child
      .payload<Changed>('TreeState/changed')
      .pipe(takeUntil(child.dispose$), takeUntil(removed$))
      .subscribe((e) => {
        this.change((draft, ctx) => {
          // UPDATE child in state-tree.
          const children = ctx.children(draft);
          const index = children.findIndex(({ id }) => id === child.id);
          if (index > -1) {
            children[index] = e.to as T;
          }
        });
      });
  }
}

/**
 * [Helpers]
 */

function ensureNamespacePrefix(root: N, namespace: string) {
  TreeUtil.walkDown(root, (e) => {
    if (!e.node.id.startsWith('ns-')) {
      e.node.id = id.format(namespace, e.node.id);
    } else {
      // Namespace prefix already exists.
      // Ensure it is within the given namespace, and if not skip adjusting any children.
      const res = id.parse(e.node.id);
      if (res.namespace !== namespace) {
        e.skip();
      }
    }
  });
}
