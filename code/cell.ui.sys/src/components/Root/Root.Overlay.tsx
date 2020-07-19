import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { color, css, CssValue, events, onStateChanged, t, ui } from '../../common';
import { Button, Icons } from '../primitives';

export type IRootOverlayProps = { factory: t.RenderOverlay; style?: CssValue };
export type IRootOverlayState = t.Object;

export class RootOverlay extends React.PureComponent<IRootOverlayProps, IRootOverlayState> {
  public state: IRootOverlayState = {};
  private state$ = new Subject<Partial<IRootOverlayState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const ctx = this.context;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const keyPress$ = events.keyPress$.pipe(takeUntil(this.unmounted$));

    const changes = onStateChanged(ctx.event$, this.unmounted$);
    changes.on('APP:SYS/overlay').subscribe(() => this.forceUpdate());

    keyPress$
      .pipe(
        filter((e) => e.isPressed && !e.isModifier),
        filter((e) => e.code === 'Escape'),
        filter((e) => Boolean(this.overlay)),
      )
      .subscribe((e) => this.hide());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.context.getState();
  }

  public get overlay() {
    return this.store.overlay;
  }

  /**
   * [Methods]
   */
  public hide = () => {
    this.context.fire({
      type: 'APP:SYS/overlay',
      payload: { overlay: undefined },
    });
  };

  /**
   * [Render]
   */
  public render() {
    const overlay = this.overlay;
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
        <div {...styles.body}>{this.renderBody(overlay)}</div>
        <Button style={styles.closeButton} onClick={this.hide}>
          <Icons.Close />
        </Button>
      </div>
    );
  }

  private renderBody(overlay: t.IAppStateOverlay) {
    return this.props.factory(overlay) || this.renderNotFound(overlay);
  }

  private renderNotFound(overlay: t.IAppStateOverlay) {
    const styles = { base: css({ flex: 1, Flex: 'center-center' }) };
    return (
      <div {...styles.base}>
        <div>Overlay not found: {overlay.kind}</div>
      </div>
    );
  }
}
