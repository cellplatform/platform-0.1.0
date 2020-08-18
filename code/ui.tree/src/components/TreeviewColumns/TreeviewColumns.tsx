import { color, css } from '@platform/css';
import { events } from '@platform/react';
import { rx } from '@platform/util.value';
import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { t } from '../../common';
import { ITreeviewProps, Treeview } from '../Treeview';

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
     * Bubble events through given event-bus.
     */
    if (this.props.event$) {
      event.$.subscribe((e) => this.props.event$?.next(e));
    }

    /**
     * Ensure the entire selection path is shown with background styles.
     */
    const before = event.beforeRender;
    before.node$.subscribe((e) => {
      const id = e.node.id;
      const path = this.path.slice(1);
      const selectedColumn = path.findIndex((part) => part === id);

      if (selectedColumn >= 0) {
        e.change((props) => {
          const colors = props.colors || (props.colors = {});
          colors.bg = e.isFocused ? -0.05 : -0.03;
        });
      }
    });

    before.header$.subscribe((e) => {
      e.change((props) => {
        const header = props.header || (props.header = {});
        header.showParentButton = false;
      });

      /**
       * TODO 🐷
       * - only hide "<" parent/back button if not first column (viewport)
       * - inline twisty
       * - viewport
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
     * Intercept key-press events to handle column specific
     * interactions that relate to multi-column navigation
     * intercepting prior to any higher level strategies
     * interpreting the event.
     *
     * IMPORTANT: Done here in constructor to get into the
     *            event stream early before anything else
     *            can register as a listener.
     */

    const horizontal$ = keyPress$.pipe(
      filter((e) => e.key === 'ArrowLeft' || e.key === 'ArrowRight'),
      tap((e) => e.preventDefault()), // SIDE-EFFECT: Stop the higher-level keyboard strategies from drilling in.
    );

    horizontal$.pipe(filter((e) => e.key === 'ArrowRight')).subscribe((e) => {
      const index = this.focusedIndex + 1;
      if (this.selectFirst(index)) {
        this.focus(index);
      }
    });

    horizontal$.pipe(filter((e) => e.key === 'ArrowLeft')).subscribe((e) => {
      const index = this.focusedIndex - 1;
      if (index >= 0) {
        const parentSelection = this.path.slice(1)[index];
        this.select(parentSelection);
        this.focus(index);
      }
    });
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

  /**
   * [Methods]
   */

  public focus(column = 0) {
    const ref = this.ref(column);
    if (ref) {
      ref.focus();
    }
  }

  private selectFirst(column: number) {
    const node = this.query.findById(this.current(column) || undefined);
    const children = node?.children || [];
    if (children.length > 0) {
      this.select(children[0]);
    }
    return children.length > 0;
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
    const offset = this.state.offset || 0;

    /**
     * TODO 🐷
     * - offset when deeper than total columns
     */

    const index = column + offset;
    const path = this.path.slice(1);

    if (index === 0) {
      return this.props.root?.id;
    }

    return path[index - 1] || null;
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
