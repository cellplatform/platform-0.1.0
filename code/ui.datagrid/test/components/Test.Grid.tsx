import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { GlamorValue, Handsontable as HandsontableLib, t, datagrid } from './common';
import { TestEditor } from './Test.Editor';

export type ITestProps = {
  style?: GlamorValue;
  Table?: Handsontable;
};
export type ITestState = {
  // settings?: datagrid.IGridSettings;
  // data?: object;
  values?: t.IGridValues;
};

const DEFAULT = {
  A1: 'A1',
  B1: 'locked',
  B2: 'cancel',
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = { values: DEFAULT };
  public state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();
  private events$ = new Subject<t.GridEvent>();

  public datagrid!: datagrid.DataGrid;
  private datagridRef = (ref: datagrid.DataGrid) => (this.datagrid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));

    events$
      .pipe(
        filter(e => e.type === 'GRID/EDITOR/end'),
        map(e => e as t.IEndEditingEvent),
        filter(e => !e.payload.isCancelled),
      )
      .subscribe(e => {
        // console.log('HANDLE END  🐷 ');
        // e.payload.cancel();
      });

    events$
      .pipe(
        filter(e => e.type === 'GRID/EDITOR/begin'),
        map(e => e as t.IBeginEditingEvent),
      )
      .subscribe(e => {
        // Cancel upon start of edit operation.
        // e.payload.cancel();
      });

    events$.pipe(filter(e => !['GRID/keydown'].includes(e.type))).subscribe(e => {
      // const cell = e.payload.cell;
      // const key = cell ? cell.key : undefined;
      console.log('🌳  EVENT', e.type, e.payload);
    });

    const change$ = events$.pipe(
      filter(e => e.type === 'GRID/change'),
      map(e => e.payload as t.IGridChange),
    );

    const changeSet$ = events$.pipe(
      filter(e => e.type === 'GRID/changeSet'),
      map(e => e.payload as t.IGridChangeSet),
    );

    const selection$ = events$.pipe(
      filter(e => e.type === 'GRID/selection'),
      map(e => e.payload as t.IGridSelectionChange),
    );

    change$.subscribe(e => {
      // e.cancel();
      // console.log('CHANGE', e);
    });

    change$.pipe(filter(e => e.cell.key === 'B2')).subscribe(e => {
      console.log('B2');
      e.cancel();
    });

    // changeSet$.subscribe(e => {});
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
        ref={this.datagridRef}
        values={this.state.values}
        events$={this.events$}
        factory={this.factory}
        totalColumns={52}
        totalRows={1000}
        Handsontable={this.Table}
        style={this.props.style}
      />
    );
  }

  private factory: t.GridFactory = req => {
    switch (req.type) {
      case 'EDITOR':
        if (req.column === 1 && req.row === 0) {
          return null;
        }

        return <TestEditor />;

      default:
        console.log(`Factory type '${req.type}' not supported by test.`);
        return null;
    }
  };
}
