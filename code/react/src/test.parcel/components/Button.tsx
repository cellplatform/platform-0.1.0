import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, CssValue } from '../common';

export type IButtonProps = {
  label: string;
  style?: CssValue;
  onClick?: (e: {}) => void;
};
export type IButtonState = {};

export class Button extends React.PureComponent<IButtonProps, IButtonState> {
  public state: IButtonState = {};
  private state$ = new Subject<Partial<IButtonState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IButtonProps) {
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
    const styles = {
      base: css({
        display: 'inline-flex',
        color: COLORS.BLUE,
        cursor: 'pointer',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)} onClick={this.props.onClick}>
        {this.props.label}
      </div>
    );
  }
}
