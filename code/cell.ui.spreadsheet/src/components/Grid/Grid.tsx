import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CssValue, t } from '../../common';

import datagrid from '@platform/ui.datagrid';

import { grid, factory } from '../../test/SAMPLE'; // TEMP 🐷

export type IGridProps = { events$?: Subject<t.GridEvent>; style?: CssValue };
export type IGridState = {};

export class Grid extends React.PureComponent<IGridProps, IGridState> {
  public state: IGridState = {};
  private state$ = new Subject<Partial<IGridState>>();
  private unmounted$ = new Subject<{}>();

  private grid$ = this.props.events$ || new Subject<t.GridEvent>();

  /**
   * [Lifecycle]
   */
  constructor(props: IGridProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <datagrid.DataGrid
        grid={grid}
        factory={factory}
        events$={this.grid$}
        initial={{ selection: 'A1' }}
        style={this.props.style}
        canSelectAll={false}
      />
    );
  }
}
