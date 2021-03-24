import * as React from 'react';

import {
  color as colorUtil,
  COLORS,
  style,
  css,
  CssValue,
  defaultValue,
  t,
  value,
} from '../common';

export type IHrProps = {
  color?: string | number | 'PINK' | 'CYAN';
  margin?: t.EdgeSpacing;
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
    const thickness = value.defaultValue(this.props.thickness, 1);
    const opacity = value.defaultValue(this.props.opacity, 1);
    const margin = defaultValue(this.props.margin, [20, 0]);

    let color = this.props.color;
    color = color === 'PINK' ? COLORS.CLI.PINK : color;
    color = color === 'CYAN' ? COLORS.CLI.CYAN : color;
    console.log('color', color);
    color = colorUtil.format(color || -1);

    const styles = {
      base: css({
        boxSizing: 'border-box',
        border: 'none',
        borderBottom: `${dashed ? 'dashed' : 'solid'} ${thickness}px ${color}`,
        opacity,
        ...style.toMargins(margin),
      }),
    };
    return <hr {...css(styles.base, this.props.style)} />;
  }
}
