import React from 'react';
import { css, CssValue, k } from './common';
import { BulletListItem } from './BulletList.Item';

type Pixels = number;

export type BulletListProps = {
  renderers: { bullet: k.BulletItemRenderer; body: k.BulletItemRenderer };
  items?: k.BulletItem[];
  orientation?: k.BulletOrientation;
  bulletEdge?: k.BulletEdge;
  bulletSize: Pixels; // Offset size of the bullet row/column.
  spacing?: number | k.BulletSpacing; // Number (defaults to) => { before }
  style?: CssValue;
  debug?: { border?: boolean };
};

export const BulletList: React.FC<BulletListProps> = (props) => {
  const { orientation = 'vertical', bulletEdge = 'near', bulletSize = 15, items = [] } = props;

  const toSpacing = (itemSpacing?: k.BulletSpacing): k.BulletSpacing => {
    if (typeof itemSpacing === 'object') return itemSpacing;

    const prop = props.spacing;
    if (typeof prop === 'number') return { before: prop, after: 0 };
    return typeof prop === 'object' ? prop : { before: 0, after: 0 };
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ Flex: `${orientation}-stretch-stretch` }),
  };

  const elItems = items.map((item, i) => {
    return (
      <BulletListItem
        key={`bullet.${i}`}
        index={i}
        total={items.length}
        item={item}
        orientation={orientation}
        bulletEdge={bulletEdge}
        bulletSize={bulletSize}
        spacing={toSpacing(item.spacing)}
        renderers={props.renderers}
        debug={props.debug}
      />
    );
  });

  return <div {...css(styles.base, props.style)}>{elItems}</div>;
};
