import { t } from '../../common';
import { TreeNodeIdentity } from '../../TreeNodeIdentity';
import { TreeUtil } from '../../TreeUtil';

type N = t.ITreeNode;
const id = TreeNodeIdentity;

export const helpers = {
  id,

  /**
   * Determine if the given input is a [TreeState] instance.
   */
  isInstance(input: any): boolean {
    return input === null || typeof input !== 'object' ? false : input._kind === 'TreeState';
  },

  /**
   * Props helper.
   */
  props<P>(of: N, fn?: (props: P) => void): P {
    of.props = of.props || {};
    if (typeof fn === 'function') {
      fn(of.props as P);
    }
    return of.props as P;
  },

  /**
   * Children helper.
   */
  children<T extends N>(of: T, fn?: (children: T[]) => void): T[] {
    const children = (of.children = of.children || []) as T[];
    if (typeof fn === 'function') {
      fn(children);
    }
    return of.children as T[];
  },

  /**
   * Ensures all nodes within the given tree are prefixed with
   * the specified namespace.
   */
  ensureNamespace(root: N, namespace: string) {
    TreeUtil.query<N>(root).walkDown((e) => {
      if (!id.hasNamespace(e.node.id)) {
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
  },
};
