import { value } from '@platform/util.value';
import { t, Tree } from '../common';

export type TotalChildren = number | number[];

/**
 * Create a tree-node with children.
 */
export const create = (id: string, label: string, total?: TotalChildren): t.ITreeviewNode => {
  const children = total ? createMany(total, id) : undefined;
  const tree: t.ITreeviewNode = {
    id,
    props: { treeview: { label, icon: 'Face' } },
    children,
  };
  tree.children = tree.children && tree.children.length === 0 ? undefined : tree.children;
  return value.deleteUndefined(tree);
};

/**
 * Create multiple tree nodes.
 */
export const createMany = (total: TotalChildren, baseId?: string | number): t.ITreeviewNode[] => {
  const children = Array.isArray(total) ? total : [total];
  const length = children[0];
  return Array.from({ length }).map((v, i) => {
    baseId = baseId || 'root';
    const id = `${baseId}.${i + 1}`;
    const label = `Item - ${id}`;
    return create(id, label, children.slice(1));
  });
};

/**
 * Create a simple root node with some children.
 */
export const createRoot = (total?: TotalChildren) => create('root', 'Root', total);

/**
 * Walk deeply down a tree explicitly assigning a label to nodes that
 * do not already have one.
 */
export function assignLabelDeep(node: t.ITreeviewNode) {
  const util = Tree.Util;
  util.query(node).walkDown((e) => {
    util.props(e.node, (props) => {
      props.label = props.label || e.id;
    });
  });
}
