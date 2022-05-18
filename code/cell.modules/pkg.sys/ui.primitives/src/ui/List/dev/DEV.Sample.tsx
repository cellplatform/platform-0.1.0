import React from 'react';

import { List } from '..';
import { t } from '../common';
import { Ctx, DebugCtx, RenderCtx } from './DEV.types';

export type DevSampleProps = {
  items: Ctx['items'];
  props: t.ListProps;
  debug: DebugCtx;
  renderCtx: RenderCtx;
};

export const DevSample: React.FC<DevSampleProps> = (args) => {
  const { props, debug, renderCtx } = args;
  const total = args.items.length;
  const isVirtual = debug.virtualScroll;

  const dynamic = List.useDynamicState({
    total,
    props,
    selection: { multi: true, allowEmpty: true },
  });

  /**
   * [Render]
   */

  /**
   * Simple (non-scrolling) layout.
   */
  if (!isVirtual) {
    let items = args.items;

    const MAX = 10;
    if (items.length > MAX) {
      // NB: Curtail long lists to prevent rendering blow-out
      //     when not in "virtual" scrolling mode.
      items = [...items].slice(0, MAX);
      const last = items[MAX - 1];
      items[MAX - 1] = { ...last, data: { ...last.data, truncatedAt: MAX } };
    }
    return <List.Layout {...props} items={items} state={dynamic.state} />;
  }

  /**
   * Virtual scolling list.
   */
  if (isVirtual) {
    const items = args.items;
    const getData: t.GetListItem = (index) => items[index];

    const getSize: t.GetListItemSize = (e) => {
      const spacing = (args.props.spacing || 0) as number;
      const kind = renderCtx.bodyKind;

      // NB: These are fixed sizes for testing only.
      //     Will not adjust if the card content expands.
      let size = e.is.vertical ? 84 : 250; // Debug card (default).
      if (kind === 'Card') size = e.is.vertical ? 53 : 167;
      if (kind === 'Vanilla') size = e.is.vertical ? 23 : 118;

      if (!e.is.first) size += spacing;
      return size;
    };

    return (
      <List.Virtual
        {...props}
        items={{ total, getData, getSize }}
        state={dynamic.state}
        paddingNear={debug.virtualPadding ? 50 : 0}
        paddingFar={debug.virtualPadding ? 150 : 0}
        style={{ flex: 1 }}
      />
    );
  }

  return null;
};
