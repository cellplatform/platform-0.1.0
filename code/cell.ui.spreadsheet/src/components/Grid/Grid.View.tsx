import datagrid from '@platform/ui.datagrid';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CssValue, onStateChanged, rx, t, ui } from '../../common';
import { factory } from './factory';

export type IGridViewProps = { ns: string; grid$?: Subject<t.GridEvent>; style?: CssValue };
export type IGridViewState = t.Object;

export class GridView extends React.PureComponent<IGridViewProps, IGridViewState> {
  public state: IGridViewState = {};
  private state$ = new Subject<Partial<IGridViewState>>();
  private unmounted$ = new Subject();

  private grid$ = this.props.grid$ || new Subject<t.GridEvent>();
  private grid!: datagrid.Grid;

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IGridViewProps) {
    super(props);

    this.grid = datagrid.Grid.create({
      ns: props.ns,
      totalColumns: 52,
      totalRows: 1000,
    });
  }

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

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
   * [Methods]
   */
  public async load() {
    const { ns } = this.props;
    const grid = this.grid;
    if (ns && grid) {
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
    if (this.props.ns && grid) {
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
    return (
      <datagrid.DataGrid
        grid={this.grid}
        factory={factory}
        events$={this.grid$}
        initial={{ selection: 'A1' }}
        style={this.props.style}
        canSelectAll={false}
      />
    );
  }
}
