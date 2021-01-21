import React, { useState } from 'react';

import { COLORS, constants, css, CssValue, t } from '../../common';
import { Icons } from '../Icons';

export type ButtonItemProps = {
  model: t.DevActionItemButton;
  style?: CssValue;
  onClick?: t.DevActionItemClickEventHandler;
};

export const ButtonItem: React.FC<ButtonItemProps> = (props) => {
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isDown, setIsDown] = useState<boolean>(false);

  const { model } = props;
  const isActive = Boolean(model.onClick);

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      color: COLORS.DARK,
    }),
    main: css({
      Flex: 'horizontal-stretch-stretch',
      PaddingY: 2,
      paddingLeft: 8,
      paddingRight: 10,
      transform: isDown ? `translateY(1px)` : undefined,
      cursor: isActive ? 'pointer' : 'default',
      opacity: isActive ? 1 : 0.4,
    }),
    icon: css({
      opacity: isOver ? 1 : 0.4,
      width: 20,
    }),
    body: css({
      flex: 1,
      marginLeft: 6,
      marginTop: 5,
      overflow: 'hidden',
    }),
    label: css({
      width: '100%',
      fontFamily: constants.FONT.MONO,
      color: isOver ? COLORS.BLUE : COLORS.DARK,
      opacity: isActive ? 1 : 0.6,
      fontSize: 12,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    description: css({
      fontSize: 11,
      marginTop: 4,
      opacity: 0.6,
    }),
  };

  const overHandler = (isOver: boolean) => {
    return () => {
      if (isActive) {
        setIsOver(isOver);
        if (!isOver) {
          setIsDown(false);
        }
      }
    };
  };

  const clickHandler = (isDown: boolean) => {
    return (e: React.MouseEvent) => {
      if (isActive && e.button === 0) {
        setIsDown(isDown);
        if (isDown && props.onClick) {
          props.onClick({ model });
        }
      }
    };
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div
        {...styles.main}
        onMouseEnter={overHandler(true)}
        onMouseLeave={overHandler(false)}
        onMouseDown={clickHandler(true)}
        onMouseUp={clickHandler(false)}
      >
        <Icons.Variable color={isOver ? COLORS.BLUE : COLORS.DARK} size={20} style={styles.icon} />
        <div {...styles.body}>
          <div {...styles.label}>{model.label || 'Unnamed'}</div>
          {model.description && <div {...styles.description}>{model.description}</div>}
        </div>
      </div>
    </div>
  );
};
