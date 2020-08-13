import { TreeQuery } from '@platform/state/lib/TreeQuery';
import { dispose } from '@platform/util.value';
import { Subject } from 'rxjs';

import { t } from '../common';
import { TreeEvents } from '../TreeEvents';
import { mutations } from './mutations';

export { dispose };

type N = t.ITreeviewNode;

/**
 * Wrangle input options for a strategy.
 */
export const options = () => {
  const treeview$ = new Subject<t.TreeviewEvent>();
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
  const query = TreeQuery.create<N>({ root: tree.root });

  const nodeHelpers = (input?: t.NodeIdentifier) => {
    const id = typeof input === 'string' ? input : input?.id || '';
    const cache: Record<string, any> = {};
    const api = {
      id,
      get node(): t.ITreeviewNode {
        return cache.node || (cache.node = query.findById(id));
      },
      get props() {
        return props(api.node);
      },
      get parent(): t.ITreeviewNode {
        return cache.parent || (cache.parent = query.parent(api.node));
      },
      get children(): t.ITreeviewNode[] {
        return get.children(api.node);
      },
      get index() {
        return get.children(api.parent).findIndex((child) => child.id === id);
      },
      get isFirst() {
        return api.index === 0;
      },
      get isLast() {
        return api.index === (get.children(api.parent) || []).length - 1;
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
    };
    return api;
  };

  const get = {
    query,
    get root() {
      return tree.root as N;
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
