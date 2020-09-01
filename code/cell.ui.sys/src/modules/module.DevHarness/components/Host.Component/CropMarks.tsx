import * as React from 'react';
import { css, CssValue, defaultValue, color } from '../../common';

export type ICropMarksProps = {
  size?: number;
  margin?: number;
  color?: string | number;
  style?: CssValue;
};

export class CropMarks extends React.PureComponent<ICropMarksProps> {
  /**
   * [Properties]
   */
  private get margin() {
    return defaultValue(this.props.margin, 6);
  }

  private get size() {
    return defaultValue(this.props.size, 20);
  }

  private get color() {
    return color.format(defaultValue(this.props.color, 0.3));
  }

  /**
   * [Render]
   */
  public render() {
    const size = this.size + this.margin;
    const offset = 0 - size;

    const styles = {
      base: css({ Absolute: 0, pointerEvents: 'none' }),
      topLeft: css({ Absolute: [offset, null, null, offset] }),
      topRight: css({ Absolute: [offset, offset, null, null] }),
      bottomLeft: css({ Absolute: [null, null, offset, offset] }),
      bottomRight: css({ Absolute: [null, offset, offset, null] }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderCorner(styles.topLeft, 'E', 'S')}
        {this.renderCorner(styles.topRight, 'W', 'S')}
        {this.renderCorner(styles.bottomLeft, 'E', 'N')}
        {this.renderCorner(styles.bottomRight, 'W', 'N')}
      </div>
    );
  }

  private renderCorner(style: CssValue, x: 'W' | 'E', y: 'N' | 'S') {
    const margin = this.margin;
    const size = this.size + margin;

    const styles = {
      base: css({ width: size, height: size }),
      x: css({
        background: this.color,
        height: 1,
        Absolute: [
          y === 'N' ? 0 : null,
          x === 'E' ? margin : 0,
          y === 'S' ? 0 : null,
          x === 'W' ? margin : 0,
        ],
      }),
      y: css({
        background: this.color,
        width: 1,
        Absolute: [
          y === 'N' ? margin : 0,
          x === 'E' ? 0 : null,
          y === 'S' ? margin : 0,
          x === 'W' ? 0 : null,
        ],
      }),
    };

    return (
      <div {...css(style, styles.base)}>
        <div {...styles.x} />
        <div {...styles.y} />
      </div>
    );
  }
}
