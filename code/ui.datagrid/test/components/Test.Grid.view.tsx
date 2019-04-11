import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { datagrid, GlamorValue, Handsontable as HandsontableLib, t, markdown } from '../common';
import { DebugEditor } from './Debug.Editor';
import { CellEditor } from '../../src';

export type DataGrid = datagrid.DataGrid;

export type ITestGridViewProps = {
  events$?: Subject<t.GridEvent>;
  editorType: t.TestEditorType;
  style?: GlamorValue;
  Table?: Handsontable;
};
export type ITestGridViewState = { values?: t.IGridValues };

const DEFAULT = {
  A1: 'A1',
  A2: '* one\n * two',
  B1: 'locked',
  B2: 'cancel',
};

export class TestGridView extends React.PureComponent<ITestGridViewProps, ITestGridViewState> {
  public state: ITestGridViewState = { values: DEFAULT };
  public state$ = new Subject<Partial<ITestGridViewState>>();
  private unmounted$ = new Subject();
  private events$ = this.props.events$ || new Subject<t.GridEvent>();

  public datagrid!: datagrid.DataGrid;
  private datagridRef = (ref: datagrid.DataGrid) => (this.datagrid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    // const keys$ = this.grid.keys$;

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
        // console.log('HANDLE END  🐷 ');
        // e.payload.cancel();
        console.group('🌳 END EDIT');
        console.log('e', e);
        console.log('e.size', e.size);
        console.groupEnd();
        // console.log('END', e);
      });

    // events$
    // .pipe(
    //   filter(e => e.type === 'GRID/EDITOR/end'),
    //   map(e => e as t.IEndEditingEvent),
    //   filter(e => !e.payload.isCancelled),
    // )
    // .subscribe(e => {
    //   // console.log('HANDLE END  🐷 ');
    //   // e.payload.cancel();
    //   console.log('e', e);
    // });

    const beginEdit$ = events$.pipe(
      filter(e => e.type === 'GRID/EDITOR/begin'),
      map(e => e.payload as t.IBeginEditing),
    );

    beginEdit$.pipe(filter(e => e.cell.key === 'B1')).subscribe(e => {
      // Cancel B1 edit operations before they begin.
      e.cancel();
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
      console.log('Cancel [B2]');
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

  public get grid() {
    return this.datagrid.grid;
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <datagrid.DataGrid
        key={'test.grid'}
        ref={this.datagridRef}
        values={this.state.values}
        events$={this.events$}
        factory={this.factory}
        totalColumns={52}
        totalRows={2000}
        Handsontable={this.Table}
        initial={{ selection: 'A1' }}
        style={this.props.style}
        canSelectAll={false}
      />
    );
  }

  private factory: t.GridFactory = req => {
    switch (req.type) {
      case 'EDITOR':
        return this.renderEditor();

      case 'CELL':
        return formatValue(req.value);

      default:
        console.log(`Factory type '${req.type}' not supported by test.`);
        return null;
    }
  };

  private renderEditor = () => {
    switch (this.props.editorType) {
      case 'default':
        return <CellEditor />;

      default:
        return <DebugEditor />;
    }
  };
}

/**
 * [Helpers]
 */
function formatValue(value: datagrid.CellValue) {
  value = typeof value === 'string' && !value.startsWith('=') ? markdown.toHtmlSync(value) : value;
  value = typeof value === 'object' ? JSON.stringify(value) : value;
  // if (typeof value === 'string' && !value.includes('\n') && value.startsWith('<p>')) {
  // Strip <P>
  // value = value.replace(/^\<p\>/, '').replace(/\<\/p\>/, '');
  // }
  return value;
}
