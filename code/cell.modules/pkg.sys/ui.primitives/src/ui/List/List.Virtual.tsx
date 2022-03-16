import React, { forwardRef } from 'react';
import { VariableSizeList as List } from 'react-window';

import { css, FC, t, useResizeObserver } from './common';
import { ListEvents } from './Events';
import { useVirtualContext } from './useCtx.Virtual';
import { ListVirtualItem, ListVirtualItemProps } from './List.Virtual.Item';
import { useContext } from './useCtx';
import { Renderer } from './Renderer';

type Pixels = number;

/**
 * Types
 */
export type ListVirtualProps = t.ListProps & {
  items: { total: number; getData: t.GetListItem; getSize: t.GetListItemSize };
  event?: t.ListEventArgs;
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

  const ctx = useVirtualContext({ total, event: props.event });
  const { bus, instance, state } = ctx;

  const resize = useResizeObserver(ctx.ui.ref);
  const renderer = Renderer({ bus, instance, props, state, total });
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
    return { item, render: () => renderer.item(item, index) };
  };

  /**
   * [Render]
   */
  const size = resize.rect;
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

  const Row = ({ style, ...rest }: any) => {
    const left = orientation === 'x' ? `${parseFloat(style.left) + paddingNear}px` : style.left;
    const top = orientation === 'y' ? `${parseFloat(style.top) + paddingNear}px` : style.top;
    return <ListVirtualItem {...rest} style={{ ...style, left, top }} />;
  };

  const elBody = resize.ready && (
    <List
      key={ctx.redrawKey} // NB: Enable forced "redraws" of the list (via event-bus).
      ref={ctx.listRef}
      width={size.width}
      height={size.height}
      layout={orientation === 'y' ? 'vertical' : 'horizontal'}
      innerElementType={elListInner}
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
      {...css(styles.base, props.style)}
      ref={ctx.ui.ref}
      tabIndex={tabIndex}
      onMouseDown={ctx.ui.mouse.onMouseDown}
      onMouseUp={ctx.ui.mouse.onMouseUp}
      onMouseEnter={ctx.ui.mouse.onMouseEnter}
      onMouseLeave={ctx.ui.mouse.onMouseLeave}
      onFocus={ctx.ui.focus.onFocus}
      onBlur={ctx.ui.focus.onBlur}
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
