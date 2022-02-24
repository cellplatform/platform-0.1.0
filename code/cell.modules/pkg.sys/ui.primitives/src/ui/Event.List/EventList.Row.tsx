import React from 'react';
import { ListChildComponentProps } from 'react-window';

import { css, t } from '../../common';
import { BulletDot } from './Bullet.Dot';
import { TypeLabel } from './Label.Type';
import { CountLabel } from './Label.Count';
import * as k from './types';

export type EventListRowData = {
  instance: string;
  item: t.EventHistoryItem;
  colors: k.EventListColors;
  onClick?: (e: k.EventListClicked) => void;
};

export const EventListRow: React.FC<ListChildComponentProps> = (props) => {
  const { index } = props;

  const data = props.data?.(index) as EventListRowData;
  if (!data) return null;

  const { item, colors, instance, onClick } = data;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Flex: 'x-stretch-center',
      userSelect: 'none',
    }),
    left: css({}),
    middle: css({ flex: 1, marginLeft: 4 }),
    right: css({ paddingRight: 10 }),
  };

  const elLabel = (
    <TypeLabel
      text={item.event.type}
      color={colors.typeLabel}
      onClick={() => onClick?.({ instance, index, item })}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <BulletDot
        style={styles.left}
        borderColor={colors.dot.border}
        backgroundColor={colors.dot.background}
      />
      <div {...styles.middle}>{elLabel}</div>
      <div {...styles.right}>
        <CountLabel count={item.count} />
      </div>
    </div>
  );
};
