import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, events, t, ui } from '../../common';
import { Apps } from '../AppBuilder.Apps';
import { HelpersCard } from './Card.Helpers';
import { ServerCard } from './Card.Server';

export type IAppBuilderProps = { style?: CssValue };
export type IAppBuilderState = {};

export class AppBuilder extends React.PureComponent<IAppBuilderProps, IAppBuilderState> {
  public state: IAppBuilderState = {};
  private state$ = new Subject<Partial<IAppBuilderState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    // const changes = onStateChanged(ctx.event$, this.unmounted$);
    // changes.on('').subscribe(() => this.forceUpdate());

    // Bubble window resize.
    events.resize$.pipe(takeUntil(this.unmounted$)).subscribe((e) => {
      ctx.fire({
        type: 'UI:DOM/window/resize',
        payload: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const TOP_MARGIN = 25;
    const EDGE_MARGIN = 30;
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
        backgroundColor: color.format(1),
      }),
      left: css({
        position: 'relative',
        width: 250,
        paddingTop: TOP_MARGIN,
        paddingLeft: EDGE_MARGIN,
        paddingRight: EDGE_MARGIN,
        paddingBottom: 80,
        backgroundColor: color.format(-0.06),
      }),
      center: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
      }),
      right: css({
        position: 'relative',
        width: 250,
        paddingTop: TOP_MARGIN,
        paddingLeft: EDGE_MARGIN,
        paddingRight: EDGE_MARGIN,
        backgroundColor: color.format(-0.06),
      }),
    };

    return (
      <div {...styles.base} onDragOver={this.onDragOver}>
        <div {...styles.left}>{this.renderLeft()}</div>
        <div {...styles.center}>{this.renderCenter()}</div>
        <div {...styles.right}>{this.renderRight()} </div>
      </div>
    );
  }

  private renderLeft() {
    return <Apps />;
  }

  private renderCenter() {
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        backgroundColor: color.format(1),
      }),
      body: css({
        Absolute: 0,
        overflow: 'auto',
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        borderRight: `solid 1px ${color.format(-0.1)}`,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <div />
          {/* <Installer /> */}
        </div>
      </div>
    );
  }

  private renderRight() {
    const styles = {
      server: css({ marginBottom: 15 }),
      helpers: css({}),
    };
    return (
      <React.Fragment>
        <ServerCard style={styles.server} />
        <HelpersCard style={styles.helpers} />
      </React.Fragment>
    );
  }

  /**
   * Handlers
   */
  private onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // NB: Suppress "drag/drop" icon
  };
}
