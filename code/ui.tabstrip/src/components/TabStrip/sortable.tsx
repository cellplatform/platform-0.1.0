import * as React from 'react';

import { css, t, s } from '../../common';

export type IElement<V = any> = s.SortableElementProps & { value: V };
export type IContainer<V = any> = s.SortableContainerProps & { items: V[] };

export function sortable(args: { axis: t.TabstripAxis; renderTab: t.TabFactory; total: number }) {
  const { axis, renderTab, total } = args;
  const direction = axis === 'y' ? 'vertical' : 'horizontal';
  const isVertical = axis === 'y';
  const isHorizontal = axis === 'x';

  /**
   * Single item within a list.
   */
  const Item = s.SortableElement((e: IElement) => {
    const styles = {
      base: css({ position: 'relative' }),
    };
    const { index, value: data, collection } = e;
    const isFirst = index === 0;
    const isLast = index === total - 1;

    const el = renderTab({
      axis,
      index,
      data,
      collection,
      isVertical,
      isHorizontal,
      isFirst,
      isLast,
    });
    return <div {...styles.base}>{el}</div>;
  });

  /**
   * Complete list.
   */
  const List = s.SortableContainer((e: IContainer) => {
    const styles = {
      base: css({
        Flex: `${direction}-stretch-stretch`,
        boxSizing: 'border-box',
      }),
    };

    return (
      <div {...styles.base}>
        {e.items.map((value, index) => (
          <Item key={`tab-${index}`} index={index} value={value} />
        ))}
      </div>
    );
  });

  return { List, Item };
}
