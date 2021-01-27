import { t, toNodeId } from '../common';
import { TreeQuery } from '../TreeQuery';

type N = t.ITreeNode;

/**
 * Creates a [TreeStatePath]
 */
export function create<T extends N, A extends string>(
  tree: t.ITreeState<T, A>,
): t.ITreeStatePath<T, A> {
  type S = t.ITreeState<T, A>;

  const get = (tree: S, parts: string[]): S | undefined => {
    if (parts.length === 0) {
      return undefined;
    }

    const child = tree.children.find((child) => child.id === parts[0]);
    if (child && parts.length > 1) {
      return get(child, parts.slice(1));
    }

    return child && parts.length > 1
      ? get(child, parts.slice(1)) // <== RECURSION 🌳
      : child;
  };

  return {
    /**
     * Build a path from the root of the tree to the given child.
     */
    from(child: t.NodeIdentifier) {
      const target = toNodeId(child);
      if (target === tree.id) {
        return tree.id;
      }

      const parts: string[] = [];
      const match = tree.find((e) => e.id === target);

      if (match) {
        // NB: Construct the query without a namespace filter
        //     so all namespaces can be evaluated.
        const query = TreeQuery.create({ root: tree.state });
        query.walkUp(match.id, (e) => {
          parts.unshift(e.id);
          if (e.id === tree.id) {
            e.stop();
          }
        });
      }

      return parts.join('/');
    },

    get(path: string) {
      const parts = path.split('/').map((part) => part.trim());
      return parts.length === 1 && parts[0] === tree.id ? tree : get(tree, parts.slice(1));
    },
  };
}
