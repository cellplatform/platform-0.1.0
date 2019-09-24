import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import {
  CellEditor,
  color,
  COLORS,
  CommandShell,
  css,
  datagrid,
  log,
  markdown,
  ObjectView,
  Sync,
  t,
  Hr,
} from '../common';

const storage = {
  get showDebug() {
    const value = localStorage.getItem('showDebug') || 'false';
    return value === 'true';
  },
  set showDebug(value: boolean) {
    localStorage.setItem('showDebug', (value || false).toString());
  },
};

export type ITestProps = {
  db: t.IDb;
};
export type ITestState = t.ITestState & {
  db?: any;
  grid?: any;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = { showDebug: storage.showDebug };
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<ITestState>>();
  private grid$ = new Subject<t.GridEvent>();
  private sync$ = new Subject<t.SyncEvent>();
  private cli!: t.ICommandState;
  private sync!: Sync;

  private datagrid!: datagrid.DataGrid;
  private datagridRef = (ref: datagrid.DataGrid) => (this.datagrid = ref);

  /**
   * [Lifecycle]
   */

  constructor(props: ITestProps) {
    super(props);
    this.cli = cli.init({
      state$: this.state$,
      getDb: () => this.db,
      getSync: () => this.sync,
      getState: () => this.state,
    });
  }

  public async componentDidMount() {
    // Setup observables.
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const sync$ = this.sync$.pipe(takeUntil(this.unmounted$));

    // Update state.
    state$.subscribe(e => this.setState(e));

    // Store values in local-storage.
    state$
      .pipe(distinctUntilChanged((prev, next) => prev.showDebug === next.showDebug))
      .subscribe(e => {
        this.datagrid.redraw();
        storage.showDebug = this.state.showDebug || false;
      });

    // Events.
    sync$.subscribe(e => {
      // console.log('🌳', e.type, e.payload);
    });

    sync$.pipe(filter(e => e.type !== 'SYNC/change')).subscribe(e => {
      log.info('🌳', e.type, e.payload);
    });

    sync$
      // Update debug state after changes.
      .pipe(debounceTime(200))
      .subscribe(e => this.updateState());

    // Setup syncer.
    const db = this.db;
    const grid = this.datagrid.grid;
    const events$ = this.sync$;
    this.sync = Sync.create({ db, grid, events$ });
    await this.sync.compact();
    await this.sync.load();
    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
    this.sync.dispose();
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
  public async updateState() {
    const processDbValues = (obj: object) => {
      Object.keys(obj).map(key => {
        const MAX = 15;
        const value = obj[key];
        if (typeof value === 'string' && value.length > MAX) {
          obj[key] = `${value.substring(0, MAX).trim()}...`;
        }
      });
    };

    const processGridValues = (values: object) => {
      Object.keys(values).map(key => {
        const hash = values[key] ? (values[key] as any).hash : undefined;
        if (hash) {
          (values[key] as any).hash = `${hash.substring(0, 12)}..(SHA-256)`;
        }
      });
    };

    // Database.
    const db = (await this.db.find('**')).map;
    processDbValues({ ...db });

    // Grid.
    const grid = {
      ...this.grid.columns,
      ...this.grid.rows,
      ...this.grid.values,
    };
    processGridValues(grid);

    // Finish up.
    this.state$.next({ db, grid });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal',
        boxSizing: 'border-box',
      }),
      left: css({
        position: 'relative',
        flex: 1,
        display: 'flex',
      }),
    };

    const showDebug = this.state.showDebug;
    const tree = showDebug ? {} : undefined;
    const elRight = showDebug && this.renderDebug();

    return (
      <CommandShell cli={this.cli} tree={tree} localStorage={true} focusOnLoad={false}>
        <div {...styles.base}>
          <div {...styles.left}>{this.renderGrid()}</div>
          {elRight}
        </div>
      </CommandShell>
    );
  }

  private renderDebug() {
    const styles = {
      base: css({
        position: 'relative',
        width: 350,
        backgroundColor: COLORS.DARK,
        borderBottom: `solid 1px ${color.format(0.1)}`,
      }),
      inner: css({
        paddingLeft: 10,
        paddingTop: 7,
        Absolute: 0,
        Scroll: true,
      }),
    };

    const { db, grid } = this.state;

    return (
      <div {...styles.base}>
        <div {...styles.inner}>
          <ObjectView
            name={'db'}
            data={db}
            theme={'DARK'}
            expandLevel={0}
            expandPaths={['$', '$.cell/A1', '$.cell/A1.props', '$.cell/A1.props.style']}
          />
          <Hr color={COLORS.WHITE} />
          <ObjectView name={'grid'} data={grid} expandLevel={1} theme={'DARK'} />
        </div>
      </div>
    );
  }

  private renderGrid() {
    return (
      <datagrid.DataGrid
        ref={this.datagridRef}
        events$={this.grid$}
        factory={this.factory}
        initial={{ selection: { cell: 'A1', ranges: ['A1:E30'] } }}
        style={{ Absolute: 0 }}
        canSelectAll={false}
      />
    );
  }

  private factory: t.GridFactory = req => {
    switch (req.type) {
      case 'EDITOR':
        return <CellEditor />;

      case 'CELL':
        return req.cell ? formatValue(req.cell) : '';

      default:
        log.error(`Factory type '${req.type}' not supported by test.`);
        return null;
    }
  };
}

/**
 * [Helpers]
 */
function formatValue(cell: t.IGridCell) {
  let value = cell.props && cell.props.value ? cell.props.value : cell.value;
  value = typeof value === 'string' && !value.startsWith('=') ? markdown.toHtmlSync(value) : value;
  value = typeof value === 'object' ? JSON.stringify(value) : value;
  return value;
}
