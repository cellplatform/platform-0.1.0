import * as React from 'react';
import { color, COLORS, css, CssValue } from '../common';

export type IFooProps = { title?: string; style?: CssValue };

export class Foo extends React.PureComponent<IFooProps> {
  public render() {
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        border: `dashed 1px ${color.format(-0.1)}`,
        borderRadius: 5,
        boxSizing: 'border-box',
        padding: 8,
      }),
      label: css({
        fontSize: 14,
        color: COLORS.DARK,
      }),
    };
    const { title = 'Untitled' } = this.props;
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.label}>{title}</div>
      </div>
    );
  }
}
