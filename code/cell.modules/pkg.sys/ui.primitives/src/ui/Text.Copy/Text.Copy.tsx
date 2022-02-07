import React, { useState } from 'react';
import { copyToClipboard, css, CssValue, Style, t } from '../../common';
import { TextCopyIcon } from './TextCopy.Icon';

type Pixels = number;

export type TextCopyMouseEvent = { isOver: boolean; isDown: boolean };
export type TextCopyMouseEventHandler = (e: TextCopyMouseEvent) => void;

export type TextCopyEvent = { children: React.ReactNode; copy(value: string): void };
export type TextCopyEventHandler = (e: TextCopyEvent) => void;

export type TextCopyIcon = {
  element: JSX.Element | (() => JSX.Element);
  edge?: 'N' | 'S' | 'W' | 'E';
  offset?: number;
};

export type TextCopyProps = {
  children?: React.ReactNode;
  inlineBlock?: boolean;
  margin?: t.CssEdgesInput;
  padding?: t.CssEdgesInput;
  downOffset?: Pixels;
  icon?: TextCopyIcon;
  style?: CssValue;
  onCopy?: TextCopyEventHandler;
  onMouse?: TextCopyMouseEventHandler;
};

export const TextCopy: React.FC<TextCopyProps> = (props) => {
  const { children, inlineBlock = true, downOffset = 1, icon } = props;
  const isCopyable = Boolean(props.onCopy);

  const [isOver, setOver] = useState(false);
  const [isDown, setDown] = useState(false);

  const handleClick = () => {
    if (isCopyable) {
      let value: undefined | string;
      const e: TextCopyEvent = { children, copy: (input) => (value = input) };
      props.onCopy?.(e);
      if (typeof value === 'string') copyToClipboard(value);
    }
  };

  const fireMouse = () => props.onMouse?.({ isOver, isDown });
  const handleOver = (isOver: boolean) => {
    setOver(isOver);
    fireMouse();
  };
  const handlePress = (isDown: boolean) => {
    setDown(isDown);
    fireMouse();
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      display: inlineBlock && 'inline-block',
      cursor: isCopyable ? 'pointer' : 'default',
      userSelect: isCopyable ? 'none' : 'auto',
      transform: isCopyable ? `translateY(${isDown ? downOffset : 0}px)` : undefined,
      ...Style.toPadding(props.padding),
      ...Style.toMargins(props.margin),
    }),
  };

  const elIcon = icon && isOver && isCopyable && (
    <TextCopyIcon element={icon.element} edge={icon.edge} offset={icon.offset} />
  );

  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={() => handleOver(true)}
      onMouseLeave={() => handleOver(false)}
      onMouseDown={() => handlePress(true)}
      onMouseUp={() => handlePress(false)}
      onClick={handleClick}
    >
      {children}
      {elIcon}
    </div>
  );
};
