import * as React from 'react';
import { css, color, GlamorValue } from '../../common';

export type IFooProps = {
  children?: any;
  background?: number | string | boolean;
  padding?: number | string;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  block?: boolean;
  style?: GlamorValue;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

/**
 * A dummy placeholder component.
 */
export const Foo = ({
  children,
  background = true,
  padding = 8,
  block = true,

  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,

  style,

  onClick,
  onMouseDown,
  onMouseUp,
}: IFooProps) => {
  const styles = {
    backgroundColor: color.format(background),
    display: block ? 'block' : 'inline-block',
    padding,
    borderRadius: 3,
    fontSize: 14,
    border: `dashed 1px ${color.format(-0.1)}`,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  };

  return (
    <div {...css(styles, style)} onClick={onClick} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
      {children}
    </div>
  );
};
