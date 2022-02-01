import React from 'react';
import { css, CssValue, t, k } from './common';
import { BulletListItem } from './BulletList.Item';

export type BulletListProps = {
  renderer: { bullet: k.BulletItemRenderer; body: k.BulletItemRenderer };
  items?: k.BulletItem[];
  orientation?: k.BulletOrientation;
  bulletEdge?: k.BulletEdge;
  spacing?: number;
  style?: CssValue;
  debug?: { border?: boolean };
};

export const BulletList: React.FC<BulletListProps> = (props) => {
  const { orientation = 'vertical', bulletEdge = 'near', items = [] } = props;

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
        spacing={spacing}
        renderer={props.renderer}
        debug={props.debug}
      />
    );
  });

  return <div {...css(styles.base, props.style)}>{elItems}</div>;
};
