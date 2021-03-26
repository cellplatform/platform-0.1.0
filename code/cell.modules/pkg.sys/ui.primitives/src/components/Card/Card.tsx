import React from 'react';
import { color, css, CssValue, defaultValue, t, style } from '../../common';

export type CardProps = {
  children?: React.ReactNode;
  background?: number | string;
  borderColor?: number | string;
  borderRadius?: number;
  padding?: t.CssEdgesInput;
  margin?: t.CssEdgesInput;
  minWidth?: number;
  minHeight?: number;
  userSelect?: string | boolean;
  style?: CssValue;
  onClick?: React.MouseEventHandler;
  onDoubleClick?: React.MouseEventHandler;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

export const Card: React.FC<CardProps> = (props) => {
  const background = defaultValue(props.background, 1);
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      display: 'inline-block',
      border: `solid 1px ${color.format(defaultValue(props.borderColor, -0.2))}`,
      borderRadius: defaultValue(props.borderRadius, 4),
      background: color.format(background),
      userSelect: toUserSelect(props.userSelect),
      minWidth: defaultValue(props.minWidth, 10),
      minHeight: defaultValue(props.minHeight, 10),
      boxShadow: `0 2px 6px 0 ${color.format(-0.08)}`,
      ...style.toMargins(props.margin),
      ...style.toPadding(props.padding),
    }),
  };

  return (
    <div
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
};

/**
 * [Helpers]
 */

function toUserSelect(value: CardProps['userSelect']) {
  value = defaultValue(value, false);
  value = value === true ? 'auto' : value;
  value = value === false ? 'none' : value;
  return value as React.CSSProperties['userSelect'];
}
