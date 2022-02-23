import React from 'react';
import { ListChildComponentProps } from 'react-window';

import { css, t } from '../../common';
import { Bullet } from './Bullet';
import { TypeLabel } from './TypeLabel';
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
    base: css({ Flex: 'x-stretch-center' }),
    left: css({}),
    middle: css({ flex: 1, marginLeft: 4 }),
    right: css({ fontSize: 11, opacity: 0.3 }),
  };

  return (
    <div {...css(styles.base, props.style)} onClick={() => onClick?.({ instance, index, item })}>
      <Bullet style={styles.left} borderColor={colors.margin} backgroundColor={undefined} />
      <div {...styles.middle}>
        <TypeLabel text={item.event.type} color={colors.typeLabel} />
      </div>
      <div {...styles.right}>{item.count}</div>
    </div>
  );
};
