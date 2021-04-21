import { color, css, CssValue, style } from '@platform/css';
import { defaultValue } from '@platform/util.value';
import React, { useState } from 'react';

import { t } from '../common';
import { ButtonTheme } from './ButtonTheme';

export type ButtonProps = {
  id?: string;
  children?: React.ReactNode;
  label?: string;
  isEnabled?: boolean;
  block?: boolean;
  theme?: Partial<t.IButtonTheme>;
  overTheme?: Partial<t.IButtonTheme>;
  downTheme?: Partial<t.IButtonTheme>;
  margin?: t.CssEdgesInput;
  minWidth?: number;
  tooltip?: string;
  style?: CssValue;

  onClick?: React.MouseEventHandler;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

export type IButtonState = {
  isDown?: boolean;
  isOver?: boolean;
};

function toTheme(props: ButtonProps, isOver: boolean, isDown: boolean) {
  const { theme } = props;
  const overTheme = defaultValue(props.overTheme, props.theme);
  const downTheme = defaultValue(props.downTheme, overTheme);
  const current = isDown ? downTheme : isOver ? overTheme : theme;
  return ButtonTheme.merge(ButtonTheme.BASE, current || {});
}

export const Button: React.FC<ButtonProps> = (props) => {
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isDown, setIsDown] = useState<boolean>(false);

  const { block = false, minWidth } = props;
  const isEnabled = defaultValue(props.isEnabled, true);

  const theme = toTheme(props, isOver, isDown);
  const { backgroundColor: bg } = theme;
  const backgroundColor = isEnabled ? bg.enabled : bg.disabled || bg.enabled;

  const overHandler = (isOver: boolean): React.MouseEventHandler => {
    return (e) => {
      setIsOver(isOver);
      if (!isOver && isDown) setIsDown(false);
      if (isEnabled) {
        if (isOver && props.onMouseEnter) props.onMouseEnter(e);
        if (!isOver && props.onMouseLeave) props.onMouseLeave(e);
      }
    };
  };

  const downHandler = (isDown: boolean): React.MouseEventHandler => {
    return (e) => {
      setIsDown(isDown);
      if (isEnabled) {
        if (isDown && props.onMouseDown) props.onMouseDown(e);
        if (!isDown && props.onMouseUp) props.onMouseUp(e);
        if (!isDown && props.onClick) props.onClick(e);
      }
    };
  };

  const styles = {
    base: css({
      ...style.toMargins(props.margin),
      boxSizing: 'border-box',
      position: 'relative',
      display: block ? 'block' : 'inline-block',
      color: color.format(
        isEnabled ? theme.color.enabled : theme.color.disabled || theme.color.enabled,
      ),
      backgroundColor: backgroundColor ? color.format(backgroundColor) : undefined,
      cursor: isEnabled ? 'pointer' : undefined,
      userSelect: 'none',
    }),
    inner: css({
      minWidth,
      Flex: 'horizontal-center-center',
      flex: 1,
    }),
    border:
      theme.border.isVisible &&
      css({
        ...style.toPadding(theme.border.padding),
        border: `solid ${theme.border.thickness}px ${color.format(theme.border.color)}`,
        borderRadius: theme.border.radius,
      }),
    content: css({
      flex: 1,
      transform: isEnabled ? `translateY(${isDown ? 1 : 0}px)` : undefined,
      opacity: isEnabled ? 1 : theme.disabledOpacity,
    }),
  };

  return (
    <div
      {...css(styles.base, styles.border, props.style)}
      title={props.tooltip}
      onMouseEnter={overHandler(true)}
      onMouseLeave={overHandler(false)}
      onMouseDown={downHandler(true)}
      onMouseUp={downHandler(false)}
    >
      <div {...styles.inner}>
        <div {...styles.content}>
          {props.label}
          {props.children}
        </div>
      </div>
    </div>
  );
};
