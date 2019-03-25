import '../../styles';

import { DefaultSettings } from 'handsontable';
import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, debounceTime } from 'rxjs/operators';

import { Grid } from '../../api';
import {
  constants,
  css,
  events,
  GlamorValue,
  Handsontable as TableLib,
  R,
  t,
  time,
  value,
  containsFocus,
} from '../../common';
import { Editor } from '../Editor';
import { FactoryManager } from '../factory';
import * as render from '../render';
import * as hook from './hook';
import { IGridRefsPrivate } from './types.private';

const { DEFAULTS } = constants;

export type IDataGridProps = {
  totalColumns?: number;
  totalRows?: number;
  values?: t.IGridValues;
  Handsontable?: Handsontable;
  factory?: t.GridFactory;
  events$?: Subject<t.GridEvent>;
  initial?: t.IInitialGridState;
  canSelectAll?: boolean;
  style?: GlamorValue;
};
export type IDataGridState = {
  size?: { width: number; height: number };
};

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

  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IDataGridState>>();

  private el!: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);
  private table!: Handsontable;

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    const { values } = this.props;

    // Create the table and corresponding API wrapper.
    const Table = this.props.Handsontable || TableLib;
    const totalColumns = this.totalColumns;
    const totalRows = this.totalRows;
    const table = (this.table = new Table(this.el as Element, this.settings));
    const grid = (this.grid = Grid.create({ table, totalColumns, totalRows, values }));
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
    const { events$, keys$ } = grid;
    const editor$ = refs.editorEvents$.pipe(takeUntil(this.unmounted$));

    // Ferry editor events to the [Grid] API.
    editor$.subscribe(e => this.grid.next(e));

    // Disallow select all (CMD+A) unless requested by prop.
    keys$
      .pipe(
        filter(e => e.metaKey && e.key === 'a'),
        filter(e => this.props.canSelectAll !== true),
        filter(e => !grid.isEditing),
      )
      .subscribe(e => e.cancel());

    // Manage size.
    this.updateSize();
    events.resize$.pipe(takeUntil(this.unmounted$)).subscribe(() => this.redraw());

    // Bubble events.
    events$.subscribe(e => {
      if (this.props.events$) {
        this.props.events$.next(e);
      }
    });

    // Dispose on HMR.
    const hot = (module as any).hot;
    if (hot) {
      hot.dispose(() => this.dispose());
    }

    // Setup initial state.
    // NB:  Running init after a tick prevents unnecessary work if the component
    //      is caught in a reload loop which may happen with HMR.  In which case the
    //      component will be `disposed` by the time `init` is called and hence bypassed.
    time.delay(0, () => this.init());

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
    const { initial = {} } = this.props;
    const grid = this.grid;
    grid.loadValues();
    if (initial.selection) {
      const selection =
        typeof initial.selection === 'string' ? { cell: initial.selection } : initial.selection;
      const { cell, ranges } = selection;
      grid.select({ cell, ranges });
    }
    grid.next({ type: 'GRID/ready', payload: { grid } });
    this.forceUpdate();
  }

  public componentDidUpdate(prev: IDataGridProps) {
    /**
     * If the values prop has changed. Force reload the values into the grid.
     */
    if (!R.equals(prev.values, this.props.values)) {
      this.grid.loadValues(this.props.values);
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
    return value.defaultValue(this.props.totalColumns, DEFAULTS.TOTAL_COLUMNS);
  }

  public get totalRows() {
    return value.defaultValue(this.props.totalRows, DEFAULTS.TOTAL_ROWS);
  }

  private get settings(): DefaultSettings {
    const getGrid = () => this.grid;

    const createColumns = (length: number) => {
      return Array.from({ length }).map(() => {
        return {
          renderer: render.CELL_DEFAULT,
          editor: Editor,
        };
      });
    };

    return {
      data: [],
      rowHeaders: true,
      colHeaders: true,
      colWidths: 100,
      columns: createColumns(this.totalColumns),
      viewportRowRenderingOffset: 20,
      manualRowResize: true,
      manualColumnResize: true,
      renderAllRows: false, // Virtual scrolling.

      /**
       * Event Hooks
       * https://handsontable.com/docs/6.2.2/Hooks.html
       */
      beforeKeyDown: hook.beforeKeyDownHandler(getGrid),
      beforeChange: hook.beforeChangeHandler(getGrid),
      afterSelection: hook.afterSelectionHandler(getGrid),
      afterDeselect: hook.afterDeselectHandler(getGrid),
    };
  }

  /**
   * [Methods]
   */

  public redraw() {
    this.updateSize();
    if (this.table) {
      this.table.render();
    }
  }

  public updateSize() {
    const el = this.el;
    if (!el || this.isDisposed) {
      return;
    }
    const { offsetWidth: width, offsetHeight: height } = el;
    const size = { width, height };
    this.state$.next({ size });
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
        className={constants.CSS_CLASS.GRID}
        {...css(styles.base, this.props.style)}
      />
    );
  }
}

console.log(`\nTODO 🐷   Change selection state on Focus.\n`);
