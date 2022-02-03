import React from 'react';
import { css, CssValue, k } from './common';
import { BulletListLayoutItem } from './BulletList.Layout.Item';
import { Renderers } from './renderers';

type Pixels = number;

export type BulletListLayoutProps = {
  items?: k.BulletItem[];
  renderers?: { bullet?: k.BulletItemRenderer; body?: k.BulletItemRenderer };
  orientation?: k.BulletOrientation;
  bullet?: { edge?: k.BulletEdge; size?: Pixels };
  spacing?: number | k.BulletSpacing; // Number (defaults to) => { before }
  style?: CssValue;
  debug?: { border?: boolean };
};

export const BulletListLayout: React.FC<BulletListLayoutProps> = (props) => {
  const { orientation = 'y', bullet = {}, items = [] } = props;

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

  /**
   * [Render]
   */
  const styles = {
    base: css({ Flex: `${orientation}-stretch-stretch` }),
  };

  const elItems = items.map((item, i) => {
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
      />
    );
  });

  return <div {...css(styles.base, props.style)}>{elItems}</div>;
};
