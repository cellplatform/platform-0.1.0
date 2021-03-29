import React from 'react';

import { color, css, defaultValue, R, t } from '../../common';
import { SwitchTheme } from './SwitchTheme';

export type SwitchThumbProps = {
  thumb: Partial<t.ISwitchThumb>;
  switch: {
    isLoaded: boolean;
    isEnabled: boolean;
    value: boolean;
    theme: t.ISwitchTheme;
    width: number;
    height: number;
    transitionSpeed: number;
  };
};

export const SwitchThumb: React.FC<SwitchThumbProps> = (props) => {
  const parent = props.switch;
  const { isEnabled, isLoaded, value: on } = parent;
  const thumb = toThumb(parent.theme, props.thumb, parent);

  const themeColor = color.format(
    isEnabled ? (on ? thumb.color.on : thumb.color.off) : thumb.color.disabled,
  );

  const { width, height } = thumb;
  const x = on ? parent.width - (width + thumb.xOffset) : 0 + thumb.xOffset;
  const y = thumb.yOffset;

  const speed = `${props.switch.transitionSpeed}ms`;
  const transition = `left ${speed}, background-color ${speed}`;

  const styles = {
    base: css({
      Absolute: [y, null, null, x],
      cursor: isEnabled ? 'pointer' : 'undefined',
      width,
      height,
      boxSizing: 'border-box',
      borderRadius: thumb.borderRadius,
      backgroundColor: themeColor,
      transition: isLoaded ? transition : undefined,
      boxShadow: SwitchTheme.toShadowCss(thumb.shadow),
    }),
  };

  return <div {...styles.base} />;
};

/**
 * [Helpers]
 */

function toThumb(
  theme: t.ISwitchTheme,
  thumb: Partial<t.ISwitchThumb>,
  parent: { width: number; height: number },
): t.ISwitchThumb {
  const offset = {
    x: defaultValue(thumb.xOffset, 2),
    y: defaultValue(thumb.yOffset, 2),
  };

  const height = parent.height - offset.y * 2;
  const width = height;

  const defaultThumb: t.ISwitchThumb = {
    width,
    height,
    xOffset: offset.x,
    yOffset: offset.y,
    color: theme.thumbColor,
    borderRadius: height / 2,
    shadow: { x: 0, y: 2, blur: 4, color: theme.shadowColor },
  };
  const res = R.mergeDeepRight(defaultThumb, thumb) as t.ISwitchThumb;
  return R.clone(res);
}
