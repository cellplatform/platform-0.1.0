import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t } from '../../common';

export type IShellProps = {
  theme?: t.ShellTheme;
  style?: GlamorValue;
};
export type IShellState = {};

export class Shell extends React.PureComponent<IShellProps, IShellState> {
  public state: IShellState = {};
  private state$ = new Subject<Partial<IShellState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IShellProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
        Absolute: 0, // TEMP 🐷
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Shell</div>
      </div>
    );
  }
}
