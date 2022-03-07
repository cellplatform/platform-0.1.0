import React from 'react';
import { DEFAULTS, css, CssValue, k } from './common';
import { ListLayoutItem } from './List.Layout.Item';
import { Renderers } from './renderers';

type Pixels = number;

/**
 * Shared with "Virtual" variant of the component.
 */
export type ListProps = {
  renderers?: { bullet?: k.ListBulletRenderer; body?: k.ListBulletRenderer };
  orientation?: k.ListOrientation;
  bullet?: { edge?: k.ListBulletEdge; size?: Pixels };
  spacing?: number | k.ListBulletSpacing; // Number (defaults to) => { before }
  style?: CssValue;
  debug?: { border?: boolean };
};

/**
 * Component specific
 */
export type ListLayoutProps = ListProps & {
  items: k.ListItem[]; // "Simple" list of items.
};

/**
 * Simple (non-virtualized) layout
 */
export const ListLayout: React.FC<ListLayoutProps> = (props) => {
  const { items = [] } = props;
  const renderer = Helpers.renderer(props, items.length);
  const { orientation } = renderer;

  /**
   * [Render]
   */
  const styles = {
    base: css({ Flex: `${orientation}-stretch-stretch` }),
  };
  const elements = items.map((item, i) => renderer.item(item, i));
  return <div {...css(styles.base, props.style)}>{elements}</div>;
};

/**
 * Helpers
 */
export const Helpers = {
  renderer(props: ListProps, total: number) {
    const { orientation = DEFAULTS.Orientation, bullet = {} } = props;

    const renderers = {
      bullet: props.renderers?.bullet ?? Renderers.asRenderer(Renderers.Bullet.ConnectorLines),
      body: props.renderers?.body ?? Renderers.asRenderer(Renderers.Body.Default),
    };

    const toSpacing = (itemSpacing?: k.ListBulletSpacing): k.ListBulletSpacing => {
      if (typeof itemSpacing === 'object') return itemSpacing;
      const spacing = props.spacing;
      if (typeof spacing === 'number') return { before: spacing, after: 0 };
      return typeof spacing === 'object' ? spacing : { before: 0, after: 0 };
    };

    const api = {
      orientation,
      renderers,
      item(item: k.ListItem, index: number, style?: CssValue) {
        return (
          <ListLayoutItem
            key={`bullet.${index}`}
            index={index}
            total={total}
            renderers={renderers}
            item={item}
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
  },
};
