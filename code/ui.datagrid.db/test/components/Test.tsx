import * as React from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import {
  value,
  CellEditor,
  color,
  constants,
  css,
  datagrid,
  markdown,
  ObjectView,
  renderer,
  CommandShell,
  Sync,
  t,
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

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = { showDebug: storage.showDebug };
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<t.ITestState>>();
  private grid$ = new Subject<t.GridEvent>();
  private sync$ = new Subject<t.SyncEvent>();
  private cli!: t.ICommandState;
  private sync!: Sync;

  private datagrid!: datagrid.DataGrid;
  private datagridRef = (ref: datagrid.DataGrid) => (this.datagrid = ref);

  public static contextType = renderer.Context;
  public context!: t.ILocalContext;
  private databases = this.context.databases;

  /**
   * [Lifecycle]
   */
  public async componentWillMount() {
    this.cli = cli.init({
      state$: this.state$,
      databases: this.databases,
      getState: () => this.state,
    });

    // Setup ovservables.
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
      console.log('🌳', e.type, e.payload);
    });

    // // Setup syncer.
    // const dir = constants.DB.DIR;
    // const db = this.databases(dir);
    // console.log('this.datagrid', this.datagrid);
    // // const grid = this.datagrid.grid;
    // // this.sync = Sync.create({ db, grid, events$: this.sync$ });
  }

  public componentDidMount() {
    // Setup syncer.
    const dir = constants.DB.DIR;
    const db = this.databases(dir);
    const grid = this.datagrid.grid;
    const events$ = this.sync$;
    this.sync = Sync.create({ db, grid, events$ });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
    this.sync.dispose();
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
      <CommandShell cli={this.cli} tree={tree} localStorage={true}>
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
        width: 300,
        padding: 8,
        backgroundColor: color.format(-0.03),
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        Scroll: true,
      }),
    };

    const data = { ...this.state };
    delete data.showDebug;
    if (data.db && data.db.cells) {
      const cells = value.deleteEmpty(data.db.cells);
      Object.keys(cells).forEach(key => {
        const MAX = 15;
        const value = cells[key];
        if (typeof value === 'string' && value.length > MAX) {
          cells[key] = `${value.substring(0, MAX).trim()}...`;
        }
      });
      data.db.cells = cells;
    }

    return (
      <div {...styles.base}>
        <ObjectView name={'state'} data={data} expandLevel={2} />
      </div>
    );
  }

  private renderGrid() {
    return (
      <datagrid.DataGrid
        ref={this.datagridRef}
        values={this.state.values}
        events$={this.grid$}
        factory={this.factory}
        initial={{ selection: 'A1' }}
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
        return formatValue(req.value);

      default:
        console.log(`Factory type '${req.type}' not supported by test.`);
        return null;
    }
  };
}

/**
 * [Helpers]
 */
function formatValue(value: datagrid.CellValue) {
  value = typeof value === 'string' && !value.startsWith('=') ? markdown.toHtmlSync(value) : value;
  value = typeof value === 'object' ? JSON.stringify(value) : value;
  return value;
}
