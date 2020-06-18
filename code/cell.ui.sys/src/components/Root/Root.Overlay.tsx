import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, ui, onStateChanged } from '../../common';
import { Button, Icons } from '../primitives';
import { Windows } from '../Windows';

export type IRootOverlayProps = { style?: CssValue };
export type IRootOverlayState = {};

export class RootOverlay extends React.PureComponent<IRootOverlayProps, IRootOverlayState> {
  public state: IRootOverlayState = {};
  private state$ = new Subject<Partial<IRootOverlayState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const ctx = this.context;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    const changes = onStateChanged(ctx.event$, this.unmounted$);
    changes.on('APP:SYS/overlay').subscribe(() => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
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

  /**
   * [Handlers]
   */

  private onCloseOverlay = () => {
    this.context.fire({ type: 'APP:SYS/overlay', payload: { overlay: undefined } });
  };
}
