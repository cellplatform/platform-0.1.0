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
      borderBottom: `solid 1px ${color.format(-0.06)}`,
      boxSizing: 'border-box',
      color: COLORS.DARK,
    }),
    main: css({
      Flex: 'horizontal-stretch-stretch',
      PaddingY: 3,
      paddingLeft: 6,
      paddingRight: 10,
      transform: isDown ? `translateY(1px)` : undefined,
    }),
    icon: css({
      opacity: 0.6,
      width: 20,
    }),
    body: css({
      flex: 1,
      marginLeft: 6,
      marginTop: 5,
      overflow: 'hidden',
      cursor: 'pointer',
    }),
    label: css({
      width: '100%',
      fontFamily: constants.FONT.MONO,
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
      <div {...styles.main}>
        <Icons.Variable
          color={isOver ? COLORS.CLI.MAGENTA : COLORS.DARK}
          size={20}
          style={styles.icon}
        />
        <div
          {...styles.body}
          onMouseEnter={() => over(true)}
          onMouseLeave={() => over(false)}
          onMouseDown={() => click(true)}
          onMouseUp={() => click(false)}
        >
          <div {...styles.label}>{model.label || 'Unnamed'}</div>
          {model.description && <div {...styles.description}>{model.description}</div>}
        </div>
      </div>
    </div>
  );
};
