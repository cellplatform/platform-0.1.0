import '../../styles';

import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { Grid } from '../../api';
import { FactoryManager } from '../../factory';
import * as render from '../../render';
import {
  constants,
  containsFocus,
  css,
  defaultValue,
  events,
  CssValue,
  Handsontable as TableLib,
  t,
} from '../common';
import { getSettings } from '../settings';
import { DataGridOverlay } from './DataGrid.Overlay';
import { IGridRefsPrivate } from './types.private';

const { CSS } = constants;

export type IDataGridProps = {
  grid: Grid;
  factory: t.GridFactory;
  Handsontable?: Handsontable;
  events$?: Subject<t.GridEvent>;
  initial?: t.IInitialGridState;
  canSelectAll?: boolean;
  style?: CssValue;
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
    const grid = (this.grid = this.props.grid);
    this.unmounted$.subscribe(() => grid.dispose());

    // State.
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    // Create the DOM table.
    const settings = getSettings({ grid });

    const Table = this.props.Handsontable || TableLib;
    const table = (this.table = new Table(this.el as Element, settings));
    grid.initialize({ table });

    // Initialize factories.
    const factory = (this.factory = new FactoryManager({ grid, factory: this.props.factory }));
    render.registerAll(Table, grid, factory);

    // Store metadata on the [Handsontable] instance.
    // NOTE:
    //    This is referenced within the [Editor] class.
    const refs: IGridRefsPrivate = {
      grid,
      editorEvents$: new Subject<t.EditorEvent>(), // NB: This ferries events back from the [Editor].
      factory: this.factory,
    };
    (table as any).__gridRefs = refs;

    // Setup observables.
    const { events$, keyboard$ } = grid;
    const editor$ = refs.editorEvents$.pipe(takeUntil(this.unmounted$));

    // Bubble events.
    const bubble$ = this.props.events$;
    if (bubble$) {
      events$.subscribe(e => bubble$.next(e));
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

    // Dispose on HMR (see ParcelJS).
    const hot = (module as any).hot;
    if (hot) {
      hot.dispose(() => this.dispose());
    }

    // Clear selection when another element outside the grid receives focus.
    events.focus$
      .pipe(
        takeUntil(this.unmounted$),
        debounceTime(0),
        filter(e => e.to !== document.body),
        filter(e => !containsFocus(this)),
      )
      .subscribe(e => this.grid.deselect());

    // Setup initial state.
    // NB:  Running init after a tick prevents unnecessary work if the component
    //      is caught in a reload loop which may happen with HMR.  In which case the
    //      component will be `disposed` by the time `init` is called and hence bypassed.
    // time.delay(0, () => this.init());
    this.init();
  }

  private async init() {
    if (this.isDisposed) {
      return;
    }
    const { initial = {} } = this.props;
    const grid = this.grid;

    // Assign selection.
    if (initial.selection) {
      const selection =
        typeof initial.selection === 'string' ? { cell: initial.selection } : initial.selection;
      const { cell, ranges } = selection;
      grid.select({ cell, ranges });
    }

    // Prepare view.
    await grid.calc.update();
    const cells = grid.data.cells;
    grid.changeCells(cells, { init: true, silent: true });
    grid.mergeCells({ cells, init: true });

    // Finish up.
    grid.fire({ type: 'GRID/ready', payload: { grid } });
    this.forceUpdate();
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
    const { factory } = this.props;
    const grid = this.grid;
    const styles = {
      base: css({
        position: 'relative',
        overflow: 'hidden',
      }),
      grid: css({
        Absolute: 0,
        userSelect: 'none',
        visibility: this.isReady ? 'visible' : 'hidden',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div ref={this.elRef} className={CSS.CLASS.GRID.BASE} {...styles.grid} />
        {grid && <DataGridOverlay grid={grid} factory={factory} />}
      </div>
    );
  }
}
