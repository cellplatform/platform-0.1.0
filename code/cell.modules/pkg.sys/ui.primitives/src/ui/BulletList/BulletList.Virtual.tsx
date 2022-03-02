import React, { useRef } from 'react';
import { VariableSizeList as List } from 'react-window';

import { BulletListProps, Helpers } from './BulletList.Layout';
import { BulletListVirtualRow, BulletListVirtualRowData } from './BulletList.Virtual.Row';
import { css, FC, k, t, useResizeObserver } from './common';
import { BulletListEvents } from './Events';
import { useEventsController } from './Events.useController';

/**
 * Types
 */
export type BulletListVirtualProps = BulletListProps & {
  items: { total: number; getData: k.GetBulletItem; getSize: k.GetBulletItemSize };
  event?: { bus: t.EventBus<any>; instance: string };
};

/**
 * Component
 */
export const View: React.FC<BulletListVirtualProps> = (props) => {
  const { items } = props;
  const total = items.total;

  const renderer = Helpers.renderer(props, total);
  const orientation = renderer.orientation;

  const rootRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef);

  const ctrl = useEventsController({ ...props.event });
  const { instance } = ctrl;

  const getSize = (index: number) => {
    const item = items[index];
    const e: k.GetBulletItemSizeArgs = {
      index,
      total,
      item,
      is: {
        first: index === 0,
        last: index === total - 1,
        horizontal: orientation === 'x',
        vertical: orientation === 'y',
      },
    };
    return props.items.getSize(e);
  };

  const getData = (index: number): BulletListVirtualRowData | undefined => {
    const item = items.getData?.(index);
    if (!item) return undefined;
    return {
      item,
      render: () => renderer.item(item, index),
      onMouse(e) {
        const { mouse, button } = e;
        ctrl.bus.fire({
          type: 'sys.ui.BulletList/Click',
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

  const elBody = resize.ready && (
    <List
      key={ctrl.key} // NB: Enable "redraws" of the list.
      ref={ctrl.listRef}
      width={size.width}
      height={size.height}
      layout={orientation === 'y' ? 'vertical' : 'horizontal'}
      itemCount={total}
      itemSize={getSize}
      itemData={getData}
      itemKey={(index: number) => `row.${index}`}
    >
      {BulletListVirtualRow}
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
type Fields = { Events: k.BulletListEventsFactory };
export const BulletListVirtual = FC.decorate<BulletListVirtualProps, Fields>(View, {
  Events: BulletListEvents,
});
