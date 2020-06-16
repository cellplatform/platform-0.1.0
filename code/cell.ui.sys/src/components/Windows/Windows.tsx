import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue } from '../../common';

export type IWindowsProps = { uri: string; style?: CssValue };
export type IWindowsState = {};

export class Windows extends React.PureComponent<IWindowsProps, IWindowsState> {
  public state: IWindowsState = {};
  private state$ = new Subject<Partial<IWindowsState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IWindowsProps) {
    super(props);
  }

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
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Windows: {this.props.uri}</div>
      </div>
    );
  }
}
