import * as React from 'react';

import { color, COLORS, style, css, CssValue, defaultValue, t } from '../../common';

export type HrProps = {
  color?: string | number | 'MAGENTA' | 'CYAN';
  margin?: t.CssEdgesInput;
  dashed?: boolean;
  opacity?: number;
  thickness?: number;
  style?: CssValue;
};

export class Hr extends React.PureComponent<HrProps> {
  /**
   * [Static]
   */
  public static Dashed(props: HrProps) {
    return <Hr dashed={true} opacity={0.3} {...props} />;
  }
  public static Pink(props: HrProps) {
    return <Hr color={'PINK'} opacity={0.4} {...props} />;
  }
  public static PinkDashed(props: HrProps) {
    return <Hr.Pink dashed={true} opacity={0.5} {...props} />;
  }
  public static Cyan(props: HrProps) {
    return <Hr color={'CYAN'} opacity={0.7} {...props} />;
  }
  public static CyanDashed(props: HrProps) {
    return <Hr.Cyan dashed={true} opacity={1} {...props} />;
  }

  /**
   * [Render]
   */
  public render() {
    const props = this.props;
    const { dashed } = props;
    const thickness = defaultValue(props.thickness, 1);
    const opacity = defaultValue(props.opacity, 1);
    const margin = defaultValue(props.margin, [20, 0]);

    let borderColor = props.color;
    borderColor = borderColor === 'MAGENTA' ? COLORS.CLI.MAGENTA : borderColor;
    borderColor = borderColor === 'CYAN' ? COLORS.CLI.CYAN : borderColor;
    borderColor = color.format(borderColor || -1);

    const styles = {
      base: css({
        boxSizing: 'border-box',
        border: 'none',
        borderBottom: `${dashed ? 'dashed' : 'solid'} ${thickness}px ${borderColor}`,
        opacity,
        ...style.toMargins(margin),
      }),
    };

    return <hr {...css(styles.base, this.props.style)} />;
  }
}
