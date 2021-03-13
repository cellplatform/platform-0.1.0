import React, { useEffect, useState } from 'react';

import { color, COLORS, constants, css, CssValue, DEFAULT, t, defaultValue } from '../common';
import { Icons } from '../Icons';
import { Markdown } from '../Markdown';
import { Spinner } from '../Primitives';

/**
 * A base layout for the display of an dev [Action] item.
 */
export type ItemLayoutProps = {
  label: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: boolean;
  isActive: boolean;
  icon?: { Component?: t.IIcon; color?: string | number; size?: number };
  right?: React.ReactNode;
  top?: React.ReactNode;
  isSpinning?: boolean;
  ellipsis?: boolean;
  pressOffset?: number;
  style?: CssValue;
  onClick?: () => void;
};
export const ItemLayout: React.FC<ItemLayoutProps> = (props) => {
  const { placeholder, onClick, isSpinning, icon } = props;
  const ellipsis = defaultValue(props.ellipsis, true);
  const pressOffset = defaultValue(props.pressOffset, 1);

  const [isOver, setIsOver] = useState<boolean>(false);
  const [isDown, setIsDown] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(props.isActive);

  useEffect(() => {
    setIsActive(isSpinning ? false : props.isActive);
  }, [props.isActive, isSpinning]);

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      PaddingY: 2,
    }),
    main: {
      outer: css({
        Flex: 'horizontal-stretch-stretch',
        paddingLeft: 12,
        paddingRight: 15,
        cursor: isActive && props.onClick ? 'pointer' : 'default',
        opacity: isActive ? 1 : 0.4,
      }),
      iconOuter: css({
        width: 20,
        height: 20,
        Flex: 'center-center',
      }),
      icon: css({
        opacity: isOver || props.icon?.color !== undefined ? 1 : 0.4,
      }),
      spinner: css({ Absolute: [3, null, null, 13] }),
    },
    body: {
      outer: css({
        flex: 1,
        marginLeft: 6,
        marginTop: 5,
        overflow: ellipsis ? 'hidden' : undefined,
      }),
      label: css({
        width: '100%',
        fontFamily: constants.FONT.MONO,
        fontStyle: placeholder ? 'italic' : undefined,
        fontSize: 12,
        color: isOver && isActive ? COLORS.BLUE : COLORS.DARK,
        opacity: !isActive ? 0.6 : !placeholder ? 1 : isOver ? 1 : 0.6,
        transform: isDown ? `translateY(${pressOffset}px)` : undefined,
      }),
      ellipsis:
        ellipsis &&
        css({
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }),
      description: css({
        color: color.format(-0.4),
        fontSize: 10,
        marginTop: 4,
      }),
    },
  };

  const overHandler = (isOver: boolean) => () => {
    if (isActive) {
      setIsOver(isOver);
      if (!isOver) setIsDown(false);
    }
  };

  const clickHandler = (isDown: boolean) => (e: React.MouseEvent) => {
    if (isActive && e.button === 0) {
      setIsDown(isDown);
      if (!isDown && onClick) onClick();
    }
  };

  const label = props.label ? props.label : DEFAULT.UNNAMED;
  const description = props.description && (
    <Markdown style={styles.body.description}>{props.description}</Markdown>
  );

  const Icon = props.icon?.Component || Icons.Variable;
  const elIcon = !isSpinning && (
    <Icon
      color={defaultValue(props.icon?.color, isOver ? COLORS.BLUE : COLORS.DARK)}
      size={defaultValue(props.icon?.size, 20)}
      style={styles.main.icon}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {props.top}
      <div
        {...styles.main.outer}
        onMouseEnter={overHandler(true)}
        onMouseLeave={overHandler(false)}
        onMouseDown={clickHandler(true)}
        onMouseUp={clickHandler(false)}
      >
        <div {...styles.main.iconOuter}>
          {elIcon}
          {isSpinning && <Spinner style={styles.main.spinner} size={18} />}
        </div>
        <div {...styles.body.outer}>
          <div {...css(styles.body.label, styles.body.ellipsis)}>{label}</div>
          {description}
        </div>
        {props.right}
      </div>
    </div>
  );
};
