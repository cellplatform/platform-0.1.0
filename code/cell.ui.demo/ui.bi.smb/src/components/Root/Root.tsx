import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, onStateChanged, t, ui, color } from '../../common';
import { WindowTitleBar } from '../primitives';
import { FinderShell } from '../primitives';

export type IRootProps = { style?: CssValue };
export type IRootState = { FinderProvider?: React.FunctionComponent };

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
    this.state$.next({ FinderProvider: FinderShell.createContext(ctx.env).Provider });

    changes
      .on('APP:ui.bi.smb/error')
      .pipe()
      .subscribe(() => this.forceUpdate());
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
    };

    const uri = 'BI ("Business Intilligence")';

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        {this.renderFinder()}
      </div>
    );
  }

  private renderFinder() {
    const Provider = this.state.FinderProvider;
    if (!Provider) {
      return null;
    }
    const styles = {
      base: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        display: 'flex',
      }),
    };
    return (
      <Provider>
        <FinderShell style={styles.base} />
      </Provider>
    );
  }
}
