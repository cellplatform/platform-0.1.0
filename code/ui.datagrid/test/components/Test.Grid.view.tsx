import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { datagrid, GlamorValue, Handsontable as HandsontableLib, t } from '../common';
import { factory } from '../SAMPLE';

export type DataGrid = datagrid.DataGrid;

export type ITestGridViewProps = {
  grid: datagrid.Grid;
  events$?: Subject<t.GridEvent>;
  editorType?: t.TestEditorType;
  style?: GlamorValue;
  Table?: Handsontable;
};
export type ITestGridViewState = {};

export class TestGridView extends React.PureComponent<ITestGridViewProps, ITestGridViewState> {
  public state: ITestGridViewState = {};
  private state$ = new Subject<Partial<ITestGridViewState>>();
  private unmounted$ = new Subject<{}>();
  private events$ = this.props.events$ || new Subject<t.GridEvent>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const keyboard$ = this.props.grid.keyboard$;

    events$.pipe(filter(e => !['GRID/keydown'].includes(e.type))).subscribe(e => {
      // console.log('🌳 EVENT', e.type, e.payload);
    });

    events$
      .pipe(
        filter(e => e.type === 'GRID/EDITOR/end'),
        map(e => e.payload as t.IEndEditing),
        filter(e => !e.isCancelled),
      )
      .subscribe(e => {
        // e.payload.cancel();
      });

    const beginEdit$ = events$.pipe(
      filter(e => e.type === 'GRID/EDITOR/begin'),
      map(e => e.payload as t.IBeginEditing),
    );

    beginEdit$.pipe(filter(e => e.cell.key === 'B1')).subscribe(e => {
      // Cancel B1 edit operations before they begin.
      e.cancel();
    });

    const change$ = events$.pipe(
      filter(e => e.type === 'GRID/cells/change'),
      map(e => e.payload as t.IGridCellsChange),
    );

    const selection$ = events$.pipe(
      filter(e => e.type === 'GRID/selection'),
      map(e => e.payload as t.IGridSelectionChange),
    );

    change$.subscribe(e => {
      // e.cancel();
      // console.log('CHANGE', e);
    });

    change$.pipe().subscribe(e => {
      const B2 = e.changes.find(change => change.cell.key === 'B2');
      if (B2) {
        B2.cancel();
      }
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  private get Table() {
    const { Table = HandsontableLib } = this.props;
    return Table as Handsontable;
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <datagrid.DataGrid
        grid={this.props.grid}
        factory={factory}
        Handsontable={this.Table}
        events$={this.events$}
        initial={{ selection: 'A1' }}
        style={this.props.style}
        canSelectAll={false}
      />
    );
  }
}
