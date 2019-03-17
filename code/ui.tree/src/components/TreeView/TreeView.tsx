import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import * as React from 'react';

import {
  css,
  GlamorValue,
  ITreeNode,
  R,
  tree as treeUtil,
  TreeNodeMouseEvent,
  TreeNodeMouseEventHandler,
  t,
  value as valueUtil,
} from '../../common';
import * as themes from '../../themes';
import { IStackPanel, StackPanel, StackPanelSlideEvent } from '../primitives';
import { TreeHeader } from '../TreeHeader';
import { TreeNodeList } from '../TreeNodeList';

export { TreeNodeMouseEvent, TreeNodeMouseEventHandler };
export type ITreeViewProps = {
  node?: ITreeNode;
  defaultNodeProps?: t.ITreeNodeProps | t.GetTreeNodeProps;
  current?: ITreeNode['id'];
  renderPanel?: t.RenderTreePanel;
  renderIcon?: t.RenderTreeIcon;
  theme?: themes.ITreeTheme | themes.TreeTheme;
  background?: 'THEME' | 'NONE';
  style?: GlamorValue;
  onNodeMouse?: TreeNodeMouseEventHandler;
};

export type ITreeViewState = {
  currentPath?: ITreeNode[];
  renderedPath?: ITreeNode[];
  index?: number;
  isSliding?: boolean;
};

const HEADER_HEIGHT = 36;

export class TreeView extends React.PureComponent<ITreeViewProps, ITreeViewState> {
  /**
   * Utilities for working with the tree.
   */
  public static util = treeUtil;

  public state: ITreeViewState = {};
  private unmounted$ = new Subject();
  private _events$ = new Subject<TreeNodeMouseEvent<any>>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.unmounted$),
    share(),
  );

  public componentDidMount() {
    this.updatePath();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  public componentDidUpdate(prev: ITreeViewProps) {
    let updatePath = false;
    const isCurrentChanged = !R.equals(TreeView.current(prev), TreeView.current(this.props));
    if (isCurrentChanged) {
      updatePath = true;
    }
    if (!updatePath && !R.equals(this.props.node, prev.node)) {
      updatePath = true;
    }
    if (updatePath) {
      this.updatePath();
    }
  }

  private get theme() {
    return themes.themeOrDefault(this.props);
  }

  private get headerHeight() {
    return HEADER_HEIGHT;
  }

  public render() {
    const panels = this.panels;
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
        display: 'flex',
      }),
      stack: css({ flex: 1 }),
      panel: css({ flex: 1 }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <StackPanel
          style={styles.stack}
          panels={panels}
          index={this.state.index}
          onSlide={this.handleSlide}
        />
      </div>
    );
  }

  private get panels(): IStackPanel[] {
    const { renderedPath = [] } = this.state;
    const panels = renderedPath.map((node, i) => {
      let el: React.ReactNode | null | undefined;
      el = this.renderCustomPanel(node, i);
      el = el === undefined ? this.renderNodeList(node, i) : el;
      const panel: IStackPanel = { el };
      return panel;
    });
    return panels;
  }

  private renderCustomPanel(node: t.ITreeNode, depth: number) {
    const { renderPanel, background = 'THEME' } = this.props;
    if (!renderPanel) {
      return;
    }

    const props = node.props || {};
    const header = props.header || {};
    const isHeaderVisible = valueUtil.defaultValue(header.isVisible, true);

    const el = renderPanel({ node, depth, isInline: false });
    if (!el || !isHeaderVisible) {
      return el;
    }

    const theme = this.theme;
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        backgroundColor: background === 'THEME' && theme.bg,
      }),
      body: css({
        overflow: 'hidden',
        Absolute: [this.headerHeight, 0, 0, 0],
        display: 'flex',
      }),
    };
    return (
      <div {...styles.base}>
        {this.renderHeader(node, depth)}
        <div {...styles.body}>{el}</div>
      </div>
    );
  }

  private renderNodeList(node: t.ITreeNode, depth: number) {
    const theme = this.theme;
    const props = node.props || {};
    const header = props.header || {};
    const isHeaderVisible = valueUtil.defaultValue(header.isVisible, true);
    const elHeader = isHeaderVisible && this.renderHeader(node, depth);

    return (
      <TreeNodeList
        key={`list:${node.id}`}
        node={node}
        depth={depth}
        defaultNodeProps={this.props.defaultNodeProps}
        renderPanel={this.props.renderPanel}
        renderIcon={this.props.renderIcon}
        header={elHeader}
        paddingTop={isHeaderVisible ? this.headerHeight : 0}
        isBorderVisible={this.state.isSliding}
        theme={theme}
        background={this.props.background}
        onNodeMouse={this.handleNodeMouse}
      />
    );
  }

  private renderHeader(node: t.ITreeNode, depth: number) {
    const theme = this.theme;
    const props = node.props || {};
    const header = props.header || {};
    const title = props.title || props.label || node.id.toString();

    const showParentButton =
      header.parentButton === false ? false : header.parentButton === true ? true : depth > 0;

    return (
      <TreeHeader
        node={node}
        height={this.headerHeight}
        title={title}
        showParentButton={showParentButton}
        theme={theme}
        background={this.props.background}
        onMouseParent={this.handleNodeMouse}
      />
    );
  }

  private handleNodeMouse = (e: TreeNodeMouseEvent) => {
    const props = treeUtil.props(e);
    if (props.isEnabled === false) {
      switch (e.type) {
        case 'CLICK':
        case 'DOUBLE_CLICK':
        case 'DOWN':
        case 'UP':
          // NB: Do not bubble any click related event when the node is disabled.
          return;
      }
    }

    const { onNodeMouse } = this.props;
    if (onNodeMouse) {
      onNodeMouse(e);
    }
    this._events$.next(e);
  };

  private updatePath() {
    const { node } = this.props;
    const current = TreeView.current(this.props);
    const currentPath = treeUtil.pathList(node, current) || [];
    const renderedPath = [...(this.state.renderedPath || [])];
    currentPath.forEach((node, i) => {
      renderedPath[i] = node;
    });
    this.setState({
      index: currentPath.length - 1,
      currentPath,
      renderedPath,
    });
  }

  private static current(props: ITreeViewProps) {
    const { node } = props;
    const current = props.current || node;
    const result = typeof current === 'object' ? current : treeUtil.findById(node, current);
    return result || node;
  }

  private handleSlide = (e: StackPanelSlideEvent) => {
    const isSliding = e.stage === 'START';
    this.setState({ isSliding });
  };
}
