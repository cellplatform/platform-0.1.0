import React from 'react';
import { color, css, CssValue, Style, t } from '../../common';

/**
 * Types
 */
export type CardProps = {
  children?: React.ReactNode;
  background?: number | string;
  showAsCard?: boolean;
  padding?: t.CssEdgesInput; // NB: padding is dropped if "NOT" showing as card.
  margin?: t.CssEdgesInput;
  border?: { color?: number | string; radius?: number | string };
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

/**
 * Component
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { background = 1, showAsCard = true } = props;
  const borderColor = props.border?.color ?? -0.2;

  const shadow = toShadow(props.shadow);
  const width = typeof props.width === 'number' ? { fixed: props.width } : props.width;
  const height = typeof props.height === 'number' ? { fixed: props.height } : props.height;

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      userSelect: toUserSelect(props.userSelect),

      width: width?.fixed,
      height: height?.fixed,
      minWidth: width?.min ?? 10,
      minHeight: height?.min ?? 10,
      maxWidth: width?.max,
      maxHeight: height?.max,

      ...Style.toMargins(props.margin),
    }),
    card: css({
      border: `solid 1px ${color.format(borderColor)}`,
      borderRadius: props.border?.radius ?? 4,
      background: color.format(background),
      boxShadow: Style.toShadow(shadow),
      ...Style.toPadding(props.padding),
    }),
  };

  return (
    <div
      ref={ref}
      {...css(styles.base, showAsCard ? styles.card : undefined, props.style)}
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
  value = value ?? false;
  value = value === true ? 'auto' : value;
  value = value === false ? 'none' : value;
  return value as React.CSSProperties['userSelect'];
}

function toShadow(value: CardProps['shadow']): t.CssShadow | undefined {
  if (value === false) return undefined;
  if (value === true || value === undefined) return { y: 2, color: -0.08, blur: 6 };
  return value;
}
