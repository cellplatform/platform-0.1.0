import React, { useState } from 'react';
import { COLORS, color, css, CssValue, t, defaultValue } from '../../common';

export type DotTabstripItemProps = {
  index: number;
  item: t.DotTabstripItem;
  size?: number;
  isSelected?: boolean;
  defaultColor?: string | number;
  highlightColor?: string | number;
  selectedColor?: string | number;
  errorColor?: string | number;
  style?: CssValue;
  onClick?: t.DotTabstripClickEventHandler;
};

export const DotTabstripItem: React.FC<DotTabstripItemProps> = (props) => {
  const { isSelected, item, index } = props;
  const { isLoaded, error } = item;
  const [isOver, setIsOver] = useState<boolean>(false);
  const tooltip = error ? `${item.label}\nError: ${error}` : item.label;

  const defaultColor = defaultValue(props.defaultColor, -0.1);
  const highlightColor = defaultValue(props.highlightColor, -0.4);
  const selectedColor = defaultValue(props.selectedColor, -0.4);
  const errorColor = defaultValue(props.errorColor, COLORS.RED);

  const backgroundColor = (() => {
    if (error) return errorColor;
    if (isSelected && isOver) return highlightColor;

    if (isSelected) return selectedColor;
    return defaultColor;
  })();

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
      Flex: 'center-center',
    }),
    bg: css({
      Absolute: 0,
      backgroundColor: isLoaded ? color.format(backgroundColor) : undefined,
      border: `solid 1px ${color.format(-0.1)}`,
      borderRadius: '100%',
    }),
    border: css({
      Absolute: -2,
      backgroundColor: color.format(0.4),
      borderRadius: '100%',
    }),
    errorIcon: css({}),
  };

  const handleClick = () => {
    if (props.onClick) props.onClick({ index, item });
  };

  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={() => setIsOver(true)}
      onMouseLeave={() => setIsOver(false)}
      onClick={handleClick}
      title={tooltip}
    >
      <div {...styles.body}>
        <div {...styles.border} />
        <div {...styles.bg} />
      </div>
    </div>
  );
};
