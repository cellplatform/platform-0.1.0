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

  label(value: string | undefined): ViewBuilderTreeNode<P>;
  title(value: string | undefined): ViewBuilderTreeNode<P>;
  description(value: string | undefined): ViewBuilderTreeNode<P>;

  icon(value: t.TreeNodeIcon | undefined): ViewBuilderTreeNode<P>;

  isEnabled(value: boolean): ViewBuilderTreeNode<P>;
  isVisible(value: boolean): ViewBuilderTreeNode<P>;
  isBold(value: boolean): ViewBuilderTreeNode<P>;
  isSpinning(value: boolean): ViewBuilderTreeNode<P>;

  opacity(value: number | undefined): ViewBuilderTreeNode<P>;
  padding(value: number | PaddingValue | undefined): ViewBuilderTreeNode<P>;
  marginTop(value: number | undefined): ViewBuilderTreeNode<P>;
  marginBottom(value: number | undefined): ViewBuilderTreeNode<P>;

  chevron: ViewBuilderTreeNodeChevon<P>;
};

type PaddingValue = number | [number, number] | [number, number, number, number]; // NB: [vertical | horizontal] or [top, right, bottom left].

export type ViewBuilderTreeNodeChevon<P extends O> = {
  parent(): ViewBuilderTreeNode<P>;
  isVisible(value: boolean | undefined): ViewBuilderTreeNodeChevon<P>;
};
