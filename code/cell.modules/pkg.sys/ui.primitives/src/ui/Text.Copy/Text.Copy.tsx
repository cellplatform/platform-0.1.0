import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Style, copyToClipboard } from '../../common';

type Pixels = number;

export type ClipboardCopyEvent = { children: React.ReactNode; copy(value: string): void };
export type ClipboardCopyEventHandler = (e: ClipboardCopyEvent) => void;

export type TextCopyProps = {
  children?: React.ReactNode;
  style?: CssValue;
  inlineBlock?: boolean;
  margin?: t.CssEdgesInput;
  padding?: t.CssEdgesInput;
  copyToClipboard?: ClipboardCopyEventHandler;
  downOffset?: Pixels;
};

export const TextCopy: React.FC<TextCopyProps> = (props) => {
  const { children, inlineBlock = true, downOffset = 1 } = props;
  const [isOver, setOver] = useState(false);
  const [isDown, setDown] = useState(false);

  const isCopyable = Boolean(props.copyToClipboard);

  const handleClick = () => {
    if (isCopyable) {
      let value: undefined | string;
      const e: ClipboardCopyEvent = { children, copy: (input) => (value = input) };
      props.copyToClipboard?.(e);
      if (typeof value === 'string') copyToClipboard(value);
    }
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      display: inlineBlock && 'inline-block',
      cursor: isCopyable ? 'pointer' : 'default',
      transform: `translateY(${isDown ? downOffset : 0}px)`,
      ...Style.toPadding(props.padding),
      ...Style.toMargins(props.margin),
    }),
  };
  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
