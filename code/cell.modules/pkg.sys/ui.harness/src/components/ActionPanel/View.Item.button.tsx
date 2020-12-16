import React, { useState } from 'react';

import { color, COLORS, constants, css, CssValue, t } from '../../common';
import { Icons } from '../Icons';

export type ItemButtonProps = {
  model: t.ActionItemButton;
  style?: CssValue;
  onClick?: t.ActionItemClickEventHandler;
};

export const ItemButton: React.FC<ItemButtonProps> = (props) => {
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isDown, setIsDown] = useState<boolean>(false);

  const { model } = props;
  const styles = {
    base: css({
      position: 'relative',
      borderBottom: `dashed 1px ${color.format(-0.1)}`,
      boxSizing: 'border-box',
      color: COLORS.DARK,
    }),
    main: css({
      Flex: 'horizontal-stretch-stretch',
      PaddingY: 4,
      paddingLeft: 6,
      paddingRight: 10,
      transform: isDown ? `translateY(1px)` : undefined,
      cursor: 'pointer',
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

  const over = (isOver: boolean) => {
    setIsOver(isOver);
    if (!isOver) {
      setIsDown(false);
    }
  };

  const clickHandler = (isDown: boolean) => {
    return (e: React.MouseEvent) => {
      console.log('e.button', e.button);
      if (e.button === 0) {
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
        onMouseEnter={() => over(true)}
        onMouseLeave={() => over(false)}
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
