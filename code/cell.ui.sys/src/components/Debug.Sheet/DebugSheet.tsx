import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, ui } from '../../common';

export type IDebugSheetProps = { style?: CssValue };
export type IDebugSheetState = t.Object;

export class DebugSheet extends React.PureComponent<IDebugSheetProps, IDebugSheetState> {
  public state: IDebugSheetState = {};
  private state$ = new Subject<Partial<IDebugSheetState>>();
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
      base: css({
        Absolute: 0,
        backgroundColor: color.format(1),
        padding: 20,
        boxSizing: 'border-box',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>DebugSheet</div>
      </div>
    );
  }
}
