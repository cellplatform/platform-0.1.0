import { color, css, CssValue } from '@platform/css';
import { containsFocus, events } from '@platform/react';
import {
  IStackPanel,
  StackPanel,
  StackPanelSlideEvent,
} from '@platform/ui.panel/lib/components/StackPanel';
import { defaultValue, rx, time } from '@platform/util.value';
import { equals } from 'ramda';
import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { constants, t } from '../../common';
import * as themes from '../../themes';
import { TreeEvents } from '../../TreeEvents';
import { TreeUtil } from '../../TreeUtil';
import { TreeViewState } from '../../TreeviewState';
import { TreeHeader } from '../TreeHeader';
import { TreeNodeList } from '../TreeNodeList';
import { renderer } from './renderer';

const R = { equals };
type N = t.ITreeviewNode;

export type ITreeviewProps = {
  id?: string;
  root?: N;
  current?: N['id'] | null;
  defaultNodeProps?: t.ITreeviewNodeProps | t.GetTreeviewNodeProps;
  renderIcon?: t.RenderTreeIcon;
  renderNodeBody?: t.RenderTreeNodeBody;
  renderPanel?: t.RenderTreePanel;
  renderHeader?: t.RenderTreeHeader;
  theme?: themes.ITreeTheme | themes.TreeTheme;
  background?: 'THEME' | 'NONE';
  event$?: Subject<t.TreeviewEvent>;
  keyPress$?: Observable<t.IKeypressEvent>;
  tabIndex?: number;
  slideDuration?: number;
  focusOnLoad?: boolean;
  tag?: string; // Component instance identifier.
  style?: CssValue;
};

export type ITreeviewState = {
  currentPath?: N[];
  renderedPath?: N[];
  index?: number;
  isSliding?: boolean;
  isFocused?: boolean;
};

const DEFAULT = {
  HEADER_HEIGHT: 36,
};

export class Treeview extends React.PureComponent<ITreeviewProps, ITreeviewState> {
  /**
   * [Static]
   */
  public static util = TreeUtil;
  public static query = TreeUtil.query;
  public static Identity = TreeViewState.identity;
  public static State = TreeViewState;

  public static events<T extends N = N>(
    event$: Observable<t.TreeviewEvent>,
    dispose$?: Observable<any>,
  ) {
    return TreeEvents.create<T>(event$, dispose$);
  }

  private static current(props: ITreeviewProps) {
    const { root } = props;
    if (props.current === null) {
      return undefined;
    }
    const current = props.current || root;
    const result = typeof current === 'object' ? current : TreeUtil.query(root).findById(current);
    return result || root;
  }

  /**
   * [Fields]
   */

  public state: ITreeviewState = {};
  private state$ = new Subject<Partial<ITreeviewState>>();
  public readonly unmounted$ = new Subject<void>();
  private readonly focus$ = new Subject<boolean>();

  private readonly event$ = new Subject<t.TreeviewEvent>();

  private el!: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    // Setup observables.
    const event$ = this.event$.pipe(takeUntil(this.unmounted$));
    const focus$ = this.focus$.pipe(takeUntil(this.unmounted$));
    const keyPress$ = (this.props.keyPress$ || events.keyPress$).pipe(takeUntil(this.unmounted$));
    const mouse$ = rx.payload<t.ITreeviewMouseEvent>(event$, 'TREEVIEW/mouse');

    // Bubble events through given event-bus.
    if (this.props.event$) {
      event$.subscribe((e) => this.props.event$?.next(e));
    }

    /**
     * Event: Keyboard.
     */
    keyPress$
      .pipe(
        filter(() => this.isFocused),
        filter((e) => !e.event.defaultPrevented),
      )
      .subscribe((keypress) => {
        const { root } = this.props;
        const current = this.props.current || undefined;
        const tag = this.tag;

        const payload: t.ITreeviewKeyboard = {
          root,
          current,
          keypress,
          tag,
          isHandled: false,
          handled: () => (payload.isHandled = true),
        };

        this.fire({ type: 'TREEVIEW/keyboard', payload });
      });

    /**
     * Event: Focus.
     */
    focus$
      .pipe(
        filter((e) => this.isFocusable),
        debounceTime(0),
        distinctUntilChanged((prev, next) => prev === next),
      )
      .subscribe((e) => {
        const isFocused = containsFocus(this);
        const tag = this.tag;
        this.isFocused;
        this.state$.next({ isFocused });
        this.fire({ type: 'TREEVIEW/focus', payload: { isFocused, tag } });
      });

    mouse$ // NB: Ensure the <TreeView> is focused when any node is clicked.
      .pipe(
        filter((e) => !e.isHandled),
        filter((e) => this.isFocusable),
        filter((e) => e.type === 'DOWN'),
        delay(0),
      )
      .subscribe((e) => this.focus());

    // Finish up.
    this.updatePath();
    if (this.props.focusOnLoad) {
      time.delay(0, () => this.focus());
    }
  }

  public componentDidUpdate(prev: ITreeviewProps) {
    let updatePath = false;
    const isCurrentChanged = !R.equals(Treeview.current(prev), Treeview.current(this.props));
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

  public get tag() {
    return this.props.tag || '';
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

  private fire: t.FireEvent<t.TreeviewEvent> = (e) => this.event$.next(e);

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
    const isInline = false; // NB: does not make sense for a "header".
    const isFocused = this.isFocused;

    const props = this.renderer.beforeRender.header({ node, depth, isInline, isFocused });
    node = { ...node, props: { ...node.props, treeview: props } };

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
        isFocused={isFocused}
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

  private handleNodeMouse = (e: t.TreeNodeMouseEventHandlerArgs) => {
    const props = TreeUtil.props(e);

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

    const payload: t.ITreeviewMouse = {
      ...e,
      tag: this.tag,
      isHandled: false,
      handled: () => (payload.isHandled = true),
    };
    this.fire({ type: 'TREEVIEW/mouse', payload });
  };

  private updatePath() {
    const { root } = this.props;
    const current = Treeview.current(this.props);
    const currentPath = TreeUtil.pathList(root, current) || [];
    const renderedPath = [...(this.state.renderedPath || [])];
    currentPath.forEach((node, i) => {
      renderedPath[i] = node;
    });

    this.state$.next({
      index: currentPath.length - 1,
      currentPath,
      renderedPath,
    });
  }

  private handleSlide = (e: StackPanelSlideEvent) => {
    const isSliding = e.stage === 'START';
    this.state$.next({ isSliding });
  };

  private handleFocusChange = () => this.focus$.next(containsFocus(this));
}
