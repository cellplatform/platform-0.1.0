import { t, toNodeId } from '../common';
import { TreeQuery } from '../TreeQuery';

type O = Record<string, unknown>;
type N = t.ITreeNode;
type E = t.Event<O>;

/**
 * Creates a [TreeStatePath]
 */
export function create<T extends N, A extends E>(tree: t.ITreeState<T, A>): t.ITreeStatePath<T, A> {
  return {
    get(id: t.NodeIdentifier) {
      const target = toNodeId(id);
      if (target === tree.id) {
        return tree.id;
      }

      const parts: string[] = [];
      const match = tree.find((e) => e.id === target);

      if (match) {
        // NB: Construct the query without a namespace filter
        //     so all namespaces can be evaluated.
        const query = TreeQuery.create({ root: tree.root });
        query.walkUp(match.id, (e) => {
          parts.unshift(e.id);
          if (e.id === tree.id) {
            e.stop();
          }
        });
      }

      return parts.join('/');
    },
  };
}
