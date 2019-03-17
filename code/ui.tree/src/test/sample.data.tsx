import { Icons } from '../components/Icons';
import { IActionArgs, ITreeNode, types, value } from './libs';

export type TotalChildren = number | number[];

export const create = (id: string, label: string, total?: TotalChildren) => {
  const children = total ? createMany(total, id) : undefined;
  const tree: ITreeNode = {
    id,
    props: { label, icon: 'Face' },
    children,
  };
  tree.children =
    tree.children && tree.children.length === 0 ? undefined : tree.children;
  return value.deleteUndefined(tree);
};

export const createMany = (total: TotalChildren, baseId?: string | number) => {
  const children = Array.isArray(total) ? total : [total];
  const length = children[0];
  return Array.from({ length }).map((v, i) => {
    baseId = baseId || 'root';
    const id = `${baseId}.${i + 1}`;
    const label = `Item - ${id}`;
    return create(id, label, children.slice(1));
  });
};

export const createRoot = (totalChildren?: TotalChildren) =>
  create('root', 'Root', totalChildren);

export const renderIcon: types.RenderTreeIcon = args => {
  return Icons[args.icon];
};

export const nextNode = (
  e: IActionArgs,
  props: Partial<ITreeNode['props']>,
): { node: ITreeNode<any> } => {
  return {
    node: {
      ...e.prevProps.node,
      props: { ...e.prevProps.node.props, ...props },
    },
  };
};
