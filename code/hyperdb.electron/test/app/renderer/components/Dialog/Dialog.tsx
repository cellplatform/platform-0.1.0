import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, value } from '../../common';
import { Button } from '../primitives';

export type IDialogProps = {
  children?: React.ReactNode;
  style?: GlamorValue;
  padding?: number;
  onClose?: (e: {}) => void;
};
export type IDialogState = {};

export class Dialog extends React.PureComponent<IDialogProps, IDialogState> {
  public state: IDialogState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<IDialogState>();

  /**
   * [Lifecycle]
   */

  constructor(props: IDialogProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */

  public render() {
    const PADDING = value.defaultValue(this.props.padding, 15);
    const styles = {
      base: css({
        Absolute: 0,
      }),
      bg: css({
        Absolute: 0,
        cursor: 'pointer',
      }),
      body: css({
        Absolute: PADDING,
        boxSizing: 'border-box',
        backgroundColor: color.format(0.95),
        border: `solid 1px ${color.format(-0.15)}`,
        borderRadius: 4,
        boxShadow: `0 2px 15px 0 ${color.format(-0.2)}`,
        display: 'flex',
        overflow: 'hidden',
      }),
      close: css({
        Absolute: [8, 5, null, null],
        fontSize: 14,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.bg} onClick={this.handleClick} />
        <div {...styles.body}>
          {this.props.children}
          <Button label={'close'} onClick={this.closeClick} style={styles.close} />
        </div>
      </div>
    );
  }

  /**
   * HANDLERS
   */
  private fireClose = () => {
    const { onClose } = this.props;
    if (onClose) {
      onClose({});
    }
  };
  private handleClick = () => this.fireClose();
  private closeClick = () => this.fireClose();
}
