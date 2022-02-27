import React, { useRef } from 'react';
import { VariableSizeList as List } from 'react-window';

import { BulletListLayoutProps, Helpers } from './BulletList.Layout';
import { BulletListVirtualRow, BulletListVirtualRowData } from './BulletList.Virtual.Row';
import { css, FC, k, t, useResizeObserver } from './common';
import { BulletListEvents } from './Events';
import { useEventsController } from './Events.useController';

/**
 * Types
 */
export type BulletListVirtualProps = BulletListLayoutProps & {
  event?: { bus: t.EventBus<any>; instance: string };
  itemSize: k.GetBulletItemSize;
  onClick?: (e: k.BulletListClick) => void;
};

/**
 * Component
 */
export const View: React.FC<BulletListVirtualProps> = (props) => {
  const { items = [] } = props;
  const total = items.length;

  const renderer = Helpers.renderer(props);
  const orientation = renderer.orientation;

  const rootRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef);

  const ctrl = useEventsController({ ...props.event });
  const { instance } = ctrl;

  const getItemSize = (index: number) => {
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
    return props.itemSize(e);
  };

  const getItemData = (index: number): BulletListVirtualRowData => {
    const item = items[index];
    return {
      item,
      render: () => renderer.item(item, index),
      onMouse(e) {
        const { mouse, button } = e;
        const payload: t.BulletListClick = { instance, index, item, mouse, button };
        props.onClick?.(payload);
        ctrl.bus.fire({ type: 'sys.ui.BulletList/Click', payload });
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
      key={ctrl.key} // NB: Enabled "redraws" of the list.
      ref={ctrl.listRef}
      width={size.width}
      height={size.height}
      layout={orientation === 'y' ? 'vertical' : 'horizontal'}
      itemCount={items.length}
      itemSize={getItemSize}
      itemData={getItemData}
      itemKey={(index: number) => items[index]?.id}
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
