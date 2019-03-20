import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import dg from '../../../../../node_modules/@platform/ui.datagrid';
import { css, GlamorValue, t } from '../../../common';

export type IDbGridProps = { db: t.ITestRendererDb; style?: GlamorValue };
export type IDbGridState = { values?: dg.IGridValues };

const DEFAULT = {
  A1: 'A1',
  B1: 'locked',
  B2: 'cancel',
};

export class DbGrid extends React.PureComponent<IDbGridProps, IDbGridState> {
  public state: IDbGridState = { values: DEFAULT };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IDbGridState>>();
  private events$ = new Subject<dg.GridEvent>();

  public datagrid!: dg.DataGrid;
  private datagridRef = (ref: dg.DataGrid) => (this.datagrid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const events$ = this.events$.pipe(takeUntil(this.unmounted$));

    events$.pipe(filter(e => !['GRID/keydown'].includes(e.type))).subscribe(e => {
      // const cell = e.payload.cell;
      // const key = cell ? cell.key : undefined;
      console.log('🌳  EVENT', e.type, e.payload);
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get grid() {
    return this.datagrid.grid;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
      }),
      grid: css({
        Absolute: 0,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <dg.DataGrid
          key={'test.grid'}
          ref={this.datagridRef}
          values={this.state.values}
          events$={this.events$}
          factory={this.factory}
          totalColumns={52}
          totalRows={1000}
          initial={{ selection: 'A1' }}
          style={styles.grid}
        />
      </div>
    );
  }

  private factory: dg.GridFactory = req => {
    switch (req.type) {
      case 'EDITOR':
        return <div>Editor</div>;

      case 'CELL':
        const value = typeof req.value === 'object' ? JSON.stringify(req.value) : req.value;
        return <div>{value}</div>;

      default:
        console.log(`Factory type '${req.type}' not supported by test.`);
        return null;
    }
  };
}
