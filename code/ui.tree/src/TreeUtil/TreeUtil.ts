import { TreeQuery } from '@platform/state/lib/TreeQuery';
import { defaultValue, value as valueUtil } from '@platform/util.value';
import { clone } from 'ramda';

import * as t from '../common/types';
import { TreeEvents } from '../TreeEvents';

const R = { clone };

type N = t.ITreeViewNode;

/**
 * Helpers for traversing and operating on the tree data-structure.
 */
export class TreeUtil {
  public static events = TreeEvents;

  public static query<T extends N = N>(args?: T | t.ITreeQueryArgs<T>) {
    args = args === undefined ? ({ id: '' } as T) : args;
    return TreeQuery.create<T>(args);
  }

  /**
   * Retrieves the children of a node (or an empty array).
   */
  public static children<T extends N>(
    of?: T,
    fn?: t.TreeChildrenVisitor<T> | t.TreeChildrenOptions,
    options: t.TreeChildrenOptions = {},
  ) {
    return TreeQuery.children<T>(of, fn, options);
  }

  /**
   * Retrieves the child node at the given index.
   */
  public static childAt<T extends N>(index: number, parent?: T) {
    return TreeQuery.childAt(index, parent);
  }

  /**
   * Determines whether the given node exists within the parent.
   */
  public static hasChild(parent: N | undefined, child: N | N['id'] | undefined) {
    return TreeQuery.hasChild(parent, child);
  }

  /**
   * Maps over each node in a tree.
   */
  public static map<T extends N, R>(node: T | undefined, fn: (args: t.ITreeDescend<T>) => R) {
    let result: R[] = [];
    TreeUtil.query<T>(node).walkDown((e) => (result = [...result, fn(e) as R]));
    return result;
  }

  /**
   * Retrieves the descendent hierarchy to a given node.
   */
  public static pathList<T extends N>(root: T | undefined, node: T | T['id'] | undefined) {
    if (!node || !root) {
      return [];
    }

    let items: T[] = [];
    const add = (node?: T) => {
      if (!node) {
        return;
      }
      items = [...items, node];
      if (node.id !== root.id) {
        const next = TreeUtil.query(root).parent(node);
        if (next) {
          add(next); // <== RECURSION 🌳
        }
      }
    };

    add(TreeUtil.query<T>(root).findById(node));
    return items.reverse();
  }

  /**
   * Replaces the given node in the tree.
   */
  public static replace<T extends N>(
    root: T | undefined,
    node: N | T['id'] | undefined,
  ): T | undefined {
    if (!root) {
      return undefined;
    }

    let target = node as T | undefined;
    if (!target) {
      return undefined;
    }

    // Look up the node if an ID was passed.
    if (typeof node !== 'object') {
      const id = node;
      target = TreeUtil.query<T>(root).findById(id);
      if (!target) {
        throw new Error(`A tree-node with the id '${id}' was not found.`);
      }
    }

    // If the root was specified for replacement
    // return it without incuring the "walk".
    if (root.id === target.id) {
      return target;
    }

    // Walk the tree looking for the item to place.
    root = R.clone(root);
    TreeUtil.query<T>(root).walkDown((e) => {
      if (target && e.node.id === target.id) {
        if (e.parent && e.index > -1) {
          const items = [...TreeUtil.children(e.parent)];
          items[e.index] = { ...target };
          e.parent.children = items;
        }
        e.stop();
      }
    });

    // Finish up.
    return root;
  }

  /**
   * Replaces (or inserts) the given child of a node.
   */
  public static replaceChild<T extends N>(
    node: T | undefined,
    child: T | undefined,
    options: { insert?: 'FIRST' | 'LAST' } = {},
  ): T | undefined {
    if (!node || !child) {
      return undefined;
    }
    const { insert = 'LAST' } = options;
    let children = node.children ? [...node.children] : [];
    const index = children.findIndex((n) => n.id === child.id);
    if (index === -1) {
      if (insert === 'FIRST') {
        children = [{ ...child }, ...children];
      }
      if (insert === 'LAST') {
        children = [...children, { ...child }];
      }
    } else {
      children[index] = { ...child };
    }
    return { ...node, children };
  }

  /**
   * Adds a hierarchy of nodes to the tree based on the given path.
   */
  public static buildPath<T extends N = N>(
    root: T,
    factory: t.TreeNodePathFactory<T>,
    path: string,
    options: { force?: boolean; delimiter?: string } = {},
  ) {
    const { force, delimiter = '/' } = options;

    // Build the set of ids.
    let ids: string[] = [];
    path.split(delimiter).forEach((level, i) => {
      level = ids[i - 1] ? `${ids[i - 1]}${delimiter}${level}` : level;
      ids = [...ids, level];
    });
    ids = valueUtil.compact(ids);

    // Walk up the path adding each node.
    let current: T | undefined;
    let parent: T | undefined;
    for (const id of [...ids].reverse()) {
      // If there is an existing node, and this is not a `force` override,
      // use the existing node as the parent, otherwise create it now.
      const existing = TreeUtil.query(root).findById(id);

      let level = -1;
      const context: t.ITreeNodePathContext = {
        id,
        path,
        get level() {
          return level === -1 ? (level = id.split('/').length) : level;
        },
      };

      parent = !force && existing ? existing : factory(id, context);
      if (parent === undefined) {
        break;
      }

      // Construct the node and insert it into the tree.
      parent = current ? TreeUtil.replaceChild(parent, current) : parent;
      current = parent;
    }

    // Finish up.
    root = parent ? (TreeUtil.replaceChild(root, parent) as T) : root;
    return { ids, root };
  }

  /**
   * Creates a version of `buildPath` with the factory curried.
   */
  public static pathBuilder<T extends N = N>(
    root: T,
    factory: t.TreeNodePathFactory<T>,
    options: { delimiter?: string } = {},
  ) {
    const { delimiter } = options;
    const builder = {
      root,
      add(path: string, options: { force?: boolean } = {}) {
        const args = { ...options, delimiter };
        const res = TreeUtil.buildPath<T>(builder.root, factory, path, args);
        builder.root = res.root;
        return res;
      },
    };
    return builder;
  }

  /**
   * Updates a set of property values on the given node.
   */
  public static setProps<T extends N>(
    root: T | undefined,
    id: T | T['id'],
    props?: Partial<t.ITreeNodeProps>,
  ): T | undefined {
    if (!props || !root) {
      return root;
    }
    let node = typeof id === 'object' ? id : TreeUtil.query<T>(root).findById(id);
    if (!node) {
      throw new Error(`A tree-node with the id '${id}' was not found.`);
    }
    node = { ...node, props: { ...node.props, ...props } };
    return TreeUtil.replace<T>(root, node);
  }

  /**
   * Retrieves the props for the given node.
   */
  public static props<T extends N>(node?: T) {
    return node ? node.props || {} : {};
  }

  /**
   * Toggles the the open state of the given node.
   */
  public static toggleIsOpen<T extends N>(
    root: T | undefined,
    node: N | string | undefined,
  ): T | undefined {
    node = typeof node === 'string' ? TreeUtil.query<T>(root).findById(node) : node;

    if (!node || !root) {
      return root;
    }
    const props = node.props || {};
    let inline = props.inline;
    if (!inline) {
      return root;
    }
    inline = { ...inline, isOpen: !inline.isOpen };
    node = { ...node, props: { ...props, inline } };
    return TreeUtil.replace<T>(root, node);
  }

  /**
   * Ensures all inline nodes in the parent hierarchy leading to
   * the given node are in an "toggled-open" state.
   */
  public static openToNode<T extends N>(
    root: T | undefined,
    id: N | N['id'] | undefined,
  ): T | undefined {
    if (!root || !id) {
      return root;
    }
    const node = typeof id === 'string' ? TreeUtil.query<T>(root).findById(id) : id;
    TreeUtil.pathList(root, node).forEach((node) => {
      const p = TreeUtil.props(node);
      if (p.inline !== undefined) {
        p.inline = typeof p.inline === 'boolean' ? {} : p.inline;
        p.inline = { ...p.inline, isOpen: true };
      }
    });
    return root;
  }

  /**
   * Determines if the given node is open.
   */
  public static isOpen(node?: N) {
    const inline = TreeUtil.props(node).inline;
    return inline ? inline.isOpen : undefined;
  }

  /**
   * Determined if the given node is enabled.
   */
  public static isEnabled(node?: N) {
    return defaultValue(TreeUtil.props(node).isEnabled, true);
  }

  /**
   * Determines if the given node is selected.
   */
  public static isSelected(node?: N) {
    return defaultValue(TreeUtil.props(node).isSelected, false);
  }
}
