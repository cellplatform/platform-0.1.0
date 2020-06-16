import datagrid from '@platform/ui.datagrid';
import * as React from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { CssValue, onStateChanged, rx, t, ui } from '../../common';
import { factory } from '../../test/SAMPLE';

export type IGridProps = { events$?: Subject<t.GridEvent>; style?: CssValue };
export type IGridState = {
  grid?: datagrid.Grid;
};

export class Grid extends React.PureComponent<IGridProps, IGridState> {
  public state: IGridState = {};
  private state$ = new Subject<Partial<IGridState>>();
  private unmounted$ = new Subject<{}>();
  private grid$ = this.props.events$ || new Subject<t.GridEvent>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    // Create the grid for the namespace.
    this.create();
    changes
      .on('APP:SHEET/ns')
      .pipe(
        map((e) => e.to),
        distinctUntilChanged((prev, next) => prev.ns === next.ns && prev.host === next.host),
      )
      .subscribe((e) => this.create());

    /**
     * Full dataset loaded into state.
     */
    changes.on('APP:SHEET/data').subscribe(() => this.load());

    /**
     * Patch incremental changes to data.
     */
    rx.payload<t.ISpreadsheetPatchEvent>(ctx.event$, 'APP:SHEET/patch').subscribe((e) => {
      this.patch(e);
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get ns() {
    return this.context.getState().ns || '';
  }

  public get host() {
    return this.context.getState().host || '';
  }

  public get grid() {
    return this.state.grid;
  }

  /**
   * [Methods]
   */
  public async create() {
    const ns = this.ns;
    if (!ns) {
      return;
    }

    const grid = datagrid.Grid.create({
      ns,
      totalColumns: 52,
      totalRows: 1000,
    });

    this.state$.next({ grid });
  }

  public async load() {
    const grid = this.grid;
    if (this.ns && grid) {
      const ctx = this.context;
      const data = ctx.getState().data;
      if (data) {
        grid.changeCells(data.cells);
        grid.changeRows(data.rows);
        grid.changeColumns(data.columns);
      }
    }
  }

  public patch(patch: t.ISpreadsheetPatch) {
    const grid = this.grid;
    if (this.ns && grid) {
      if (patch.cells) {
        grid.changeCells(patch.cells);
      }
      if (patch.columns) {
        grid.changeColumns(patch.columns);
      }
      if (patch.rows) {
        grid.changeRows(patch.rows);
      }
    }
  }

  /**
   * [Render]
   */
  public render() {
    const grid = this.state.grid;
    if (!grid) {
      return null;
    }
    return (
      <datagrid.DataGrid
        grid={grid}
        factory={factory}
        events$={this.grid$}
        initial={{ selection: 'A1' }}
        style={this.props.style}
        canSelectAll={false}
      />
    );
  }
}
