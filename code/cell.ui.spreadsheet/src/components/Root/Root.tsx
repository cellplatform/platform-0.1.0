import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, map } from 'rxjs/operators';
import { css, CssValue, color, t, ui, onStateChanged, Uri } from '../../common';
import { WindowTitleBar } from '../primitives';
import { Grid } from '../Grid';
import { Panel } from '../Panel';

export type IRootProps = { style?: CssValue };
export type IRootState = {};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
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
    try {
      const uri = this.ns ? Uri.toNs(this.ns).toString() : '';
      return uri;
    } catch (error) {
      console.log('ROOT/URI Error: ', error.message);
      return '';
    }
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
      }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
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
      }),
      grid: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
      }),
      panel: css({
        position: 'relative',
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        width: 250,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.grid}>
          <Grid style={{ Absolute: 0 }} />
        </div>
        <div {...styles.panel}>
          <Panel />
        </div>
      </div>
    );
  }
}
