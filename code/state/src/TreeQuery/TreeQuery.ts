import { t, toNodeId } from '../common';

type Node = t.ITreeNode;

import { TreeIdentity } from '../TreeIdentity';
const Identity = TreeIdentity;

/**
 * Interface for querying nodes within a tree.
 */
export class TreeQuery<T extends Node = Node> implements t.ITreeQuery<T> {
  /**
   * Static
   */
  public static create<T extends Node = Node>(args: T | t.ITreeQueryArgs<T>) {
    const input = args as any;
    const isQueryArgs = typeof input.root === 'object';
    const root = (isQueryArgs ? input.root : args) as T;
    const namespace = isQueryArgs ? input.namespace || '' : '';
    return new TreeQuery<T>({ root, namespace }) as t.ITreeQuery<T>;
  }

  /**
   * Retrieves the set of children for the given node
   * creating the array if necessary.
   */
  public static children<T extends Node = Node>(
    of?: T,
    fn?: t.TreeChildrenVisitor<T> | t.TreeChildrenOptions,
    options: t.TreeChildrenOptions = {},
  ) {
    options = (typeof fn === 'object' ? fn : options) || {};
    const children = (!of ? [] : of.children || []) as T[];

    if (options.assign !== false && of && !of.children) {
      of.children = children;
    }

    if (typeof fn === 'function') {
      fn(children);
    }

    return children;
  }

  /**
   * Determine if the node has the specified child.
   */
  public static hasChild(parent?: Node, child?: t.NodeIdentifier) {
    const nodes = TreeQuery.children(parent);
    const id = toNodeId(child);
    return nodes.some((node) => node.id === id);
  }

  /**
   * Retrieves the child node at the given index.
   */
  public static childAt<T extends Node>(index: number, parent?: T) {
    return TreeQuery.children<T>(parent)[index];
  }

  /**
   * Lifecycle
   */
  private constructor(args: t.ITreeQueryArgs<T>) {
    this.root = args.root;
    this.namespace = (args.namespace || '').trim();
  }

  /**
   * [Fields]
   */
  public readonly root: T;
  public readonly namespace: string;

  /**
   * [Methods]
   */

  public walkDown: t.TreeWalkDown<T> = (visit) => {
    let stopped = false;
    const walk = (args: { node?: T; parent?: T; depth: number; index: number }) => {
      if (!args.node || stopped) {
        return;
      }
      const { id, namespace } = Identity.parse(args.node.id);
      if (this.namespace && namespace !== this.namespace) {
        return;
      }

      let skipChildren = false;
      visit({
        id,
        namespace,
        node: args.node,
        parent: args.parent,
        index: args.index,
        level: args.depth,
        stop: () => (stopped = true),
        skip: () => (skipChildren = true),
      });
      if (stopped) {
        return;
      }
      let index = -1;
      if (!skipChildren) {
        for (const child of TreeQuery.children<T>(args.node, undefined, { assign: false })) {
          index++;
          walk({
            node: child,
            parent: args.node,
            index,
            depth: args.depth + 1,
          }); // <== RECURSION 🌳
        }
      }
    };
    return walk({ node: this.root, depth: 0, index: -1 });
  };

  /**
   * Walks the tree from the given node up to the root.
   */
  public walkUp: t.TreeWalkUp<T> = (startAt, visit) => {
    let level = -1;
    const inner: t.TreeWalkUp<T> = (startAt, visit) => {
      const current = this.findById(toNodeId(startAt));
      level++;
      if (current) {
        let stop = false;
        const parentNode = this.parent(current);
        const { id, namespace } = Identity.parse(current.id);
        const args: t.ITreeAscend<T> = {
          id,
          namespace,
          node: current,
          parent: parentNode,
          get index() {
            const id = current ? current.id : '';
            return !parentNode
              ? -1
              : (parentNode.children || []).findIndex((node) => node.id === id);
          },
          level,
          stop: () => (stop = true),
        };
        visit(args);
        if (!stop && parentNode) {
          inner(args.parent, visit); // <== RECURSION 🌳
        }
      }
    };
    return inner(startAt, visit);
  };

  /**
   * Walks down the tree looking for the first match (top-down).
   */
  public find: t.TreeFind<T> = (match) => {
    let result: T | undefined;
    this.walkDown((e) => {
      if (match(e) === true) {
        result = e.node;
        e.stop();
      }
    });
    return result ? result : undefined;
  };

  /**
   * Walks the down the tree looking for the given node (top-down).
   */
  public findById: t.TreeFindById<T> = (id) => {
    if (!id) {
      return undefined;
    } else {
      const target = Identity.parse(typeof id === 'string' ? id : id.id);
      return this.find((e) => {
        if (!target.namespace && e.id === target.id) {
          return true;
        } else {
          return e.id === target.id && e.namespace === target.namespace;
        }
      });
    }
  };

  /**
   * Looks for the parent of a node.
   */
  public parent: t.TreeParent<T> = (node) => {
    if (!node) {
      return undefined;
    }

    // Look up the node if an ID was passed.
    if (typeof node !== 'object') {
      const id = node;
      node = this.findById(id);
      if (!node) {
        throw new Error(`Cannot find parent of '${id}' because that child node was not found.`);
      }
    }

    let result: T | undefined;
    const target: t.ITreeNode = node;

    this.walkDown((e) => {
      if (TreeQuery.hasChild(e.node, target)) {
        result = e.node;
        e.stop();
      }
    });

    return result;
  };

  /**
   * Walks the up tree looking for the first match (bottom-up).
   */
  public ancestor: t.TreeAncestor<T> = (node, match) => {
    let result: T | undefined;
    this.walkUp(node, (e) => {
      if (match(e)) {
        result = e.node;
        e.stop();
      }
    });
    return result;
  };

  /**
   * Retrieves the depth index of the given node (-1 if not found).
   */
  public depth: t.TreeDepth<T> = (node) => {
    let depth = -1;
    if (!node || !this.root) {
      return depth;
    } else {
      const id = toNodeId(node);
      this.walkDown((e) => {
        if (e.node.id === id) {
          depth = e.level;
          e.stop();
        }
      });
      return depth;
    }
  };

  /**
   * Determines if the given node exists within the tree.
   */
  public exists: t.TreeNodeExists<T> = (input) => {
    const node = typeof input === 'function' ? this.find(input) : this.findById(input);
    return Boolean(node);
  };
}
