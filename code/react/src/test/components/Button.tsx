import * as React from 'react';
import { COLORS, css, CssValue } from '../common';

export type ButtonProps = {
  label: string;
  style?: CssValue;
  onClick?: () => void;
};

export class Button extends React.PureComponent<ButtonProps> {
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
