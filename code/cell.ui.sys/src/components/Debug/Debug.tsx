import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t, ui } from '../../common';
import { DebugLog } from '../DebugLog';

export type IDebugProps = { style?: CssValue };
export type IDebugState = {};

export class Debug extends React.PureComponent<IDebugProps, IDebugState> {
  public state: IDebugState = {};
  private state$ = new Subject<Partial<IDebugState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
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
    const styles = {
      base: css({ Absolute: 0 }),
    };

    const event$ = ctx.env.event$;

    return (
      <div {...css(styles.base, this.props.style)}>
        <DebugLog event$={event$} style={{ Absolute: 0 }} />
      </div>
    );
  }
}
