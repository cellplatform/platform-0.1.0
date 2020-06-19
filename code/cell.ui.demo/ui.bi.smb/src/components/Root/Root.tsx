import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, onStateChanged, t, ui, color } from '../../common';
import { WindowTitleBar } from '../primitives';
import { FinderShell } from '../primitives';

export type IRootProps = { style?: CssValue };
export type IRootState = {};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  private FinderProvider!: React.FunctionComponent<{}>;

  /**
   * [Lifecycle]
   */
  constructor(props: IRootProps) {
    super(props);
    const ctx = this.context;
    console.log('ctx', ctx);
  }

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

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
      body: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        display: 'flex',
      }),
    };

    const uri = 'BI ("Business Intilligence")';

    if (!this.FinderProvider) {
      const env = this.context.env;
      this.FinderProvider = FinderShell.createContext(env).Provider;
    }

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        <this.FinderProvider>
          <FinderShell style={styles.body} />
        </this.FinderProvider>
      </div>
    );
  }
}
