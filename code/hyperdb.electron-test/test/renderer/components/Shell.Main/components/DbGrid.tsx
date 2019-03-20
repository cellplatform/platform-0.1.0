import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, map } from 'rxjs/operators';
import { css, GlamorValue, t, datagrid } from '../../../common';
import { DbGridEditor } from './DbGrid.Editor';

export type IDbGridProps = { db: t.ITestRendererDb; style?: GlamorValue };
export type IDbGridState = { values?: datagrid.IGridValues };

const PATTERN = {
  CELL: 'cell/',
};

export class DbGrid extends React.PureComponent<IDbGridProps, IDbGridState> {
  public state: IDbGridState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IDbGridState>>();
  private grid$ = new Subject<datagrid.GridEvent>();

  public datagrid!: datagrid.DataGrid;
  private datagridRef = (ref: datagrid.DataGrid) => (this.datagrid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public async componentDidMount() {
    const grid$ = this.grid$.pipe(takeUntil(this.unmounted$));
    grid$.pipe(filter(e => !['GRID/keydown'].includes(e.type))).subscribe(e => {
      console.log('🌳  EVENT', e.type, e.payload);
    });

    // Watch for chagnes to cells.
    const watch$ = this.db.watch$.pipe(
      takeUntil(this.unmounted$),
      filter(e => e.key.startsWith(PATTERN.CELL)),
    );
    await this.db.watch(PATTERN.CELL);

    // Update the GRID when the DB changes.
    watch$.subscribe(e => {
      this.putGridCell(e.key, e.value);
    });

    // Update the DB when the GRID changes.
    grid$
      .pipe(
        filter(e => e.type === 'GRID/change'),
        map(e => e.payload as datagrid.IGridChange),
        filter(e => e.isChanged),
        filter(e => !e.isCancelled),
      )
      .subscribe(async e => {
        this.putDbCell(e.cell.key, e.value.to);
      });

    // Finish up.
    this.loadFromDb();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.datagrid.dispose();
  }

  /**
   * [Properties]
   */
  public get grid() {
    return this.datagrid.grid;
  }

  public get db() {
    return this.props.db;
  }

  /**
   * [Methods]
   */
  public async loadFromDb() {
    const db = this.db;
    const res = await db.values({ pattern: PATTERN.CELL });

    const values = Object.keys(res).reduce((acc, next, i) => {
      const key = toCellKey(next);
      acc = { ...acc, [key]: res[next].value };
      return acc;
    }, {});

    this.grid.loadValues(values);
  }

  public async putGridCell(dbKey: string, value: any) {
    const cellKey = toCellKey(dbKey);
    const pos = datagrid.Cell.toPosition(cellKey);
    this.grid.cell(pos).value = value;
  }

  public async putDbCell(dbKey: string, value: any) {
    dbKey = toDbKey(dbKey);
    if (value === '') {
      await this.db.delete(dbKey as any);
    } else {
      await this.db.put(dbKey as any, value);
    }
    console.log('write', dbKey, value);
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
        <datagrid.DataGrid
          key={'test.grid'}
          ref={this.datagridRef}
          values={this.state.values}
          events$={this.grid$}
          factory={this.factory}
          totalColumns={52}
          totalRows={1000}
          initial={{ selection: 'A1' }}
          style={styles.grid}
        />
      </div>
    );
  }

  private factory: datagrid.GridFactory = req => {
    switch (req.type) {
      case 'EDITOR':
        return <DbGridEditor />;

      case 'CELL':
        const value = typeof req.value === 'object' ? JSON.stringify(req.value) : req.value;
        return <div>{value}</div>;

      default:
        this.context.log(`Factory type '${req.type}' not supported by test.`);
        return null;
    }
  };
}

/**
 * [Helpers]
 */

function toCellKey(dbKey: string) {
  return dbKey.replace(/^cell\//, '');
}

function toDbKey(cellKey: string) {
  return `cell/${toCellKey(cellKey)}`;
}
