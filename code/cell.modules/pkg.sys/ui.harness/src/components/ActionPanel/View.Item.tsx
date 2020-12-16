import React, { useState } from 'react';
import { css, CssValue, COLORS, t, color, constants } from '../../common';
import { Icons } from '../Icons';

export type ActionItemClickEvent = { model: t.ActionItem };
export type ActionItemClickEventHandler = (e: ActionItemClickEvent) => void;

export type ActionPanelItemProps = {
  model: t.ActionItem;
  style?: CssValue;
  onClick?: ActionItemClickEventHandler;
};

export const ActionPanelItem: React.FC<ActionPanelItemProps> = (props) => {
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

  const click = (isDown: boolean) => {
    setIsDown(isDown);
    if (isDown && props.onClick) {
      props.onClick({ model });
    }
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div
        {...styles.main}
        onMouseEnter={() => over(true)}
        onMouseLeave={() => over(false)}
        onMouseDown={() => click(true)}
        onMouseUp={() => click(false)}
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
