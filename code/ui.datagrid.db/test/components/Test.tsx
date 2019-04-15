import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';

import {
  markdown,
  datagrid,
  color,
  Shell,
  t,
  ObjectView,
  css,
  renderer,
  Sync,
  constants,
  value,
} from '../common';
import * as cli from '../cli';

const storage = {
  get showDebug() {
    const value = localStorage.getItem('showDebug') || 'true';
    return value === 'true';
  },
  set showDebug(value: boolean) {
    localStorage.setItem('showDebug', (value || false).toString());
  },
};

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = { showDebug: storage.showDebug };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private grid$ = new Subject<t.GridEvent>();
  private cli!: t.ICommandState;
  private sync!: Sync;

  private datagrid!: datagrid.DataGrid;
  private datagridRef = (ref: datagrid.DataGrid) => (this.datagrid = ref);

  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  /**
   * [Lifecycle]
   */
  public async componentWillMount() {
    this.cli = cli.init({
      state$: this.state$,
      databases: this.databases,
      getState: () => this.state,
    });

    // Update state.
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    // Store values in local-storage.
    state$
      .pipe(distinctUntilChanged((prev, next) => prev.showDebug === next.showDebug))
      .subscribe(e => {
        this.datagrid.redraw();
        storage.showDebug = this.state.showDebug || false;
      });

    // Setup syncer.
    const dir = constants.DB.DIR;
    const db = (await this.databases.getOrCreate({ dir, connect: false })).db;
    const grid = this.datagrid.grid;
    this.sync = Sync.create({ db, grid });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
    this.sync.dispose();
  }

  /**
   * [Properties]
   */
  public get databases() {
    return (this.context as any).databases as t.IDbFactory;
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
      <Shell cli={this.cli} tree={tree}>
        <div {...styles.base}>
          <div {...styles.left}>{this.renderGrid()}</div>
          {elRight}
        </div>
      </Shell>
    );
  }

  private renderDebug() {
    const styles = {
      base: css({
        width: 280,
        padding: 8,
        backgroundColor: color.format(-0.03),
        borderLeft: `solid 1px ${color.format(-0.1)}`,
      }),
    };

    const data = { ...this.state };
    delete data.showDebug;
    if (data['db.cells']) {
      const cells = value.deleteEmpty(data['db.cells']);
      Object.keys(cells).forEach(key => {
        const MAX = 15;
        const value = cells[key];
        if (typeof value === 'string' && value.length > MAX) {
          cells[key] = `${value.substring(0, MAX).trim()}...`;
        }
      });
      data['db.cells'] = cells;
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
        return <datagrid.CellEditor />;

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
