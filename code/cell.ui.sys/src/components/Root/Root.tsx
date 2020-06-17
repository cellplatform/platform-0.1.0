import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, events, onStateChanged, t, ui } from '../../common';
import { Apps } from '../Apps';
import { Installer } from '../Installer';
import { Button, Icons, WindowTitleBar } from '../primitives';
import { Windows } from '../Windows';
import { Server } from './Server';
import { Helpers } from './Helpers';

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

    changes.on('APP:SYS/overlay').subscribe(() => this.forceUpdate());

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
    const styles = {
      base: css({
        Absolute: 0,
      }),
      titlebar: css({
        Absolute: [0, 0, null, 0],
      }),
      body: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        display: 'flex',
      }),
      temp: css({
        Absolute: [5, 5, null, null],
      }),
    };

    const ctx = this.context;
    const uri = ctx.def;

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        <div {...styles.body}>
          {this.renderBody()}
          {this.renderOverlay()}
        </div>
      </div>
    );
  }

  private renderOverlay() {
    const ctx = this.context;
    const state = ctx.getState();
    const overlay = state.overlay;
    if (!overlay) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: 10,
        backgroundColor: color.format(1),
        border: `solid 1px ${color.format(-0.2)}`,
        borderRadius: 3,
        boxShadow: `0 2px 8px 0 ${color.format(-0.2)}`,
      }),
      closeButton: css({
        Absolute: [5, 5, null, null],
      }),
      body: css({
        Absolute: 0,
        display: 'flex',
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.body}>{this.renderOverlayBody(overlay)}</div>
        <Button style={styles.closeButton} onClick={this.onCloseOverlay}>
          <Icons.Close />
        </Button>
      </div>
    );
  }

  private renderOverlayBody(overlay: t.IAppStateOverlay) {
    switch (overlay.kind) {
      case 'WINDOWS':
        return <Windows uri={overlay.uri} />;
      default:
        return null;
    }
  }

  private renderBody() {
    const TOP_MARGIN = 25;
    const EDGE_MARGIN = 30;
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      left: css({
        width: 230,
        paddingTop: TOP_MARGIN,
        paddingLeft: EDGE_MARGIN,
        paddingRight: EDGE_MARGIN,
        paddingBottom: 80,
        Scroll: true,
        backgroundColor: color.format(-0.1),
      }),
      center: css({
        flex: 1,
        display: 'flex',
      }),
      right: css({
        width: 250,
        paddingTop: TOP_MARGIN,
        paddingLeft: EDGE_MARGIN,
        paddingRight: EDGE_MARGIN,
        backgroundColor: color.format(-0.1),
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <Apps />
        </div>
        <div {...styles.center}>{this.renderCenter()}</div>
        <div {...styles.right}>{this.renderRight()} </div>
      </div>
    );
  }

  private renderCenter() {
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
      }),
      body: css({
        Absolute: 0,
        overflow: 'auto',
        paddingTop: 30,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        borderRight: `solid 1px ${color.format(-0.1)}`,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <Installer />
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
        <Server style={styles.server} />
        <Helpers style={styles.helpers} />
      </React.Fragment>
    );
  }

  /**
   * [Handlers]
   */

  private onCloseOverlay = () => {
    this.context.fire({ type: 'APP:SYS/overlay', payload: { overlay: undefined } });
  };
}
