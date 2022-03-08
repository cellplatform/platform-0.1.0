import React, { forwardRef } from 'react';
import { VariableSizeList as List } from 'react-window';

import { css, FC, t, useResizeObserver, useUIEvents } from './common';
import { ListEvents } from './Events';
import { ListProps, Util } from './List.Layout';
import { ListVirtualRow, ListVirtualRowData } from './List.Virtual.Row';
import { useListEventsController } from './hooks';

type Pixels = number;

/**
 * Types
 */
export type ListVirtualProps = ListProps & {
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
  const ctrl = useListEventsController({ event: props.event });
  const { bus, instance } = ctrl;

  const renderer = Util.renderer({ props, total, event: { bus, instance } });
  const orientation = renderer.orientation;

  const ctx: t.CtxList = { kind: 'List', total };
  const ui = useUIEvents<t.CtxList, HTMLDivElement>({ bus, instance, ctx });
  const resize = useResizeObserver(ui.ref);

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

  const getData = (index: number): ListVirtualRowData | undefined => {
    const item = items.getData?.(index);
    if (!item) return undefined;
    return { item, render: () => renderer.item(item, index) };
  };

  /**
   * [Render]
   */
  const size = resize.rect;
  const styles = {
    base: css({ position: 'relative' }),
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
    return <ListVirtualRow {...rest} style={{ ...style, left, top }} />;
  };

  const elBody = resize.ready && (
    <List
      key={ctrl.key} // NB: Enable "redraws" of the list.
      ref={ctrl.listRef}
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
      ref={ui.ref}
      tabIndex={tabIndex}
      onMouseDown={ui.mouse.onMouseDown}
      onMouseUp={ui.mouse.onMouseUp}
      onMouseEnter={ui.mouse.onMouseEnter}
      onMouseLeave={ui.mouse.onMouseLeave}
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
