import '../../styles';

import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { Grid } from '../../api';
import {
  constants,
  containsFocus,
  css,
  events,
  GlamorValue,
  Handsontable as TableLib,
  R,
  t,
  time,
  value,
  defaultValue,
} from '../../common';
import { FactoryManager } from '../factory';
import * as render from '../render';
import { getSettings } from '../settings';
import { IGridRefsPrivate } from './types.private';

const { DEFAULT, CSS } = constants;

export type IDataGridProps = {
  totalColumns?: number;
  totalRows?: number;
  values?: t.IGridValues;
  columns?: t.IGridColumns;
  rows?: t.IGridRows;
  defaults?: Partial<t.IGridDefaults>;
  Handsontable?: Handsontable;
  factory?: t.GridFactory;
  events$?: Subject<t.GridEvent>;
  initial?: t.IInitialGridState;
  canSelectAll?: boolean;
  style?: GlamorValue;
};
export type IDataGridState = { size?: t.ISize };

/**
 * A wrapper around the [Handsontable].
 *
 *    https://handsontable.com/docs
 *    https://github.com/handsontable/handsontable
 *    https://github.com/handsontable/react-handsontable
 *    https://forum.handsontable.com
 *
 */
export class DataGrid extends React.PureComponent<IDataGridProps, IDataGridState> {
  public state: IDataGridState = {};
  public grid!: Grid;
  public factory!: FactoryManager;

  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<IDataGridState>>();

  private el!: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);
  private table!: Handsontable;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const { values, columns, rows } = this.props;

    // State.
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    // Create the table and corresponding API wrapper.
    const Table = this.props.Handsontable || TableLib;
    const totalColumns = this.totalColumns;
    const totalRows = this.totalRows;
    const defaults = Grid.defaults(this.props.defaults);
    const settings = getSettings({ totalColumns, defaults, getGrid: () => this.grid });
    const table = (this.table = new Table(this.el as Element, settings));
    const grid = (this.grid = Grid.create({
      table,
      totalColumns,
      totalRows,
      values,
      columns,
      rows,
      defaults,
    }));
    this.unmounted$.subscribe(() => grid.dispose());

    // Initialize factories.
    const factory = (this.factory = new FactoryManager({ grid, factory: this.props.factory }));
    render.registerAll(Table, grid, factory);

    // Store metadata on the [Handsontable] instance.
    // NOTE:
    //    This is referenced within the [Editor] class.
    const refs: IGridRefsPrivate = {
      grid: grid,
      editorEvents$: new Subject<t.EditorEvent>(), // NB: This ferries events back from the [Editor].
      factory: this.factory,
    };
    (table as any).__gridRefs = refs;

    // Setup observables.
    const { events$, keyboard$ } = grid;
    const editor$ = refs.editorEvents$.pipe(takeUntil(this.unmounted$));

    // Bubble events.
    if (this.props.events$) {
      events$.subscribe(this.props.events$);
    }

    // Ferry editor events to the [Grid] API.
    editor$.subscribe(e => this.grid.fire(e));

    // Redraw grid.
    events$
      .pipe(
        filter(e => e.type === 'GRID/redraw'),
        debounceTime(0),
      )
      .subscribe(() => this.redraw());

    // Disallow select all (CMD+A) unless requested by prop.
    keyboard$
      .pipe(
        filter(e => e.metaKey && e.key === 'a'),
        filter(e => this.props.canSelectAll !== true),
        filter(e => !grid.isEditing),
      )
      .subscribe(e => e.cancel());

    // Manage size.
    this.updateSize();
    events.resize$.pipe(takeUntil(this.unmounted$)).subscribe(() => this.redraw());

    // Dispose on HMR.
    const hot = (module as any).hot;
    if (hot) {
      hot.dispose(() => this.dispose());
    }

    // Setup initial state.
    // NB:  Running init after a tick prevents unnecessary work if the component
    //      is caught in a reload loop which may happen with HMR.  In which case the
    //      component will be `disposed` by the time `init` is called and hence bypassed.
    // time.delay(0, () => this.init());
    this.init();

    // Clear selection when another element outside the grid receives focus.
    events.focus$
      .pipe(
        takeUntil(this.unmounted$),
        debounceTime(0),
        filter(e => e.to !== document.body),
        filter(e => !containsFocus(this)),
      )
      .subscribe(e => this.grid.deselect());
  }

  private init() {
    if (this.isDisposed) {
      return;
    }
    const { initial = {}, values = {} } = this.props;
    const grid = this.grid;
    grid.values = values;
    if (initial.selection) {
      const selection =
        typeof initial.selection === 'string' ? { cell: initial.selection } : initial.selection;
      const { cell, ranges } = selection;
      grid.select({ cell, ranges });
    }
    grid.fire({ type: 'GRID/ready', payload: { grid } });
    this.forceUpdate();
  }

  public componentDidUpdate(prev: IDataGridProps) {
    const next = this.props;
    const grid = this.grid;
    let redraw = false;
    if (!R.equals(prev.values, next.values)) {
      grid.values = next.values || {};
      redraw = true;
    }
    if (!R.equals(prev.columns, next.columns)) {
      grid.columns = next.columns || {};
      redraw = true;
    }
    if (!R.equals(prev.rows, next.rows)) {
      grid.rows = next.rows || {};
      redraw = true;
    }

    if (redraw) {
      this.redraw();
    }
  }

  public componentWillUnmount() {
    this.dispose();
  }

  public dispose() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this.unmounted$.isStopped || this.grid.isDisposed;
  }

  public get isReady() {
    return this.grid ? this.grid.isReady : false;
  }

  public get events$() {
    return this.grid.events$;
  }

  public get totalColumns() {
    return defaultValue(this.props.totalColumns, DEFAULT.TOTAL_COLUMNS);
  }

  public get totalRows() {
    return defaultValue(this.props.totalRows, DEFAULT.TOTAL_ROWS);
  }

  /**
   * [Methods]
   */
  public focus(isFocused?: boolean) {
    if (defaultValue(isFocused, true)) {
      this.grid.focus();
    } else {
      this.grid.blur();
    }
    return this;
  }

  public redraw() {
    this.updateSize();
    if (this.table) {
      this.table.render();
    }
    return this;
  }

  public updateSize() {
    const el = this.el;
    if (!el || this.isDisposed) {
      return;
    }
    const { offsetWidth: width, offsetHeight: height } = el;
    const size = { width, height };
    this.state$.next({ size });
    return this;
  }

  /**
   * [Render]
   */

  public render() {
    const styles = {
      base: css({
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        visibility: this.isReady ? 'visible' : 'hidden',
      }),
    };
    return (
      <div
        ref={this.elRef}
        className={CSS.CLASS.GRID.BASE}
        {...css(styles.base, this.props.style)}
      />
    );
  }
}
