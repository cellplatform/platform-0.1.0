import * as React from 'react';
import { css, color as colorUtil, mouse } from '../../common';
import * as types from './types';

type IReactIconBase = {
  size: number;
  color?: string;
};

export type IconBase = React.StatelessComponent<IReactIconBase>;
type IIconPropsInternal = types.IIconProps & {
  type: IconBase;
  tabIndex?: number;
  isGreyscale?: boolean;
};

/**
 * An individual SVG icon.
 */
export class Icon extends React.PureComponent<IIconPropsInternal> {
  public static renderer = (type: IconBase): types.IIcon => {
    return (props: types.IIconProps) => <Icon type={type} {...props} />;
  };

  private mouse = mouse.fromProps(this.props);

  public get color() {
    const { color = -0.4, isGreyscale } = this.props;
    let result = colorUtil.format(color);
    if (isGreyscale) {
      result = colorUtil
        .create(result)
        .greyscale()
        .toHexString();
    }
    return result;
  }

  public render() {
    const { size = 24, opacity } = this.props;
    const Icon = this.props.type;
    const styles = {
      base: css({
        display: 'inline-block',
        opacity: opacity === undefined ? 1 : opacity,
        width: size,
        height: size,
        overflow: 'hidden',
      }),
    };
    return (
      <div
        {...css(styles.base, this.props.style)}
        tabIndex={this.props.tabIndex}
        {...this.mouse.events}
      >
        <Icon size={size} color={this.color} />
      </div>
    );
  }
}
