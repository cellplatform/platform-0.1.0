import { color, css, CssValue } from '@platform/css';
import { containsFocus } from '@platform/react';
import {
  IStackPanel,
  StackPanel,
  StackPanelSlideEvent,
} from '@platform/ui.panel/lib/components/StackPanel';
import { defaultValue } from '@platform/util.value';
import { equals } from 'ramda';
import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  share,
  takeUntil,
} from 'rxjs/operators';

import { constants, t } from '../../common';
import * as themes from '../../themes';
import { TreeEvents } from '../../TreeEvents';
import { TreeUtil } from '../../TreeUtil';
import { TreeViewNavigation } from '../../TreeViewNavigation';
import { TreeViewState } from '../../TreeViewState';
import { TreeHeader } from '../TreeHeader';
import { TreeNodeList } from '../TreeNodeList';
import { renderer } from './renderer';

const R = { equals };
type N = t.ITreeViewNode;

export type ITreeViewProps = {
  id?: string;
  root?: N;
  current?: N['id'];
  defaultNodeProps?: t.ITreeViewNodeProps | t.GetTreeNodeProps;
  renderIcon?: t.RenderTreeIcon;
  renderNodeBody?: t.RenderTreeNodeBody;
  renderPanel?: t.RenderTreePanel;
  renderHeader?: t.RenderTreeHeader;
  theme?: themes.ITreeTheme | themes.TreeTheme;
  background?: 'THEME' | 'NONE';
  event$?: Subject<t.TreeViewEvent>;
  mouse$?: Subject<t.ITreeViewMouse>;
  tabIndex?: number;
  slideDuration?: number;
  style?: CssValue;
};

export type ITreeViewState = {
  currentPath?: N[];
  renderedPath?: N[];
  index?: number;
  isSliding?: boolean;
  isFocused?: boolean;
};

const DEFAULT = {
  HEADER_HEIGHT: 36,
};

export class TreeView extends React.PureComponent<ITreeViewProps, ITreeViewState> {
  /**
   * [Static]
   */
  public static util = TreeUtil;
  public static query = TreeUtil.query;
  public static identity = TreeViewState.identity;
  public static State = TreeViewState;
  public static Navigation = TreeViewNavigation;

  public static events<T extends N = N>(
    event$: Observable<t.TreeViewEvent>,
    dispose$?: Observable<any>,
  ) {
    return TreeEvents.create<T>(event$, dispose$);
  }

  private static current(props: ITreeViewProps) {
    const { root } = props;
    const current = props.current || root;
    const result = typeof current === 'object' ? current : TreeUtil.query(root).findById(current);
    return result || root;
  }

  /**
   * [Fields]
   */
  public state: ITreeViewState = {};
  private unmounted$ = new Subject<void>();
  private focus$ = new Subject<boolean>();

  private _event$ = new Subject<t.TreeViewEvent>();
  public readonly event$ = this._event$.pipe(takeUntil(this.unmounted$), share());
  public readonly mouse$ = this.event$.pipe(
    filter((e) => e.type === 'TREEVIEW/mouse'),
    map((e) => e.payload as t.ITreeViewMouse),
    share(),
  );

  private el!: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    // Setup observables.
    const focus$ = this.focus$.pipe(takeUntil(this.unmounted$));

    // Bubble events through given subject(s).
    if (this.props.event$) {
      this.event$.subscribe(this.props.event$);
    }
    if (this.props.mouse$) {
      this.mouse$.subscribe(this.props.mouse$);
    }

    /**
     * Focus.
     */
    focus$
      .pipe(
        filter((e) => this.isFocusable),
        debounceTime(0),
        distinctUntilChanged((prev, next) => prev === next),
      )
      .subscribe((e) => {
        const isFocused = containsFocus(this);
        this.setState({ isFocused });
        this.fire({ type: 'TREEVIEW/focus', payload: { isFocused } });
      });
    this.mouse$
      .pipe(
        filter((e) => this.isFocusable),
        filter((e) => e.type === 'DOWN'),
        delay(0), // NB: Ensure the tabstrip is focused when any tab is clicked.
      )
      .subscribe((e) => this.focus());

    // Finish up.
    this.updatePath();
  }

  public componentDidUpdate(prev: ITreeViewProps) {
    let updatePath = false;
    const isCurrentChanged = !R.equals(TreeView.current(prev), TreeView.current(this.props));
    if (isCurrentChanged) {
      updatePath = true;
    }
    if (!updatePath && !R.equals(this.props.root, prev.root)) {
      updatePath = true;
    }
    if (updatePath) {
      this.updatePath();
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  private get theme() {
    return themes.themeOrDefault(this.props);
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

  public get tabIndex() {
    return this.props.tabIndex;
  }

  public get isFocusable() {
    return typeof this.tabIndex === 'number';
  }

  public get isFocused() {
    return Boolean(this.state.isFocused);
  }

  private get renderer() {
    const fire = this.fire;
    const { renderIcon, renderNodeBody, renderPanel, renderHeader } = this.props;
    return renderer({ fire, renderIcon, renderNodeBody, renderPanel, renderHeader });
  }

  /**
   * [Methods]
   */
  public focus(isFocused?: boolean) {
    if (defaultValue(isFocused, true)) {
      if (this.el) {
        this.el.focus();
      }
    } else {
      this.blur();
    }
    return this;
  }

  public blur() {
    if (this.el) {
      this.el.blur();
    }
    return this;
  }

  private fire: t.FireEvent<t.TreeViewEvent> = (e) => this._event$.next(e);

  /**
   * [Render]
   */

  public render() {
    const { index } = this.state;
    if (index === undefined) {
      // Index not calculated yet...wait until we have
      // a position in the stack before rendering anything.
      return null;
    }

    const panels = this.panels;
    const styles = {
      base: css({
        flex: 1,
        display: 'flex',
        position: 'relative',
        outline: 'none',
      }),
      stack: css({ flex: 1 }),
      panel: css({ flex: 1 }),
    };

    return (
      <div
        className={constants.CLASS.TREE.ROOT}
        ref={this.elRef}
        {...css(styles.base, this.props.style)}
        onFocus={this.handleFocusChange}
        onBlur={this.handleFocusChange}
        tabIndex={this.props.tabIndex}
      >
        <StackPanel
          style={styles.stack}
          panels={panels}
          index={index}
          onSlide={this.handleSlide}
          duration={this.props.slideDuration}
        />
      </div>
    );
  }

  private renderCustomPanel(node: N, depth: number) {
    const { renderPanel, background = 'THEME' } = this.props;
    if (!renderPanel) {
      return;
    }

    const header = node.props?.treeview?.header || {};
    const isHeaderVisible = defaultValue(header.isVisible, true);
    const elCustomHeader = isHeaderVisible ? this.renderCustomHeader(node, depth) : undefined;
    const headerHeight = this.headerHeight(node, elCustomHeader);
    const isFocused = this.isFocused;

    const el = renderPanel({ node, depth, isInline: false, isFocused });
    if (!el || !isHeaderVisible) {
      return el;
    }

    const theme = this.theme;
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        backgroundColor: background === 'THEME' ? color.format(theme.bg) : undefined,
      }),
      body: css({
        overflow: 'hidden',
        Absolute: [headerHeight, 0, 0, 0],
        display: 'flex',
      }),
    };
    return (
      <div {...styles.base}>
        {isHeaderVisible && this.renderHeader(node, depth, elCustomHeader)}
        <div {...styles.body}>{el}</div>
      </div>
    );
  }

  private renderCustomHeader(node: N, depth: number) {
    const renderer = this.renderer;
    const isFocused = this.isFocused;
    return renderer.header({ node, depth, isFocused });
  }

  private renderNodeList(node: N, depth: number) {
    const theme = this.theme;
    const renderer = this.renderer;

    const header = node.props?.treeview?.header || {};
    let isHeaderVisible = defaultValue(header.isVisible, true);
    const elCustomHeader = isHeaderVisible ? this.renderCustomHeader(node, depth) : undefined;
    const headerHeight = this.headerHeight(node, elCustomHeader);
    isHeaderVisible = headerHeight === 0 ? false : isHeaderVisible;
    const elHeader = isHeaderVisible && this.renderHeader(node, depth, elCustomHeader);

    const paddingTop = (isHeaderVisible ? headerHeight : 0) + (header.marginBottom || 0);

    return (
      <TreeNodeList
        rootId={this.props.id}
        key={`list:${node.id}`}
        node={node}
        depth={depth}
        defaultNodeProps={this.props.defaultNodeProps}
        renderer={renderer}
        header={elHeader}
        paddingTop={paddingTop}
        isBorderVisible={this.state.isSliding}
        isScrollable={true}
        isFocused={this.isFocused}
        theme={theme}
        background={this.props.background}
        onNodeMouse={this.handleNodeMouse}
      />
    );
  }

  private renderHeader = (node: N, depth: number, custom?: React.ReactNode | null) => {
    const theme = this.theme;
    const props = node.props?.treeview || {};
    const header = props.header || {};
    const title = props.title || props.label || node.id.toString();
    const height = this.headerHeight(node);

    const showParentButton =
      header.showParentButton === false
        ? false
        : header.showParentButton === true
        ? true
        : depth > 0;

    return (
      <TreeHeader
        custom={custom}
        node={node}
        renderer={this.renderer}
        depth={depth}
        height={height}
        title={title}
        showParentButton={showParentButton}
        theme={theme}
        background={this.props.background}
        isFocused={this.isFocused}
        onMouseParent={this.handleNodeMouse}
      />
    );
  };

  /**
   * [Handlers]
   */

  private headerHeight(node: N, customHeader?: React.ReactNode | null) {
    if (customHeader === null) {
      return 0;
    } else {
      const header = node.props?.treeview?.header || {};
      return defaultValue(header.height, DEFAULT.HEADER_HEIGHT);
    }
  }

  private handleNodeMouse = (payload: t.ITreeViewMouse) => {
    const props = TreeUtil.props(payload);
    if (props.isEnabled === false) {
      switch (payload.type) {
        case 'CLICK':
        case 'DOUBLE_CLICK':
        case 'DOWN':
        case 'UP':
          // NB: Do not bubble any click related event when the node is disabled.
          return;
      }
    }
    this.fire({ type: 'TREEVIEW/mouse', payload });
  };

  private updatePath() {
    const { root } = this.props;
    const current = TreeView.current(this.props);
    const currentPath = TreeUtil.pathList(root, current) || [];
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

  private handleSlide = (e: StackPanelSlideEvent) => {
    const isSliding = e.stage === 'START';
    this.setState({ isSliding });
  };

  private handleFocusChange = () => this.focus$.next(containsFocus(this));
}
