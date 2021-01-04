import * as React from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { css, CssValue, onStateChanged, t, ui, Uri } from '../../common';
import { Grid } from '../Grid';
import { WindowTitleBar } from '../primitives';
import { Sidebar } from '../Sidebar';

export type IRootProps = { style?: CssValue };
export type IRootState = t.Object;

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<void>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    // Redraw.
    changes
      .on('APP:SHEET/ns')
      .pipe(
        map((e) => e.to),
        distinctUntilChanged((prev, next) => prev.ns === next.ns),
      )
      .subscribe(() => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  public get ns() {
    const state = this.context.getState();
    return state.ns;
  }

  private get uri() {
    const uri = this.ns ? Uri.toNs(this.ns).toString() : '';
    return uri;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
      }),
      titlebar: css({
        Absolute: [0, 0, null, 0],
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={this.uri} />
        {this.renderBody()}
      </div>
    );
  }

  private renderBody() {
    const ns = this.ns;
    if (!ns) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        Flex: 'horizontal-stretch-stretch',
        overflow: 'hidden',
      }),
      grid: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
      }),
      panel: css({
        position: 'relative',
        width: 250,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.grid}>
          <Grid style={{ Absolute: 0 }} />
        </div>
        <div {...styles.panel}>
          <Sidebar />
        </div>
      </div>
    );
  }
}
