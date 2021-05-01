import React from 'react';

import { color, css, CssValue, defaultValue, style, t } from '../../common';

export type CardProps = {
  children?: React.ReactNode;
  background?: number | string;
  border?: { color?: number | string; radius?: number };
  padding?: t.CssEdgesInput;
  margin?: t.CssEdgesInput;
  width?: number | { fixed?: number; min?: number; max?: number };
  height?: number | { fixed?: number; min?: number; max?: number };
  userSelect?: string | boolean;
  shadow?: boolean | t.CssShadow;
  style?: CssValue;

  onClick?: React.MouseEventHandler;
  onDoubleClick?: React.MouseEventHandler;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const background = defaultValue(props.background, 1);
  const borderColor = defaultValue(props.border?.color, -0.2);

  const shadow = toShadow(props.shadow);
  const width = typeof props.width === 'number' ? { fixed: props.width } : props.width;
  const height = typeof props.height === 'number' ? { fixed: props.height } : props.height;

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      display: 'inline-block',
      userSelect: toUserSelect(props.userSelect),

      border: `solid 1px ${color.format(borderColor)}`,
      borderRadius: defaultValue(props.border?.radius, 4),
      background: color.format(background),
      boxShadow: style.toShadow(shadow),

      width: width?.fixed,
      height: height?.fixed,
      minWidth: defaultValue(width?.min, 10),
      minHeight: defaultValue(height?.min, 10),
      maxWidth: width?.max,
      maxHeight: height?.max,

      ...style.toMargins(props.margin),
      ...style.toPadding(props.padding),
    }),
  };

  return (
    <div
      ref={ref}
      {...css(styles.base, props.style)}
      onDoubleClick={props.onDoubleClick}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      {props.children}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * [Helpers]
 */

function toUserSelect(value: CardProps['userSelect']) {
  value = defaultValue(value, false);
  value = value === true ? 'auto' : value;
  value = value === false ? 'none' : value;
  return value as React.CSSProperties['userSelect'];
}

function toShadow(value: CardProps['shadow']): t.CssShadow | undefined {
  if (value === false) return undefined;
  if (value === true || value === undefined) return { y: 2, color: -0.08, blur: 6 };
  return value;
}
