import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

import { ListChildComponentProps } from 'react-window';
import { Bullet } from './Bullet';
import { TypeLabel } from './TypeLabel';

import * as k from './types';

export type EventListRowData = {
  item: t.EventHistoryItem;
  colors: k.EventListColors;
};

export const EventListRow: React.FC<ListChildComponentProps> = (props) => {
  const data = props.data?.(props.index) as EventListRowData;
  if (!data) return null;

  const { item, colors } = data;

  /**
   * [Render]
   */
  const styles = {
    base: css({ Flex: 'x-stretch-center' }),
    left: css({}),
    middle: css({ flex: 1, marginLeft: 4 }),
    right: css({
      fontSize: 11,
      // opacity
      opacity: 0.3,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Bullet style={styles.left} borderColor={colors.margin} backgroundColor={undefined} />
      <div {...styles.middle}>
        <TypeLabel text={item.event.type} color={colors.typeLabel} />
      </div>
      <div {...styles.right}>{item.count}</div>
    </div>
  );
};
