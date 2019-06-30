import * as React from 'react';

import {
  color,
  css,
  defaultValue,
  GlamorValue,
  ITreeNode,
  t,
  TreeNodeMouseEventHandler,
} from '../../common';
import * as themes from '../../themes';
import { Icons } from '../Icons';
import { Spinner } from '../primitives';
import { ITreeNodeProps, TreeNode, TreeNodeTwisty } from '../TreeNode';

export type ITreeNodeListProps = {
  node: ITreeNode<any>;
  depth?: number;
  defaultNodeProps?: t.ITreeNodeProps | t.GetTreeNodeProps;
  renderPanel?: t.RenderTreePanel;
  renderIcon?: t.RenderTreeIcon;
  renderNodeBody?: t.RenderTreeNodeBody;
  header?: React.ReactNode;
  paddingTop?: number;
  isBorderVisible?: boolean;
  isScrollable?: boolean;
  isFocused: boolean;
  isInline?: boolean;
  theme?: themes.ITreeTheme;
  background?: 'THEME' | 'NONE';
  style?: GlamorValue;
  onNodeMouse?: TreeNodeMouseEventHandler;
};

type IRenderNodeProps = {
  index: number;
  node: ITreeNode;
  twisty?: TreeNodeTwisty;
  iconRight?: ITreeNodeProps['iconRight'];
  isVisible: boolean;
  isFirst: boolean;
  isLast: boolean;
};

export class TreeNodeList extends React.PureComponent<ITreeNodeListProps> {
  /**
   * [Properties]
   */
  private get theme() {
    return themes.themeOrDefault(this.props);
  }

  private get nodeProps() {
    return this.props.node.props || {};
  }

  private get nodes() {
    const { node } = this.props;
    return (node.children || []) as ITreeNode[];
  }

  private get depth() {
    const depth = defaultValue(this.props.depth, -1);
    return depth;
  }

  /**
   * [Render]
   */
  public render() {
    const theme = this.theme;
    const { isBorderVisible = false, background = 'THEME' } = this.props;
    const { isSpinning } = this.nodeProps;
    const nodes = this.nodes;
    const paddingTop = defaultValue(this.props.paddingTop, 0);
    const isScrollable = defaultValue(this.props.isScrollable, true);

    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        backgroundColor: background === 'THEME' ? color.format(theme.bg) : undefined,
        overflow: 'hidden',
      }),
      list: css({
        Absolute: isScrollable ? 0 : undefined,
        Scroll: isScrollable,
        display: 'flex',
        flexDirection: 'column',
        opacity: isSpinning ? 0.3 : 1,
        paddingTop,
      }),
      spinner: css({
        Absolute: 0,
        Flex: 'start-center',
        paddingTop: paddingTop + 25,
      }),
      rightBorder: css({
        Absolute: [0, 0, 0, null],
        width: 1,
        backgroundColor: color.format(isBorderVisible ? theme.borderColor : 'transparent'),
      }),
    };

    const elSpinner = isSpinning && (
      <div {...styles.spinner}>
        <Spinner color={theme.spinner} size={18} />
      </div>
    );

    const nodeProps = this.nodes.map((v, i) => this.nodeRenderProps(i, nodes));
    const hasSomeInlineChildren = nodeProps.some(p => p.twisty !== undefined);
    const hasSomePanelChildren = nodeProps.some(p => p.iconRight !== undefined);
    const hasSomeIcons = nodeProps.map(p => p.node.props || {}).some(p => p.icon !== undefined);
    const elItems = nodes.map((v, i) => {
      const props = nodeProps[i];
      return this.renderNode({
        props,
        hasSomeInlineChildren,
        hasSomePanelChildren,
        hasSomeIcons,
      });
    });

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.list}>{elItems}</div>
        {elSpinner}
        {this.props.header}
        <div {...styles.rightBorder} />
      </div>
    );
  }

  private get defaultNodeProps(): t.GetTreeNodeProps {
    const { defaultNodeProps } = this.props;

    if (defaultNodeProps === undefined) {
      return args => ({});
    }

    return typeof defaultNodeProps === 'function' ? defaultNodeProps : args => defaultNodeProps;
  }

  /**
   * Calculate properties for rendering a single node.
   */
  private nodeRenderProps(index: number, siblings: ITreeNode[]): IRenderNodeProps {
    const node = siblings[index];
    if (!node) {
      throw new Error(`Index ${index} out of range [0..${siblings.length - 1}].`);
    }

    const isFirst = index === 0;
    const isLast = index >= siblings.length - 1;
    const totalChildren = node.children ? node.children.length : 0;
    const hasChildren = totalChildren > 0;

    // Prepare the node-props.
    let props: t.ITreeNodeProps = { ...node.props } || {};
    const defaultNodeProps = this.defaultNodeProps({
      index,
      node,
      siblings,
      parent: this.props.node,
      isFirst,
      isLast,
    });
    props = { ...defaultNodeProps, ...props };

    // Determine the icons to show.
    const iconRight = this.toRightIcon(props, node.children);
    let twisty: TreeNodeTwisty | undefined;
    if (
      props.inline &&
      (hasChildren || props.inline.isVisible) &&
      props.inline.isVisible !== false
    ) {
      twisty = props.inline.isOpen ? 'OPEN' : 'CLOSED';
    }

    // Finish up.
    const result: IRenderNodeProps = {
      index,
      node: { ...node, props },
      twisty,
      iconRight,
      isVisible: defaultValue(props.isVisible, true),
      isFirst,
      isLast,
    };

    return result;
  }

  private toRightIcon(props: t.ITreeNodeProps, children?: ITreeNode['children']) {
    const chrevron = props.chevron || {};
    const isVisible = chrevron.isVisible;
    const inlineChildren = Boolean(props.inline);

    if (inlineChildren && !isVisible) {
      return undefined;
    }

    const icon = Icons.ChevronRight;
    if (isVisible) {
      return icon;
    }
    if (isVisible === false) {
      return undefined;
    }

    const total = Array.isArray(children) ? children.length : 0;
    return total > 0 || isVisible ? icon : undefined;
  }

  private renderNode(args: {
    props: IRenderNodeProps;
    hasSomeInlineChildren: boolean;
    hasSomePanelChildren: boolean;
    hasSomeIcons: boolean;
  }) {
    const { props, hasSomeInlineChildren, hasSomePanelChildren } = args;
    const { isVisible, isFirst, isLast } = props;

    if (isVisible === false) {
      return null;
    }

    const asPlaceholder = (flag: boolean) => (flag ? null : undefined);

    const twisty: ITreeNodeProps['twisty'] =
      props.twisty !== undefined ? props.twisty : asPlaceholder(hasSomeInlineChildren);

    const iconRight: ITreeNodeProps['iconRight'] =
      props.iconRight !== undefined ? props.iconRight : asPlaceholder(hasSomePanelChildren);

    let node = props.node;
    const id = node.id;
    if (args.hasSomeIcons && (node.props || {}).icon === undefined) {
      node = { ...node, props: { ...node.props, icon: null } };
    }

    let el: React.ReactNode | undefined;
    if (props.twisty === 'OPEN') {
      const { renderPanel } = this.props;
      const depth = this.depth;
      el = renderPanel ? (el = renderPanel({ node, depth, isInline: true })) : el;
      el = el === undefined ? this.renderChildList(node) : el;
    }

    return (
      <TreeNode
        key={id}
        node={node}
        iconRight={iconRight}
        renderIcon={this.props.renderIcon}
        renderNodeBody={this.props.renderNodeBody}
        twisty={twisty}
        theme={this.theme}
        background={this.props.background}
        isFocused={this.props.isFocused}
        isInline={this.props.isInline}
        isFirst={isFirst}
        isLast={isLast}
        onMouse={this.props.onNodeMouse}
        children={el}
      />
    );
  }

  private renderChildList(node: t.ITreeNode) {
    const theme = this.theme;
    return (
      <TreeNodeList
        key={`children:${node.id}`}
        node={node}
        depth={this.depth + 1}
        defaultNodeProps={this.childNodeProps}
        renderPanel={this.props.renderPanel}
        renderIcon={this.props.renderIcon}
        theme={theme}
        background={this.props.background}
        isFocused={this.props.isFocused}
        isScrollable={false}
        isInline={true}
        onNodeMouse={this.props.onNodeMouse}
      />
    );
  }

  private childNodeProps = (e: t.GetTreeNodePropsArgs) => {
    let props = this.defaultNodeProps(e);
    const padding = props.padding;
    if (Array.isArray(padding)) {
      props = { ...props, padding: [padding[0], padding[1], padding[2], 0] };
    }
    if (e.isLast) {
      props = { ...props, colors: { ...props.colors, borderBottom: 0 } };
    }
    return props;
  };
}
