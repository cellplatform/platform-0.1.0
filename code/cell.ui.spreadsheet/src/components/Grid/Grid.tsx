import * as React from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { CssValue, onStateChanged, t, ui } from '../../common';
import { GridView } from './Grid.View';

export type IGridProps = { grid$?: Subject<t.GridEvent>; style?: CssValue };
export type IGridState = { ns?: string };

export class Grid extends React.PureComponent<IGridProps, IGridState> {
  public state: IGridState = {};
  private state$ = new Subject<Partial<IGridState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    // Create the grid for the namespace.
    changes
      .on('APP:SHEET/ns')
      .pipe(
        map((e) => e.to),
        distinctUntilChanged((prev, next) => prev.ns === next.ns && prev.host === next.host),
      )
      .subscribe((e) => this.updateState());

    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  public updateState() {
    const ns = this.context.getState().ns || '';
    this.state$.next({ ns });
  }

  /**
   * [Render]
   */
  public render() {
    const ns = this.state.ns;
    if (ns) {
      const { grid$, style } = this.props;
      return <GridView key={ns} ns={ns} grid$={grid$} style={style} />;
    } else {
      return null;
    }
  }
}
