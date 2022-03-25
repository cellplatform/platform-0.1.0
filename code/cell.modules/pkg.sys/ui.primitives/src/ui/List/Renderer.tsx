import React from 'react';

import { CssValue, DEFAULTS, t } from './common';
import { ListLayoutItem } from './List.Layout.Item';
import { Renderers } from './renderers';

type Id = string;

export function Renderer(args: {
  bus: t.EventBus<any>;
  instance: Id;
  total: number;
  props: t.ListProps;
}) {
  const { bus, instance, props, total } = args;
  const { state, orientation = DEFAULTS.Orientation, bullet = {} } = props;

  const renderers = {
    bullet: props.renderers?.bullet ?? Renderers.asRenderer(Renderers.Bullet.ConnectorLines),
    body: props.renderers?.body ?? Renderers.asRenderer(Renderers.Body.Default),
  };

  const api = {
    orientation,
    renderers,
    item(args: { index: number; item: t.ListItem; isScrolling?: boolean; style?: CssValue }) {
      const { index, item, isScrolling, style } = args;
      return (
        <ListLayoutItem
          key={`item.${index}`}
          event={{ bus, instance }}
          index={index}
          total={total}
          renderers={renderers}
          item={item}
          state={state}
          orientation={orientation}
          bullet={{ edge: bullet.edge ?? 'near', size: bullet.size ?? 15 }}
          spacing={toSpacing(item.spacing, props.spacing)}
          debug={props.debug}
          isScrolling={isScrolling}
          style={style}
        />
      );
    },
  };

  return api;
}

/**
 * [Helpers]
 */

const toSpacing = (
  itemSpacing: t.ListBulletSpacing | undefined,
  defaultSpacing: t.ListProps['spacing'],
): t.ListBulletSpacing => {
  if (typeof itemSpacing === 'object') return itemSpacing;
  if (typeof defaultSpacing === 'number') return { before: defaultSpacing, after: 0 };
  return typeof defaultSpacing === 'object' ? defaultSpacing : { before: 0, after: 0 };
};
