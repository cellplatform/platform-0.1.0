import { TreeQuery } from '@platform/state/lib/TreeQuery';
import { dispose } from '@platform/util.value';
import { Subject } from 'rxjs';

import { t } from '../common';
import { TreeEvents } from '../TreeEvents';
import { mutations } from './mutations';

export { dispose };

type N = t.ITreeviewNode;
type E = t.TreeviewEvent;

type T = {
  id: string;
  node: t.ITreeviewNode;
  props: t.ITreeviewNodeProps;
  parent: T;
  children: t.ITreeviewNode[];
  index: number;
  isRoot: boolean;
  isFirst: boolean;
  isLast: boolean;
  isInlineAndOpen: boolean;
  prev: T | undefined;
  next: T | undefined;
  sibling(index: number): T | undefined;
  deepestOpenChild(pos: 'FIRST' | 'LAST'): T;
  nearestNonLastAncestor: T | undefined;
};

/**
 * Wrangle input options for a strategy.
 */
export const options = () => {
  const treeview$ = new Subject<E>();
  const events = TreeEvents.create(treeview$);
  return { treeview$, events };
};

/**
 * Current helpers
 */
export const current = (tree: t.ITreeState) => {
  const getter = get(tree);
  return {
    get: getter,
    query: getter.query,
    mutate: mutations(tree),
  };
};

export const props = (node?: N) => node?.props?.treeview || {};

/**
 * Query helpers.
 */
export function get(tree: t.ITreeState) {
  const query = TreeQuery.create<N>({ root: tree.state });

  const NODE = {
    isInlineAndOpen(node?: N) {
      return Boolean(props(node).inline?.isOpen && (node?.children || []).length > 0);
    },

    deepestOpenChild(pos: 'FIRST' | 'LAST', node?: N): N | undefined {
      if (!NODE.isInlineAndOpen(node)) {
        return node; // Not open - return the given node.
      } else {
        const children = node?.children || [];
        const index = pos === 'FIRST' ? 0 : children.length - 1;
        const child = children[index];
        return !NODE.isInlineAndOpen(child) ? child : NODE.deepestOpenChild(pos, child); // <== RECURSION 🌳
      }
    },
  };

  const nodeHelpers = (input?: t.NodeIdentifier) => {
    const id = typeof input === 'string' ? input : input?.id || '';
    const cache: Record<string, any> = {};

    const api: T = {
      id,
      get node(): t.ITreeviewNode {
        return cache.node || (cache.node = query.findById(id));
      },
      get props() {
        return props(api.node);
      },
      get parent(): T {
        return cache.parent || (cache.parent = nodeHelpers(query.parent(api.node)));
      },
      get children(): t.ITreeviewNode[] {
        return get.children(api.node);
      },
      get index() {
        return get.children(api.parent).findIndex((child) => child.id === id);
      },
      get isRoot() {
        return !api.parent.id;
      },
      get isFirst() {
        return api.index === 0;
      },
      get isLast() {
        return api.index === (get.children(api.parent) || []).length - 1;
      },
      get isInlineAndOpen() {
        return NODE.isInlineAndOpen(api.node);
      },
      get prev() {
        return api.sibling(api.index - 1);
      },
      get next() {
        return api.sibling(api.index + 1);
      },
      sibling(index: number) {
        const node = get.children(api.parent)[index];
        return node ? nodeHelpers(node) : undefined;
      },
      deepestOpenChild(pos: 'FIRST' | 'LAST') {
        return nodeHelpers(NODE.deepestOpenChild(pos, api.node));
      },
      get nearestNonLastAncestor() {
        const find = (api: T): T | undefined => {
          const parent = api.parent;
          return !parent || !parent.isLast ? parent : find(parent);
        };
        return find(api);
      },
    };

    return api;
  };

  const get = {
    query,
    get root() {
      return tree.state as N;
    },
    get nav() {
      return get.root.props?.treeview?.nav || {};
    },
    get selected() {
      return nodeHelpers(get.nav.selected);
    },
    get current() {
      return nodeHelpers(get.nav.current);
    },
    node(id?: t.NodeIdentifier) {
      return id ? (query.findById(id) as N) : get.root;
    },
    find(id?: t.NodeIdentifier) {
      return nodeHelpers(id);
    },
    children(parent?: t.NodeIdentifier) {
      if (typeof parent === 'object') {
        const node = parent as t.ITreeNode;
        return node.children || [];
      } else {
        return get.node(parent)?.children || [];
      }
    },
  };
  return get;
}
