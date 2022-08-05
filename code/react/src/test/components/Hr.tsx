import * as React from 'react';
import { color as colorUtil, css, style, CssValue, COLORS } from '../common';
import { CssEdgesInput } from '@platform/css/lib/types';

export type IHrProps = {
  color?: string | number | 'PINK' | 'CYAN';
  margin?: CssEdgesInput;
  dashed?: boolean;
  opacity?: number;
  thickness?: number;
  style?: CssValue;
};

export class Hr extends React.PureComponent<IHrProps> {
  /**
   * [Static]
   */
  public static Dashed(props: IHrProps) {
    return <Hr dashed={true} opacity={0.3} {...props} />;
  }
  public static Pink(props: IHrProps) {
    return <Hr color={'PINK'} opacity={0.4} {...props} />;
  }
  public static PinkDashed(props: IHrProps) {
    return <Hr.Pink dashed={true} opacity={0.5} {...props} />;
  }
  public static Cyan(props: IHrProps) {
    return <Hr color={'CYAN'} opacity={0.7} {...props} />;
  }
  public static CyanDashed(props: IHrProps) {
    return <Hr.Cyan dashed={true} opacity={1} {...props} />;
  }

  /**
   * [Render]
   */
  public render() {
    const { dashed } = this.props;
    const thickness = this.props.thickness === undefined ? 1 : this.props.thickness;
    const opacity = this.props.opacity === undefined ? 0.1 : this.props.opacity;
    const margin: CssEdgesInput = this.props.margin === undefined ? [20, 0] : this.props.margin;

    let color = this.props.color;
    color = color === 'PINK' ? COLORS.PINK : color;
    color = color === 'CYAN' ? COLORS.CYAN : color;
    color = colorUtil.format(color || -1);

    const styles = {
      base: css({
        ...style.toMargins(margin),
        border: 'none',
        borderBottom: `${dashed ? 'dashed' : 'solid'} ${thickness}px ${color}`,
        opacity,
      }),
    };
    return <hr {...css(styles.base, this.props.style)} />;
  }
}
