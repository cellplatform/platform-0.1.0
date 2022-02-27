import React from 'react';
import { DEFAULTS, css, CssValue, k } from './common';
import { BulletListLayoutItem } from './BulletList.Layout.Item';
import { Renderers } from './renderers';

type Pixels = number;

export type BulletListLayoutProps = {
  items?: k.BulletItem[];
  renderers?: { bullet?: k.BulletRenderer; body?: k.BulletRenderer };
  orientation?: k.BulletOrientation;
  bullet?: { edge?: k.BulletEdge; size?: Pixels };
  spacing?: number | k.BulletSpacing; // Number (defaults to) => { before }
  style?: CssValue;
  debug?: { border?: boolean };
};

export const BulletListLayout: React.FC<BulletListLayoutProps> = (props) => {
  const renderer = Helpers.renderer(props);
  const { orientation } = renderer;
  const styles = { base: css({ Flex: `${orientation}-stretch-stretch` }) };
  return <div {...css(styles.base, props.style)}>{renderer.items()}</div>;
};

/**
 * Helpers
 */
export const Helpers = {
  renderer(props: BulletListLayoutProps) {
    const { orientation = DEFAULTS.Orientation, bullet = {}, items = [] } = props;

    const renderers = {
      bullet: props.renderers?.bullet ?? Renderers.asRenderer(Renderers.Bullet.ConnectorLines),
      body: props.renderers?.body ?? Renderers.asRenderer(Renderers.Body.Default),
    };

    const toSpacing = (itemSpacing?: k.BulletSpacing): k.BulletSpacing => {
      if (typeof itemSpacing === 'object') return itemSpacing;
      const spacing = props.spacing;
      if (typeof spacing === 'number') return { before: spacing, after: 0 };
      return typeof spacing === 'object' ? spacing : { before: 0, after: 0 };
    };

    const api = {
      orientation,
      renderers,
      item(item: k.BulletItem, i: number, style?: CssValue) {
        return (
          <BulletListLayoutItem
            key={`bullet.${i}`}
            index={i}
            total={items.length}
            item={item}
            orientation={orientation}
            bulletEdge={bullet.edge ?? 'near'}
            bulletSize={bullet.size ?? 15}
            spacing={toSpacing(item.spacing)}
            renderers={renderers}
            debug={props.debug}
            style={style}
          />
        );
      },
      items() {
        return items.map((item, i) => api.item(item, i));
      },
    };

    return api;
  },
};
