import * as React from 'react';
import { css, color, GlamorValue } from '../../common';

export type IDividerProps = {
  height: number;
  left?: number;
  marginY?: number;
  style?: GlamorValue;
};

export class Divider extends React.PureComponent<IDividerProps> {
  /**
   * [Render]
   */
  public render() {
    const { height, left: marginLeft, marginY = 2 } = this.props;
    const styles = {
      base: css({
        paddingLeft: marginLeft,
      }),
      line: css({
        borderLeft: `solid 3px ${color.format(-0.1)}`,
        height: height - marginY * 2,
        MarginY: marginY,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.line} />
      </div>
    );
  }
}
