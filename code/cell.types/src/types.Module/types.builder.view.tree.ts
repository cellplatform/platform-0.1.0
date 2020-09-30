import { t } from '../common';

type O = Record<string, unknown>;

export type ViewBuilderTree = {
  node: ViewBuilderTreeNodeFactory;
};

/**
 * FACTORY: TreeviewNode builder
 */
export type ViewBuilderTreeNodeFactory = <P extends O>(
  model: t.BuilderModel<any>,
  parent: t.BuilderChain<any>,
) => t.BuilderChain<ViewBuilderTreeNode<P>>;

/**
 * Builder API for a treeview node.
 * Generics:
 *    <P> Parent builder type
 */
export type ViewBuilderTreeNode<P extends O> = {
  parent(): P;
  label(value: string): ViewBuilderTreeNode<P>;
  icon(value: t.TreeNodeIcon): ViewBuilderTreeNode<P>;
  title(value: string): ViewBuilderTreeNode<P>;
  description(value: string): ViewBuilderTreeNode<P>;
  opacity(value: number): ViewBuilderTreeNode<P>;
};
