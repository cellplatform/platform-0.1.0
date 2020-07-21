import * as t from '../types';
import { value as valueUtil, defaultValue } from '@platform/util.value';
import { TreeEvents } from '../TreeEvents';
import { TreeQuery } from '../TreeQuery';

import { clone } from 'ramda';
const R = { clone };

/**
 * Helpers for traversing and operating on the tree data-structure.
 */
export class TreeUtil {
  public static events = TreeEvents;

  /**
   * Retrieves the children of a node (or an empty array).
   */
  public static children<T extends t.ITreeViewNode>(node?: T) {
    return node ? node.children || [] : [];
  }

  /**
   * Retrieves the child node at the given index.
   */
  public static childAt<T extends t.ITreeViewNode>(index: number, parent?: T) {
    return TreeUtil.children<T>(parent)[index];
  }

  /**
   * Determines whether the given node exists within the parent.
   */
  public static hasChild(
    parent: t.ITreeViewNode | undefined,
    child: t.ITreeViewNode | t.ITreeViewNode['id'] | undefined,
  ) {
    const nodes = TreeUtil.children(parent);
    const id = toId(child);
    return nodes.some((n) => n.id === id);
  }

  /**
   * Walks a tree (top down).
   */
  public static walkDown<T extends t.ITreeViewNode>(
    node: T | undefined,
    fn: (args: t.ITreeDescend<T>) => any,
  ) {
    if (node) {
      TreeQuery.create<T>(node).walkDown(fn);
    }
  }

  /**
   * Walks the tree from the given node up to the root.
   */
  public static walkUp<T extends t.ITreeViewNode>(
    root: T | undefined,
    startAt: T | T['id'] | undefined,
    fn: (args: t.ITreeAscend<T>) => any,
  ) {
    if (root) {
      TreeQuery.create<T>(root).walkUp(startAt, fn);
    }
  }

  /**
   * Walks down the tree looking for the first match (top-down).
   */
  public static find<T extends t.ITreeViewNode>(
    root: T | undefined,
    match: (args: t.ITreeDescend<T>) => boolean,
  ): T | undefined {
    if (!root) {
      return;
    }
    let result: T | undefined;
    TreeUtil.walkDown(root, (e) => {
      if (match(e) === true) {
        result = e.node;
        e.stop();
      }
    });
    return result ? { ...result } : undefined;
  }

  /**
   * Walks the down the tree looking for the given node (top-down).
   */
  public static findById<T extends t.ITreeViewNode>(
    root: T | undefined,
    id: t.NodeIdentifier<T> | undefined,
    options: { throw?: boolean } = {},
  ): T | undefined {
    if (!id || !root) {
      return undefined;
    }
    const res = TreeQuery.create<T>(root).findById(id);
    if (!res && options.throw) {
      throw new Error(`Failed to find tree-view node with the id '${id}'.`);
    } else {
      return res;
    }
  }

  /**
   * Walks the up tree looking for the first match (bottom-up).
   */
  public static ancestor<T extends t.ITreeViewNode>(
    root: T | undefined,
    node: T | string | undefined,
    match: (args: t.ITreeAscend<T>) => boolean,
  ): T | undefined {
    return root ? TreeQuery.create<T>(root).ancestor(node, match) : undefined;
  }

  /**
   * Maps over each node in a tree.
   */
  public static map<T extends t.ITreeViewNode, R>(
    node: T | undefined,
    fn: (args: t.ITreeDescend<T>) => R,
  ) {
    let result: R[] = [];
    TreeUtil.walkDown<T>(node, (e) => (result = [...result, fn(e) as R]));
    return result;
  }

  /**
   * Retrieves the depth (index) of the given node.
   */
  public static depth(
    root: t.ITreeViewNode | undefined,
    node: t.ITreeViewNode | t.ITreeViewNode['id'] | undefined,
  ) {
    let depth = -1;
    if (!node || !root) {
      return depth;
    }
    const id = toId(node);
    TreeUtil.walkDown(root, (e) => {
      if (e.node.id === id) {
        depth = e.depth;
        e.stop();
      }
    });
    return depth;
  }

  /**
   * Retrieves the parent of a node within the tree.
   */
  public static parent<T extends t.ITreeViewNode>(
    root: T | undefined,
    node: T | T['id'] | undefined,
    options: { inline?: boolean } = {},
  ): T | undefined {
    return root && node ? TreeQuery.create(root).parent(node, options) : undefined;
  }

  /**
   * Retrieves the descendent hierarchy to a given node.
   */
  public static pathList<T extends t.ITreeViewNode>(
    root: T | undefined,
    node: T | T['id'] | undefined,
  ) {
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
        const next = TreeUtil.parent(root, node);
        if (next) {
          add(next); // <== RECURSION
        }
      }
    };

    add(TreeUtil.findById(root, node));
    return items.reverse();
  }

  /**
   * Replaces the given node in the tree.
   */
  public static replace<T extends t.ITreeViewNode>(
    root: T | undefined,
    node: t.ITreeViewNode | T['id'] | undefined,
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
      target = TreeUtil.findById<T>(root, id);
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
    TreeUtil.walkDown<T>(root, (e) => {
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
  public static replaceChild<T extends t.ITreeViewNode>(
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
  public static buildPath<T extends t.ITreeViewNode = t.ITreeViewNode>(
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
      const existing = TreeUtil.findById(root, id);

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
  public static pathBuilder<T extends t.ITreeViewNode = t.ITreeViewNode>(
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
  public static setProps<T extends t.ITreeViewNode>(
    root: T | undefined,
    id: T | T['id'],
    props?: Partial<t.ITreeNodeProps>,
  ): T | undefined {
    if (!props || !root) {
      return root;
    }
    let node = typeof id === 'object' ? id : TreeUtil.findById(root, id);
    if (!node) {
      throw new Error(`A tree-node with the id '${id}' was not found.`);
    }
    node = { ...node, props: { ...node.props, ...props } };
    return TreeUtil.replace<T>(root, node);
  }

  /**
   * Retrieves the props for the given node.
   */
  public static props<T extends t.ITreeViewNode>(node?: T) {
    return node ? node.props || {} : {};
  }

  /**
   * Toggles the the open state of the given node.
   */
  public static toggleIsOpen<T extends t.ITreeViewNode>(
    root: T | undefined,
    node: t.ITreeViewNode | string | undefined,
  ): T | undefined {
    node = typeof node === 'string' ? TreeUtil.findById(root, node) : node;

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
  public static openToNode<T extends t.ITreeViewNode>(
    root: T | undefined,
    id: t.ITreeViewNode | t.ITreeViewNode['id'] | undefined,
  ): T | undefined {
    if (!root || !id) {
      return root;
    }
    const node = typeof id === 'string' ? TreeUtil.findById(root, id) : id;
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
  public static isOpen(node?: t.ITreeViewNode) {
    const inline = TreeUtil.props(node).inline;
    return inline ? inline.isOpen : undefined;
  }

  /**
   * Determined if the given node is enabled.
   */
  public static isEnabled(node?: t.ITreeViewNode) {
    return defaultValue(TreeUtil.props(node).isEnabled, true);
  }

  /**
   * Determines if the given node is selected.
   */
  public static isSelected(node?: t.ITreeViewNode) {
    return defaultValue(TreeUtil.props(node).isSelected, false);
  }
}

/**
 * [Helpers]
 */
const toId = (node: t.ITreeViewNode | t.ITreeViewNode['id'] | undefined) =>
  typeof node === 'object' ? node.id : node;
