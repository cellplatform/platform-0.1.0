import { color, css } from '@platform/css';
import { events } from '@platform/react';
import { rx, time } from '@platform/util.value';
import * as React from 'react';
import { Subject, merge } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';

import { t } from '../../common';
import { ITreeviewProps, Treeview } from '../Treeview';
import { toNodeId } from '@platform/state/lib/common';

export type ITreeviewColumnsProps = ITreeviewProps & {
  total?: number;
  dividerBorder?: string | number;
};
export type ITreeviewColumnsState = {
  offset?: number;
  selected?: string;
  path?: string[];
  focusedIndex?: number;
};

export class TreeviewColumns extends React.PureComponent<
  ITreeviewColumnsProps,
  ITreeviewColumnsState
> {
  public state: ITreeviewColumnsState = {};
  private state$ = new Subject<Partial<ITreeviewColumnsState>>();
  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeviewEvent>();
  private keyPress$ = this.props.keyPress$ || events.keyPress$;

  private elTrees: Treeview[] = [];
  private elTreeRef = (ref: Treeview) => {
    if (ref) {
      this.elTrees.push(ref);
      ref.unmounted$.subscribe(() => {
        const index = this.elTrees.findIndex((item) => item === ref);
        const refs = this.elTrees;
        this.elTrees = [...refs.slice(0, index), ...refs.slice(index + 1)];
      });
    }
  };

  /**
   * [Lifecycle]
   */

  constructor(props: ITreeviewColumnsProps) {
    super(props);
    const event = Treeview.events(this.treeview$, this.unmounted$);
    const keyPress$ = this.keyPress$.pipe(
      takeUntil(this.unmounted$),
      filter((e) => e.isPressed),
    );

    /**
     * BEFORE node render.
     */
    const before = event.beforeRender;
    before.node$.subscribe((e) => {
      const id = e.node.id;
      const path = this.path.slice(1);
      const selectedColumn = path.findIndex((part) => part === id);

      if (selectedColumn >= 0) {
        // Ensure the entire selection path is shown with background styles.
        e.change((props) => {
          const colors = props.colors || (props.colors = {});
          colors.bg = e.isFocused ? -0.05 : -0.03;
        });
      }

      const children = e.node.children || [];
      e.change((props) => {
        const chevron = props.chevron || (props.chevron = {});
        chevron.isVisible = false;
        if (children.length > 0) {
          props.badge = children.length;
        }
      });
    });

    /**
     * BEFORE header render.
     */
    before.header$.subscribe((e) => {
      const path = this.path.slice(this.offset);
      const isRoot = path[0] === e.node.id;
      if (!isRoot) {
        // Only show the BACK (parent) button in header when the view-port is offset.
        e.change((props) => {
          const header = props.header || (props.header = {});
          header.showParentButton = false;
        });
      }

      /**
       * TODO 🐷
       * - inline twisty
       * - reset state on prop-change
       */
    });

    /**
     * Keep track of which column is focused.
     */
    const focus$ = rx
      .payload<t.ITreeviewFocusEvent>(event.$, 'TREEVIEW/focus')
      .pipe(map(({ isFocused, tag }) => ({ isFocused, index: columnTag.fromString(tag) })));

    focus$
      .pipe(filter((e) => e.isFocused))
      .subscribe((e) => this.state$.next({ focusedIndex: e.index }));
    focus$
      .pipe(
        filter((e) => !e.isFocused),
        filter((e) => e.index === this.state.focusedIndex),
      )
      .subscribe((e) => this.state$.next({ focusedIndex: undefined }));

    /**
     * Intercept MOUSE/KEYBOARD events to handle column specific
     * interactions that relate to multi-column navigation
     * prior to any higher level strategies interpreting the event.
     *
     * IMPORTANT: Done here before bubbling events to get into the
     *            event stream early before anything else
     *            can register as a listener.
     */

    const click = event.mouse('LEFT').down;
    merge(click.drillIn$, click.parent$)
      .pipe(tap((e) => e.handled())) // SIDE-EFFECT: Stop higher-level mouse strategies from navigating.
      .subscribe();
    click.parent$.subscribe(() => this.selectPreviousColumn());
    click.drillIn$.subscribe(() => this.selectNextColumn());

    const horizontal$ = keyPress$.pipe(
      filter((e) => ['ArrowLeft', 'ArrowRight'].includes(e.key)),
      tap((e) => e.preventDefault()), // SIDE-EFFECT: Stop higher-level keyboard strategies from navigating.
    );
    horizontal$
      .pipe(filter((e) => e.key === 'ArrowLeft'))
      .subscribe(() => this.selectPreviousColumn());
    horizontal$
      .pipe(filter((e) => e.key === 'ArrowRight'))
      .subscribe(() => this.selectNextColumn());

    /**
     * Bubble events through given event-bus.
     *
     * IMPORTANT:
     *        This is done after all other handlers to ensure intercepts
     *        catch the event before high-level strategies.
     */
    if (this.props.event$) {
      event.$.subscribe((e) => this.props.event$?.next(e));
    }
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public static getDerivedStateFromProps(
    props: ITreeviewColumnsProps,
    state: ITreeviewColumnsState,
  ) {
    const root = props.root;
    const nav = root?.props?.treeview?.nav || {};
    const selected = nav.selected;

    if (selected !== state.selected) {
      const path = buildPath(root, selected);
      state = { ...state, selected, path };
    }

    return state;
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  public get total() {
    const total = this.props.total === undefined ? 2 : this.props.total;
    return Math.max(total, 0);
  }

  public get dividerBorder() {
    const { dividerBorder = -0.1 } = this.props;
    return typeof dividerBorder === 'string'
      ? dividerBorder
      : `solid 1px ${color.format(dividerBorder)}`;
  }

  public get nav() {
    return this.props.root?.props?.treeview?.nav || {};
  }

  public get query() {
    return Treeview.query(this.props.root);
  }

  public get path() {
    return this.state.path || [];
  }

  public get focusedIndex() {
    const index = this.state.focusedIndex;
    return index === undefined ? -1 : index;
  }

  private get offset() {
    return this.state.offset || 0;
  }

  /**
   * [Methods]
   */

  public focus(column = 0) {
    const ref = this.ref(column);
    if (ref) {
      ref.focus();
    }
  }

  private childrenOf(node?: t.NodeIdentifier) {
    return this.query.findById(node || undefined)?.children || [];
  }

  private selectChild(column: number, options: { focus?: boolean; index?: number } = {}) {
    const children = this.childrenOf(this.current(column) || undefined);
    if (children.length > 0) {
      const { index = 0 } = options;
      this.select(children[index]);
      if (options.focus) {
        this.focus(column);
      }
    }
  }

  private select(node?: t.NodeIdentifier) {
    const selected = Treeview.Identity.toNodeId(node);
    this.fire({ type: 'TREEVIEW/select', payload: { selected } });
  }

  private fire: t.FireEvent<t.TreeviewEvent> = (e) => this.treeview$.next(e);

  private ref(column?: number) {
    const tag = columnTag.toString(column);
    return tag ? this.elTrees.find((ref) => ref.tag === tag) : undefined;
  }

  private current(column?: number) {
    if (typeof column !== 'number') {
      return undefined;
    }

    column = Math.max(0, column);
    const index = column + this.offset;

    if (index === 0) {
      return this.props.root?.id;
    } else {
      const path = this.path.slice(1);
      return path[index - 1] || null;
    }
  }

  private columnOf(node: t.NodeIdentifier) {
    const id = toNodeId(node);
    const query = this.query;
    return Array.from({ length: this.total })
      .map((v, i) => this.current(i) || undefined)
      .find((column) => {
        const parent = query.findById(column);
        return parent ? (parent.children || []).some((e) => e.id === id) : false;
      });
  }

  private columnIndexOf(node: t.NodeIdentifier) {
    const id = this.columnOf(node);

    return Array.from({ length: this.total })
      .map((v, i) => i)
      .find((i) => this.current(i) === id);
  }

  private selectPreviousColumn() {
    const column = this.focusedIndex;
    const selected = this.nav.selected;
    const parent = this.query.ancestor(selected, (e) => e.level === 1);

    if (!parent || parent.id === this.props.root?.id) {
      return;
    }

    if (column === 0 && this.offset > 0) {
      this.state$.next({ offset: this.offset - 1 });
      this.focus(this.total - 1);
    } else {
      this.select(parent);
      this.focus(this.columnIndexOf(parent));
    }
  }

  private selectNextColumn() {
    const column = this.focusedIndex;
    const selection = this.nav.selected;
    const children = this.childrenOf(selection);
    if (children.length === 0) {
      return;
    }

    const isLast = column === this.total - 1;
    if (isLast) {
      this.state$.next({ offset: this.offset + 1 });
      this.focus(0);
    } else {
      this.selectChild(column + 1, { focus: true });
    }
  }

  /**
   * [Render]
   */

  public render() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
      }),
    };

    const elTrees = Array.from({ length: this.total }).map((v, i) => this.renderTree(i));
    return <div {...css(styles.base, this.props.style)}>{elTrees}</div>;
  }

  private renderTree(column: number) {
    const isFirst = column === 0;
    const isLast = column === this.total - 1;
    const focusOnLoad = isFirst && this.props.focusOnLoad;

    const props = { ...this.props };
    delete props.focusOnLoad;
    delete props.total;

    const styles = {
      base: css({
        flex: 1,
        display: 'flex',
        position: 'relative',
        boxSizing: 'border-box',
        borderRight: isLast ? undefined : this.dividerBorder,
      }),
    };

    const current = this.current(column);

    return (
      <div {...styles.base} key={column}>
        {current && (
          <Treeview
            ref={this.elTreeRef}
            background={'NONE'}
            {...props}
            root={this.props.root}
            current={current}
            event$={this.treeview$}
            keyPress$={this.keyPress$}
            tabIndex={0}
            focusOnLoad={focusOnLoad}
            tag={columnTag.toString(column)}
          />
        )}{' '}
      </div>
    );
  }
}

/**
 * [Helpers]
 */

function buildPath(root?: t.ITreeviewNode, selected?: string): string[] {
  if (!root) {
    return [];
  } else {
    const path: string[] = [];
    const query = Treeview.query(root);
    const node = query.findById(selected);
    if (node) {
      query.walkUp(node, (e) => path.unshift(e.id));
    }
    return path;
  }
}

const columnTag = {
  toString(index?: number) {
    return index === undefined ? '' : `column-${index}`;
  },
  fromString(text: string) {
    const index = parseInt(text.replace(/^column-/, ''), 10);
    return Number.isNaN(index) ? -1 : index;
  },
};
