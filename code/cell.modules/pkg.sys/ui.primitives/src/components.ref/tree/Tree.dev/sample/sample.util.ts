import { value } from '@platform/util.value';
import { t } from '../common';

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

export const createRoot = (total?: TotalChildren) => create('root', 'Root', total);
