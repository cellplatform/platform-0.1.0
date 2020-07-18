import { Observable, Subject } from 'rxjs';
import { take, filter, map, share, takeUntil } from 'rxjs/operators';
import { id as idUtil, rx } from '@platform/util.value';
import { TreeUtil } from '../TreeUtil';
import { StateObject } from '@platform/state';

type Node = t.ITreeNode;

import { t } from '../common';

/**
 * State machine for programming a tree,
 * or partial leaf within a tree.
 */
export class TreeState<N extends Node = Node> implements t.ITreeState<N> {
  public static create<N extends Node = Node>(args: t.ITreeStateArgs<N>) {
    return new TreeState<N>(args) as t.ITreeState<N>;
  }

  /**
   * Lifecycle
   */
  private constructor(args: t.ITreeStateArgs<N>) {
    this.parent = args.parent;
    this._store = StateObject.create(args.root);
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
  private _store: t.IStateObjectWrite<N>;
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
    map((e) => e.payload as t.ITreeStateChanged<N>),
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

  private get traverseMethods(): t.ITreeTraverse<N> {
    const find = this.find;
    const walkDown = this.walkDown;
    return { find, walkDown };
  }

  /**
   * [Methods]
   */

  public payload<T extends t.TreeStateEvent>(type: T['type']) {
    return rx.payload<T>(this.event$, type);
  }

  public change: t.TreeStateChange<N> = (fn, options = {}) => {
    const from = this.root;
    const args: t.TreeStateChangerArgs<N> = {
      ...this.traverseMethods,
      props: assignProps,
    };
    this._store.change((draft) => fn(draft, args));
    if (!options.silent) {
      const to = this.root;
      this.fire({ type: 'TreeState/changed', payload: { from, to } });
    }
  };

  public walkDown: t.TreeStateWalkDown<N> = (fn) => {
    TreeUtil.walkDown(this.root, (e) => {
      const node = e.node;
      const { id, namespace } = parseId(node.id);
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

  public find: t.TreeStateFind<N> = (fn) => {
    let result: N | undefined;
    this.walkDown((e) => {
      if (fn(e)) {
        result = e.node;
        e.stop();
      }
    });
    return result;
  };

  public add<C extends Node = Node>(args: { parent: string; root: C | string }) {
    const root = (typeof args.root === 'string' ? { id: args.root } : args.root) as C;
    const treeview$ = this.treeview$;

    // Prepare the parent node.
    let parent = (args.parent || '').trim();
    if (!parent) {
      throw new Error(`Cannot add child-state because a parent node was not specified.`);
    }

    const exists = Boolean(this.find((e) => e.id === args.parent));
    if (!exists) {
      const err = `Cannot add child-state because the parent node '${args.parent}' does not exist.`;
      throw new Error(err);
    }

    // Create child state.
    parent = formatId(this.namespace, args.parent);
    const child: t.ITreeState<C> = TreeState.create<C>({ parent, root, treeview$ });
    this._children.push(child);

    // Finish up.
    child.dispose$.pipe(take(1)).subscribe(() => this.remove(child));
    this.fire({ type: 'TreeState/child/added', payload: { parent: this, child } });
    return child;
  }

  public remove(input: string | t.ITreeState) {
    const child = this.children.find((item) => {
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
   * [Internal]
   */
  private fire(e: t.TreeStateEvent) {
    this._event$.next(e);
  }
}

/**
 * [Helpers]
 */

function formatId(namespace: string, id: string) {
  namespace = (namespace || '').trim();
  id = (id || '').trim();
  return `ns-${namespace}:${id}`;
}

function parseId(input: string) {
  input = (input || '').trim();
  if (!input || !(input.startsWith('ns-') && input.includes(':'))) {
    return { namespace: '', id: input };
  }
  input = input.replace(/^ns-/, '');
  const index = input.indexOf(':');
  return { namespace: input.substring(0, index), id: input.substring(index + 1) };
}

function ensureNamespacePrefix(root: Node, namespace: string) {
  TreeUtil.walkDown(root, (e) => {
    if (!e.node.id.startsWith('ns-')) {
      e.node.id = formatId(namespace, e.node.id);
    } else {
      // Namespace prefix already exist.
      // Ensure it is within the given namespace, and if not skip adjusting any children.
      const res = parseId(e.node.id);
      if (res.namespace !== namespace) {
        e.skip();
      }
    }
  });
}

function assignProps(node: Node, fn?: (props: t.ITreeNodeProps) => void) {
  node.props = node.props || {};
  if (typeof fn === 'function') {
    fn(node.props);
  }
  return node.props;
}
