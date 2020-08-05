import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t, ui } from '../../common';
import { Log } from '../Debug.Log';
import { DebugSheet } from '../Debug.Sheet';

export type IDebugProps = {
  view: 'LOG' | 'SHEET';
  style?: CssValue;
};
export type IDebugState = t.Object;

export class Debug extends React.PureComponent<IDebugProps, IDebugState> {
  public state: IDebugState = {};
  private state$ = new Subject<Partial<IDebugState>>();
  private unmounted$ = new Subject();

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
    const styles = {
      base: css({ Absolute: 0 }),
    };
    return <div {...css(styles.base, this.props.style)}>{this.renderBody()}</div>;
  }

  private renderBody() {
    const ctx = this.context;
    const { view } = this.props;

    if (view === 'SHEET') {
      // return <Sheet />;
    }

    // Default view.
    return <Log event$={ctx.env.event$} style={{ Absolute: 0 }} />;
  }
}
