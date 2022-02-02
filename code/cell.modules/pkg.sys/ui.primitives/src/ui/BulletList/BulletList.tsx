import React from 'react';
import { css, CssValue, t, k } from './common';
import { BulletListItem } from './BulletList.Item';

type Pixels = number;

export type BulletListProps = {
  renderer: { bullet: k.BulletItemRenderer; body: k.BulletItemRenderer };
  items?: k.BulletItem[];
  orientation?: k.BulletOrientation;
  bulletEdge?: k.BulletEdge;
  bulletSize: Pixels; // Offset size of the bullet row/column.
  spacing?: number;
  style?: CssValue;
  debug?: { border?: boolean };
};

export const BulletList: React.FC<BulletListProps> = (props) => {
  const { orientation = 'vertical', bulletEdge = 'near', bulletSize = 15, items = [] } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ Flex: `${orientation}-stretch-stretch` }),
  };

  const elItems = items.map((item, i) => {
    const spacing = typeof item.spacing === 'number' ? item.spacing : props.spacing ?? 0;
    return (
      <BulletListItem
        key={`bullet.${i}`}
        index={i}
        total={items.length}
        item={item}
        orientation={orientation}
        bulletEdge={bulletEdge}
        bulletSize={bulletSize}
        spacing={spacing}
        renderer={props.renderer}
        debug={props.debug}
      />
    );
  });

  return <div {...css(styles.base, props.style)}>{elItems}</div>;
};
