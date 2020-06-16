import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, ui, onStateChanged } from '../../common';
import { AppClickEvent, Apps } from '../Apps';
import { Installer } from '../Installer';
import { WindowTitleBar, Button, Icons } from '../primitives';
import { Server } from './Server';
import { tmpRoot } from '../../_tmp/tmp.Root';
import { Windows } from '../Windows';

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
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  private temp = async () => tmpRoot(this.context);

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: color.format(1),
      }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
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
          <div {...styles.temp}>
            <Button onClick={this.temp}>Temp</Button>
          </div>
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
    };
    return (
      <div {...styles.base}>
        {this.renderOverlayBody(overlay)}
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
        width: 250,
        paddingTop: TOP_MARGIN,
        paddingLeft: EDGE_MARGIN,
        paddingRight: EDGE_MARGIN,
        paddingBottom: 80,
        Scroll: true,
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
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <Apps onAppClick={this.onAppClick} />
        </div>
        <div {...styles.center}>{this.renderCenter()}</div>
        <div {...styles.right}>
          <Server />
        </div>
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
      }),
    };

    return (
      <div {...styles.base}>
        {this.renderMargin({ edge: 'LEFT' })}
        {this.renderMargin({ edge: 'RIGHT' })}
        <div {...styles.body}>
          <Installer />
        </div>
      </div>
    );
  }

  private renderMargin(props: { edge?: 'LEFT' | 'RIGHT' } = {}) {
    const MARGIN_LEFT = 0;
    const { edge = 'LEFT' } = props;
    const isLeft = edge === 'LEFT';
    const isRight = edge === 'RIGHT';
    const styles = {
      base: css({
        Absolute: [0, isRight ? 0 : null, 0, isLeft ? 0 : null],
      }),
      margin: css({
        Absolute: [0, null, 0, 0],
        borderLeft: `solid 1px #EF3469`,
        opacity: 0.4,
      }),
      margin1: css({ left: MARGIN_LEFT }),
      margin2: css({ left: MARGIN_LEFT + (isLeft ? 2 : -2) }),
    };
    return (
      <div {...styles.base}>
        <div {...css(styles.margin, styles.margin1)} />
        <div {...css(styles.margin, styles.margin2)} />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private onAppClick = (e: AppClickEvent) => {
    // this.state$.next({ json: e.app });
  };

  private onCloseOverlay = () => {
    this.context.fire({ type: 'APP:SYS/overlay', payload: { overlay: undefined } });
  };
}
