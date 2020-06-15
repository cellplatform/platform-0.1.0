import datagrid from '@platform/ui.datagrid';
import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, debounceTime } from 'rxjs/operators';

import { CssValue, rx, t, ui, Uri } from '../../common';
import { factory, grid } from '../../test/SAMPLE';

const NS = 'ckbehtfz40008456cnd4zm9u9';

export type IGridProps = { events$?: Subject<t.GridEvent>; style?: CssValue };
export type IGridState = {};

export class Grid extends React.PureComponent<IGridProps, IGridState> {
  public state: IGridState = {};
  private state$ = new Subject<Partial<IGridState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  private grid$ = this.props.events$ || new Subject<t.GridEvent>();

  /**
   * [Lifecycle]
   */
  constructor(props: IGridProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.load();

    const event$ = this.context.event$.pipe(takeUntil(this.unmounted$));

    rx.payload<t.ITypedSheetSyncEvent>(event$, 'SHEET/sync')
      .pipe(
        filter((e) => Uri.strip.ns(e.ns) === NS),
        debounceTime(50),
      )
      .subscribe((e) => {
        this.load();
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  public async load() {
    const ctx = this.context;

    const { client } = ctx;
    const http = client.http;

    const res = await http.ns(NS).read({ data: true });
    console.log('res', res);

    const cells = res.body.data.cells || {};
    // this
    grid.changeCells(cells);
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
