import React, { forwardRef } from 'react';
import { VariableSizeList as List } from 'react-window';

import { css, FC, t, useResizeObserver } from './common';
import { ListEvents } from './Events';
import { useVirtualContext } from './useCtx.Virtual';
import { ListVirtualItem, ListVirtualItemProps } from './List.Virtual.Item';
import { Renderer } from './Renderer';

type Pixels = number;

/**
 * Types
 */
export type ListVirtualProps = t.ListProps & {
  items: { total: number; getData: t.GetListItem; getSize: t.GetListItemSize };
  paddingNear?: Pixels;
  paddingFar?: Pixels;
};

/**
 * Component
 *
 * Refs:
 *    - https://github.com/bvaughn/react-window
 *    - https://react-window.vercel.app/#/examples/list/fixed-size
 *
 */
export const View: React.FC<ListVirtualProps> = (props) => {
  const { items, paddingNear = 0, paddingFar = 0, tabIndex } = props;
  const total = items.total;

  const ctx = useVirtualContext({ total, instance: props.instance });
  const { instance } = ctx;

  const size = useResizeObserver({ ref: ctx.list.ref });
  const renderer = Renderer({ instance, props, total });
  const orientation = renderer.orientation;

  const getSize = (index: number) => {
    const item = items[index];
    const is: t.GetListItemSizeArgs['is'] = {
      first: index === 0,
      last: index === total - 1,
      horizontal: orientation === 'x',
      vertical: orientation === 'y',
    };
    const e: t.GetListItemSizeArgs = { index, total, item, is };
    return props.items.getSize(e);
  };

  const getData = (index: number): ListVirtualItemProps | undefined => {
    const item = items.getData?.(index);
    if (!item) return undefined;
    return {
      item,
      render({ isScrolling }) {
        return renderer.item({ index, item, isScrolling });
      },
    };
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      outline: 'none', // NB: supress default "focus" border
    }),
  };

  // eslint-disable-next-line react/display-name
  const elListInner = forwardRef(({ style, ...rest }: any, ref) => {
    const total = paddingNear + paddingFar;
    const width = orientation === 'x' ? `${parseFloat(style.width) + total}px` : style.width;
    const height = orientation === 'y' ? `${parseFloat(style.height) + total}px` : style.height;
    return <div ref={ref} style={{ ...style, width, height }} {...rest} />;
  });

  const Row = ({ style, isScrolling, ...rest }: any) => {
    const left = orientation === 'x' ? `${parseFloat(style.left) + paddingNear}px` : style.left;
    const top = orientation === 'y' ? `${parseFloat(style.top) + paddingNear}px` : style.top;
    return <ListVirtualItem {...rest} isScrolling={isScrolling} style={{ ...style, left, top }} />;
  };

  const elBody = size.ready && (
    <List
      key={ctx.redrawKey} // NB: Enable forced "redraws" of the list (via event-bus).
      ref={ctx.listRef}
      width={size.rect.width}
      height={size.rect.height}
      layout={orientation === 'y' ? 'vertical' : 'horizontal'}
      innerElementType={elListInner}
      useIsScrolling={true}
      itemCount={total}
      itemSize={getSize}
      itemData={getData}
      itemKey={(index: number) => `row.${index}`}
    >
      {Row}
    </List>
  );

  return (
    <div
      tabIndex={tabIndex}
      ref={ctx.list.ref}
      {...ctx.list.handlers}
      {...css(styles.base, props.style)}
    >
      {elBody}
    </div>
  );
};

/**
 * Export (API)
 */
type Fields = { Events: t.ListEventsFactory };
export const ListVirtual = FC.decorate<ListVirtualProps, Fields>(
  View,
  { Events: ListEvents },
  { displayName: 'ListVirtual' },
);
