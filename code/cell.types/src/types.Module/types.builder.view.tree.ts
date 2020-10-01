import { t } from '../common';

type O = Record<string, unknown>;
type CssEdgeArray = [number, number] | [number, number, number, number]; // NB: [vertical | horizontal] or [top, right, bottom left].

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
  padding(value: number | CssEdgeArray | undefined): ViewBuilderTreeNode<P>;
  marginTop(value: number | undefined): ViewBuilderTreeNode<P>;
  marginBottom(value: number | undefined): ViewBuilderTreeNode<P>;

  header: ViewBuilderTreeNodeHeader<P>;
  inline: ViewBuilderTreeNodeInline<P>;
  chevron: ViewBuilderTreeNodeChevon<P>;
};

export type ViewBuilderTreeNodeHeader<P extends O> = {
  parent(): ViewBuilderTreeNode<P>;
  isVisible(value: boolean | undefined): ViewBuilderTreeNodeHeader<P>;
  parentButton(value: boolean | undefined): ViewBuilderTreeNodeHeader<P>;
  marginBottom(value: number | undefined): ViewBuilderTreeNodeHeader<P>;
  height(value: number | undefined): ViewBuilderTreeNodeHeader<P>;
};

export type ViewBuilderTreeNodeInline<P extends O> = {
  parent(): ViewBuilderTreeNode<P>;
  isVisible(value: boolean | undefined): ViewBuilderTreeNodeInline<P>;
  isOpen(value: boolean | undefined): ViewBuilderTreeNodeInline<P>;
};

export type ViewBuilderTreeNodeChevon<P extends O> = {
  parent(): ViewBuilderTreeNode<P>;
  isVisible(value: boolean | undefined): ViewBuilderTreeNodeChevon<P>;
};
