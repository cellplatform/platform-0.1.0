import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, k } from './common';
import { BulletListItem } from './BulletList.Item';

export type BulletListProps = {
  items?: k.BulletItem[];
  orientation?: k.BulletOrientation;
  edge?: k.BulletEdge; // TODO 🐷 - move to renderer?
  style?: CssValue;
};

export const BulletList: React.FC<BulletListProps> = (props) => {
  const { orientation = 'vertical', edge = 'near', items = [] } = props;
  const total = items.length;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: `${orientation}-stretch-stretch`,
    }),
  };

  const elItems = items.map((item, i) => {
    return (
      <BulletListItem
        key={`bullet.${i}`}
        item={item}
        orientation={orientation}
        bulletEdge={edge}
        index={i}
        total={total}
      />
    );
  });

  return <div {...css(styles.base, props.style)}>{elItems}</div>;
};
