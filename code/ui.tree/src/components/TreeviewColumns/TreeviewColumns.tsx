import { color, css } from '@platform/css';
import { events } from '@platform/react';
import { toNodeId } from '@platform/state/lib/common';
import { time, rx } from '@platform/util.value';
import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { t } from '../../common';
import { ITreeviewProps, Treeview } from '../Treeview';

type N = t.ITreeviewNode;

export type ITreeviewColumnsProps = ITreeviewProps & {
  total?: number;
  dividerBorder?: string | number;
  columnWidth?: number;
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
    const keypress$ = this.keyPress$.pipe(takeUntil(this.unmounted$));
    const keydown$ = keypress$.pipe(filter((e) => e.isPressed));
    const keyup$ = keypress$.pipe(filter((e) => !e.isPressed));

    /**
     * BEFORE node render.
     */
    const before = event.beforeRender;
    before.node$.subscribe((e) => {
      const id = e.node.id;
      const path = this.path.slice(1);
      const selectedColumn = path.findIndex((part) => part === id);
      const inline = e.node.props?.treeview?.inline;

      if (selectedColumn > -1 && !inline?.isOpen) {
        // Ensure the entire selection path is shown with a visible background.
        e.change((props) => {
          const colors = props.colors || (props.colors = {});
          colors.bg = e.isFocused ? -0.05 : -0.03;
        });
      }

      // Remove the "drill in" chevron (replace with a "total" badge).
      const children = e.node.children || [];
      if (children.length > 0) {
        const index = this.columnIndexOf(e.node);
        const isLast = index === this.total - 1;
        e.change((props) => {
          const chevron = props.chevron || (props.chevron = {});
          chevron.isVisible = isLast ? true : false;
          props.badge = children.length;
        });
      }
    });

    /**
     * BEFORE header render.
     */
    before.header$.subscribe((e) => {
      const offset = this.offset;
      const isOffsetRoot =
        offset === 0
          ? false
          : this.pathNodes({ includeInline: false }).slice(offset)[0]?.id === e.node.id;
      if (!isOffsetRoot) {
        // Only show the BACK (parent) button in header when the view-port is offset.
        e.change((props) => {
          const header = props.header || (props.header = {});
          header.showParentButton = false;
        });
      }
    });

    /**
     * Keep track of which column is in focus.
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
    click.parent$.pipe(filter(() => this.offset > 0)).subscribe(async (e) => {
      e.handled(); // NB: Stop higher-level mouse strategies from navigating.

      // Ensure the item in the first column is selected before stepping back.
      const first = this.pathNodes({ includeInline: false }).slice(1)[1];
      if (first) {
        this.select(first);
        this.focus(0);
        await time.wait(10);
      }

      // Move to up to previous view-port.
      this.selectPreviousColumn();
    });

    click.drillIn$.subscribe((e) => {
      e.handled(); // NB: Stop higher-level mouse strategies from navigating.
      time.delay(0, () => {
        this.selectNextColumn();
      });
    });

    keyup$
      .pipe(filter((e) => ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)))
      .subscribe((e) => {
        // Ensure the column containing the selection is focused.
        // NB: This is necesary if the user clicks on a another column
        //     header, then changes the selection via the keyboard.
        time.delay(10, () => {
          const selected = this.nav.selected;
          const index = this.columnIndexOf(selected);
          this.focus(index);
        });
      });

    keydown$
      .pipe(
        filter((e) => e.key === 'ArrowLeft'),
        filter((e) => !isInline(this.selected)),
      )
      .subscribe((e) => {
        e.preventDefault(); // NB: Stop higher-level keyboard strategies from navigating.
        this.selectPreviousColumn();
      });

    keydown$
      .pipe(
        filter((e) => e.key === 'ArrowRight'),
        filter((e) => !isInline(this.selected)),
      )
      .subscribe((e) => {
        e.preventDefault(); // NB: Stop higher-level keyboard strategies from navigating.
        this.selectNextColumn();
      });

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

  private get total() {
    const total = this.props.total === undefined ? 2 : this.props.total;
    return Math.max(total, 0);
  }

  private get dividerBorder() {
    const { dividerBorder = -0.1 } = this.props;
    return typeof dividerBorder === 'string'
      ? dividerBorder
      : `solid 1px ${color.format(dividerBorder)}`;
  }

  private get nav() {
    return this.props.root?.props?.treeview?.nav || {};
  }

  private get selected() {
    const id = this.nav.selected;
    return id ? this.query.findById(id) : undefined;
  }

  private get query() {
    return Treeview.query(this.props.root);
  }

  private get path() {
    return this.state.path || [];
  }

  private get focusedIndex() {
    const index = this.state.focusedIndex;
    return index === undefined ? -1 : index;
  }

  private get offset() {
    return this.state.offset || 0;
  }

  private get columnWidth() {
    return this.props.columnWidth || 250;
  }

  /**
   * [Methods]
   */

  public focus(column = 0) {
    if (column > -1) {
      const ref = this.ref(column);
      if (ref) {
        ref.focus();
      }
    }
  }

  private pathNodes(args: { includeInline: boolean }) {
    // NB: Inline nodes are removed from the path,
    //     as they do not open into their own column.
    const query = this.query;
    return this.path
      .map((id) => query.findById(id) as N)
      .filter((node) => Boolean(node))
      .filter((node) => (args.includeInline ? true : !isInline(node)));
  }

  private childrenOf(node?: t.NodeIdentifier) {
    return this.query.findById(node || undefined)?.children || [];
  }

  private selectChildAt(column: number, options: { focus?: boolean; index?: number } = {}) {
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
      const parent = this.pathNodes({ includeInline: false }).slice(1)[index - 1];
      if (!parent) {
        return null;
      }

      // NB: Only show a column for node that has children.
      const children = parent.children || [];
      return children.length === 0 ? null : parent.id;
    }
  }

  private columnOf(node?: t.NodeIdentifier) {
    if (!node) {
      return undefined;
    } else {
      const id = toNodeId(node);
      const query = this.query;
      return Array.from({ length: this.total })
        .map((v, i) => this.current(i) || undefined)
        .find((column) => {
          const parent = query.findById(column);
          return parent ? (parent.children || []).some((e) => e.id === id) : false;
        });
    }
  }

  private columnIndexOf(node?: t.NodeIdentifier) {
    if (!node) {
      return -1;
    } else {
      const id = this.columnOf(node);
      return Array.from({ length: this.total })
        .map((v, i) => i)
        .find((i) => this.current(i) === id);
    }
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

      // NB: Delay for 1-tick to ensure the focused index is correctly calculated.
      //     Only relevant when activated from [mouse] click.
      time.delay(0, () => this.focus(this.columnIndexOf(selected)));
    } else {
      this.select(parent);

      // NB: Delay for 1-tick to ensure the focused index is correctly calculated.
      //     Only relevant when activated from [mouse] click.
      time.delay(0, () => this.focus(this.columnIndexOf(parent)));
    }
  }

  private selectNextColumn() {
    const column = this.focusedIndex;
    const selected = this.nav.selected;
    const children = this.childrenOf(selected);
    if (children.length > 0) {
      const isLast = column === this.total - 1;
      if (isLast) {
        this.state$.next({ offset: this.offset + 1 });
        this.focus(this.columnIndexOf(selected));
      } else {
        this.selectChildAt(column + 1, { focus: true });
      }
    }
  }

  /**
   * [Render]
   */

  public render() {
    const styles = {
      base: css({
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
      }),
    };
    const length = this.total;
    const elTrees = Array.from({ length }).map((v, i) => this.renderTree(i));
    return <div {...css(styles.base, this.props.style)}>{elTrees}</div>;
  }

  private renderTree(column: number) {
    const current = this.current(column);

    if (!current) {
      return null;
    }

    const isFirst = column === 0;
    const focusOnLoad = isFirst && this.props.focusOnLoad;
    const width = this.columnWidth;

    const props = { ...this.props };
    delete props.focusOnLoad;
    delete props.total;

    const styles = {
      base: css({
        flex: 1,
        width,
        height: '100%',
        display: 'flex',
        position: 'relative',
        boxSizing: 'border-box',
        borderRight: this.dividerBorder,
      }),
    };

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

function buildPath(root?: N, selected?: string): string[] {
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

function isInline(node?: N) {
  return Boolean(node?.props?.treeview?.inline);
}
