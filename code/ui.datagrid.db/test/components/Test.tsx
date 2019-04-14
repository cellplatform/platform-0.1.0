import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { markdown, datagrid, color, Shell, t, ObjectView, css, renderer } from '../common';
import * as cli from '../cli';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private grid$ = new Subject<t.GridEvent>();
  private cli!: t.ICommandState;

  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.cli = cli.init({ state$: this.state$, databases: this.databases });
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
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
      right: css({
        width: 250,
        padding: 8,
        backgroundColor: color.format(-0.03),
        borderLeft: `solid 1px ${color.format(-0.1)}`,
      }),
    };
    return (
      <Shell cli={this.cli} tree={{}}>
        <div {...styles.base}>
          <div {...styles.left}>{this.renderGrid()}</div>
          <div {...styles.right}>
            <ObjectView name={'state'} data={this.state} />
          </div>
        </div>
      </Shell>
    );
  }

  private renderGrid() {
    return (
      <datagrid.DataGrid
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
