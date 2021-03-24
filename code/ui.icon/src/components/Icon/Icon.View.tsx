import * as React from 'react';
import { css, color as colorUtil } from '@platform/css';
import { t } from '../../common';

export type IconProps = { size: number; color?: string };
export type IconComponent = React.FC<IconProps>;

export type IconViewProps = t.IIconProps & {
  type: IconComponent;
  tabIndex?: number;
  isGreyscale?: boolean;
};

export const IconView: React.FC<IconViewProps> = (props) => {
  const { size = 24, opacity } = props;
  const Component = props.type;

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
      {...css(styles.base, props.style)}
      tabIndex={props.tabIndex}
      onClick={props.onClick}
      onDoubleClick={props.onDoubleClick}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      <Component size={size} color={formatColor(props)} />
    </div>
  );
};

/**
 * Helpers
 */

function formatColor(props: IconViewProps) {
  const { color = -0.4, isGreyscale } = props;
  let result = colorUtil.format(color);
  if (isGreyscale) {
    result = colorUtil.create(result).greyscale().toHexString();
  }
  return result;
}
