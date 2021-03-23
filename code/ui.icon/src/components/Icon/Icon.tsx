import * as React from 'react';
import { css, color as colorUtil } from '@platform/css';
import { t } from '../../common';

type IReactIconBase = { size: number; color?: string };

export type IconBase = React.FC<IReactIconBase>;
type IconPropsInternal = t.IIconProps & {
  type: IconBase;
  tabIndex?: number;
  isGreyscale?: boolean;
};

export const Icon = {
  renderer(type: IconBase): t.IIcon {
    return (props: t.IIconProps) => <IconView type={type} {...props} />; // eslint-disable-line
  },
};

/**
 * Internal
 */

const IconView: React.FC<IconPropsInternal> = (props) => {
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

function formatColor(props: IconPropsInternal) {
  const { color = -0.4, isGreyscale } = props;
  let result = colorUtil.format(color);
  if (isGreyscale) {
    result = colorUtil.create(result).greyscale().toHexString();
  }
  return result;
}
