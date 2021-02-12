import React, { useState, useEffect } from 'react';

import {
  COLORS,
  constants,
  css,
  CssValue,
  t,
  DEFAULT,
  color,
  Icons,
  Markdown,
  Spinner,
} from '../common';

/**
 * The button view, with no smarts about the event bus.
 */
export type ButtonViewProps = {
  label: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: boolean;
  isActive: boolean;
  icon?: t.IIcon;
  right?: React.ReactNode;
  isSpinning?: boolean;
  style?: CssValue;
  onClick?: () => void;
};
export const ButtonView: React.FC<ButtonViewProps> = (props) => {
  const { placeholder, onClick, isSpinning } = props;
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
      color: COLORS.DARK,
    }),
    main: {
      outer: css({
        Flex: 'horizontal-stretch-stretch',
        PaddingY: 2,
        paddingLeft: 12,
        paddingRight: 15,
        cursor: isActive ? 'pointer' : 'default',
        opacity: isActive ? 1 : 0.4,
      }),
      iconOuter: css({
        width: 20,
        height: 20,
        Flex: 'center-center',
      }),
      icon: css({ opacity: isOver ? 1 : 0.4 }),
      spinner: css({
        Absolute: [3, null, null, 13],
      }),
    },
    body: {
      outer: css({
        flex: 1,
        marginLeft: 6,
        marginTop: 5,
        overflow: 'hidden',
      }),
      label: css({
        width: '100%',
        fontFamily: constants.FONT.MONO,
        fontStyle: placeholder ? 'italic' : undefined,
        fontSize: 12,
        color: isOver && isActive ? COLORS.BLUE : COLORS.DARK,
        opacity: !isActive ? 0.6 : !placeholder ? 1 : isOver ? 1 : 0.6,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        transform: isDown ? `translateY(1px)` : undefined,
      }),
      description: css({
        marginTop: 4,
        color: color.format(-0.4),
        fontSize: 11,
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

  const Icon = props.icon || Icons.Variable;

  const label = props.label ? props.label : DEFAULT.UNNAMED;
  const description = props.description && (
    <Markdown style={styles.body.description}>{props.description}</Markdown>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div
        {...styles.main.outer}
        onMouseEnter={overHandler(true)}
        onMouseLeave={overHandler(false)}
        onMouseDown={clickHandler(true)}
        onMouseUp={clickHandler(false)}
      >
        <div {...styles.main.iconOuter}>
          {!isSpinning && (
            <Icon color={isOver ? COLORS.BLUE : COLORS.DARK} size={20} style={styles.main.icon} />
          )}
          {isSpinning && <Spinner style={styles.main.spinner} size={18} />}
        </div>
        <div {...styles.body.outer}>
          <div {...styles.body.label}>{label}</div>
          {description}
        </div>
        {props.right}
      </div>
    </div>
  );
};
