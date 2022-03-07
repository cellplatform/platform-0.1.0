import React, { forwardRef, useRef } from 'react';
import { VariableSizeList as List } from 'react-window';

import { ListProps, Helpers } from './List.Layout';
import { ListVirtualRow, ListVirtualRowData } from './List.Virtual.Row';
import { css, FC, k, t, useResizeObserver } from './common';
import { ListEvents } from './Events';
import { useEventsController } from './Events.useController';

type Pixels = number;

/**
 * Types
 */
export type ListVirtualProps = ListProps & {
  items: { total: number; getData: k.GetListItem; getSize: k.GetListItemSize };
  event?: { bus: t.EventBus<any>; instance: string };
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
  const { items, paddingNear = 0, paddingFar = 0 } = props;
  const total = items.total;

  const renderer = Helpers.renderer(props, total);
  const orientation = renderer.orientation;

  const rootRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef);

  const ctrl = useEventsController({ ...props.event });
  const { instance } = ctrl;

  const getSize = (index: number) => {
    const item = items[index];
    const is: k.GetListItemSizeArgs['is'] = {
      first: index === 0,
      last: index === total - 1,
      horizontal: orientation === 'x',
      vertical: orientation === 'y',
    };
    const e: k.GetListItemSizeArgs = { index, total, item, is };
    return props.items.getSize(e);
  };

  const getData = (index: number): ListVirtualRowData | undefined => {
    const item = items.getData?.(index);
    if (!item) return undefined;
    return {
      item,
      render: () => renderer.item(item, index),
      onMouse(e) {
        const { mouse, button } = e;
        ctrl.bus.fire({
          type: 'sys.ui.List/Click',
          payload: { instance, index, item, mouse, button },
        });
      },
    };
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
    <div ref={rootRef} {...css(styles.base, props.style)}>
      {elBody}
    </div>
  );
};

/**
 * Export
 */
type Fields = { Events: k.ListEventsFactory };
export const ListVirtual = FC.decorate<ListVirtualProps, Fields>(View, {
  Events: ListEvents,
});
