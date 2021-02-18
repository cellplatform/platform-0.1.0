import React, { useState } from 'react';
import { color, css, CssValue } from '../common';

export type DotSelectorItem = { label: string; value: string; isLoaded?: boolean; error?: string };
export type DotSelectorClickEventHandler = (e: DotSelectorItem) => void;

export type DotSelectorDotProps = {
  item: DotSelectorItem;
  size?: number;
  isSelected?: boolean;
  defaultColor?: string | number;
  highlightColor?: string | number;
  selectedColor?: string | number;
  style?: CssValue;
  onClick?: DotSelectorClickEventHandler;
};

export const DotSelectorDot: React.FC<DotSelectorDotProps> = (props) => {
  const { isSelected, item } = props;
  const { isLoaded } = item;
  const [isOver, setIsOver] = useState<boolean>(false);

  const { defaultColor = -0.1, highlightColor = -0.4, selectedColor = -0.4 } = props;
  const backgroundColor =
    isSelected && isOver ? highlightColor : isSelected ? selectedColor : defaultColor;

  const { size = 10 } = props;
  const styles = {
    base: css({
      userSelect: 'none',
    }),
    body: css({
      position: 'relative',
      width: size,
      height: size,
      transform: `scale(${isOver ? 2 : 1})`,
      transition: `transform 100ms, background-color 300ms`,
      cursor: isOver ? 'pointer' : 'default',
    }),
    bg: css({
      Absolute: 0,
      backgroundColor: isLoaded ? color.format(backgroundColor) : undefined,
      border: `solid 1px ${color.format(-0.1)}`,
      borderRadius: '100%',
    }),
    border: css({
      Absolute: -2,
      backgroundColor: color.format(0.2),
      borderRadius: '100%',
    }),
  };

  const handleClick = () => {
    if (props.onClick) props.onClick(item);
  };

  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={() => setIsOver(true)}
      onMouseLeave={() => setIsOver(false)}
      onClick={handleClick}
      title={item.label}
    >
      <div {...styles.body}>
        <div {...styles.border} />
        <div {...styles.bg} />
      </div>
    </div>
  );
};
