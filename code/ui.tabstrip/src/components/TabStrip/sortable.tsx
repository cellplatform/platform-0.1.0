import * as React from 'react';
import { Subject } from 'rxjs';

import { css, s, t } from '../../common';

export type IElement<V = any> = s.SortableElementProps & { value: V };
export type IContainer<V = any> = s.SortableContainerProps & { items: V[] };

export function sortable(args: {
  axis: t.TabstripAxis;
  renderTab: t.TabFactory;
  total: number;
  selected?: number;
  isFocused: boolean;
  getDraggingTabIndex: () => number;
  events$: Subject<t.TabstripEvent>;
}) {
  const { axis, renderTab, total, getDraggingTabIndex, isFocused, events$ } = args;
  const direction = axis === 'y' ? 'vertical' : 'horizontal';
  const isVertical = axis === 'y';
  const isHorizontal = axis === 'x';

  const mouseHandler = (type: t.MouseEventType, args: { index: number; data: any }) => {
    return (e: React.MouseEvent) => {
      const { index, data } = args;
      const button = e.button === 2 ? 'RIGHT' : 'LEFT';
      const payload: t.ITabMouse = {
        index,
        type,
        data,
        button,
        axis,
        cancel() {
          e.preventDefault();
          e.stopPropagation();
        },
      };
      events$.next({ type: 'TABSTRIP/tab/mouse', payload });
    };
  };

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
    const isDragging = getDraggingTabIndex() === index;
    const isSelected = index === args.selected;
    const mouse = (type: t.MouseEventType) => mouseHandler(type, { index, data });
    const el = renderTab({
      axis,
      index,
      data,
      collection,
      isVertical,
      isHorizontal,
      isFirst,
      isLast,
      isDragging,
      isSelected,
      isFocused,
    });
    return (
      <div
        {...styles.base}
        onClick={mouse('CLICK')}
        onDoubleClick={mouse('DOUBLE_CLICK')}
        onMouseDown={mouse('DOWN')}
        onMouseUp={mouse('UP')}
        onMouseEnter={mouse('ENTER')}
        onMouseLeave={mouse('LEAVE')}
      >
        {el}
      </div>
    );
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
