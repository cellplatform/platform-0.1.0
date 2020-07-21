import { t } from '../common';

type Node = t.ITreeNode;

/**
 * Interface for querying nodes within a tree.
 */
export class TreeQuery<T extends Node = Node> implements t.ITreeQuery<T> {
  /**
   * Static
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

  public static hasChild(parent?: Node, child?: t.NodeIdentifier) {
    const nodes = TreeQuery.children(parent);
    const id = toId(child);
    return nodes.some((node) => node.id === id);
    // return false;
  }

  /**
   * Lifecycle
   */
  public static create<T extends Node = Node>(root: T) {
    return new TreeQuery<T>(root) as t.ITreeQuery<T>;
  }
  private constructor(root: T) {
    this.root = root;
  }

  /**
   * [Fields]
   */
  public readonly root: T;

  /**
   * [Methods]
   */

  public walkDown: t.TreeWalkDown<T> = (visit) => {
    let stopped = false;
    const walk = (args: { node?: T; parent?: T; depth: number; index: number }) => {
      if (!args.node || stopped) {
        return;
      }
      let skipChildren = false;
      visit({
        node: args.node,
        parent: args.parent,
        index: args.index,
        depth: args.depth,
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
    const current = typeof startAt === 'string' ? this.findById(startAt) : startAt;
    if (current) {
      let stop = false;
      const parentNode = this.findParent(current);
      const args: t.ITreeAscend<T> = {
        node: current,
        parent: parentNode,
        get index() {
          const id = current ? current.id : '';
          return !parentNode ? -1 : (parentNode.children || []).findIndex((node) => node.id === id);
        },
        stop: () => (stop = true),
      };
      visit(args);
      if (!stop && parentNode) {
        this.walkUp(args.parent, visit); // <== RECURSION 🌳
      }
    }
  };

  /**
   * Walks down the tree looking for the first match (top-down).
   */
  public find: t.TreeFind<T> = (visit) => {
    let result: T | undefined;
    this.walkDown((e) => {
      if (visit(e) === true) {
        result = e.node;
        e.stop();
      }
    });
    return result ? { ...result } : undefined;
  };

  /**
   * Walks the down the tree looking for the given node (top-down).
   */
  public findById: t.TreeFindById<T> = (id) => {
    if (!id) {
      return undefined;
    } else {
    }
    const target = typeof id === 'string' ? id : id.id;
    const result = id ? this.find((e) => e.node.id === target) : undefined;
    return result;
  };

  /**
   * Looks for the parent of a node.
   */

  public findParent: t.TreeFindParent<T> = (node, options = {}) => {
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
    const target: t.ITreeViewNode = node;

    this.walkDown((e) => {
      if (TreeQuery.hasChild(e.node, target)) {
        const props = e.node.props || {};
        if (options.inline === false && props.inline) {
          // Not a match on the given "showChildren" filter.
          // Keep going...
          e.stop();
          result = this.findParent(e.node); // <== 🌳 RECURSION.
        } else {
          result = e.node;
          e.stop();
        }
      }
    });

    return result;
  };
}

/**
 * [Helpers]
 */

const toId = (node: t.NodeIdentifier | undefined) => (typeof node === 'object' ? node.id : node);
