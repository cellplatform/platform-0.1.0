import React from 'react';

import { CssValue, DEFAULTS, t } from './common';
import { ListLayoutItem } from './List.Layout.Item';
import { Renderers } from './renderers';

type Id = string;

export function Renderer(args: {
  bus: t.EventBus<any>;
  instance: Id;
  props: t.ListProps;
  state: t.ListState;
  total: number;
}) {
  const { bus, instance, props, state, total } = args;
  const { orientation = DEFAULTS.Orientation, bullet = {} } = props;

  const renderers = {
    bullet: props.renderers?.bullet ?? Renderers.asRenderer(Renderers.Bullet.ConnectorLines),
    body: props.renderers?.body ?? Renderers.asRenderer(Renderers.Body.Default),
  };

  const toSpacing = (itemSpacing?: t.ListBulletSpacing): t.ListBulletSpacing => {
    if (typeof itemSpacing === 'object') return itemSpacing;
    const spacing = props.spacing;
    if (typeof spacing === 'number') return { before: spacing, after: 0 };
    return typeof spacing === 'object' ? spacing : { before: 0, after: 0 };
  };

  const api = {
    orientation,
    renderers,
    item(item: t.ListItem, index: number, style?: CssValue) {
      return (
        <ListLayoutItem
          event={{ bus, instance }}
          key={`bullet.${index}`}
          index={index}
          total={total}
          renderers={renderers}
          item={item}
          selection={props.selection}
          state={state}
          orientation={orientation}
          bullet={{ edge: bullet.edge ?? 'near', size: bullet.size ?? 15 }}
          spacing={toSpacing(item.spacing)}
          debug={props.debug}
          style={style}
        />
      );
    },
  };

  return api;
}
