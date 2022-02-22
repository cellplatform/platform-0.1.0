import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, useResizeObserver } from '../../common';
import { VariableSizeList as List } from 'react-window';

export type EventListProps = {
  items?: t.EventHistoryItem[];
  style?: CssValue;
};

export const EventList: React.FC<EventListProps> = (props) => {
  const { items = [] } = props;

  const ref = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(ref);
  const size = resize.rect;

  console.group('🌳 ');
  console.log('size', size);
  console.log('items', items);

  console.groupEnd();
  // console.log('resize.rect', resize.rect);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };

  const getItemSize = (index: number) => 20;

  const elBody = (
    <List width={size.width} height={size.height} itemCount={items.length} itemSize={getItemSize}>
      {Row}
    </List>
  );

  return (
    <div ref={ref} {...css(styles.base, props.style)}>
      {resize.ready && elBody}
    </div>
  );
};

/**
 * TODO 🐷
 */

const Row = ({ index, style }: any) => <div style={style}>Row {index}</div>;
