import React from 'react';
import { css, CssValue, t, k } from './common';
import { BulletListItem } from './BulletList.Item';

export type BulletListProps = {
  items?: any[];
  orientation?: k.BulletOrientation;
  bulletEdge?: k.BulletEdge;
  bulletRenderer: k.BulletRenderer;
  bodyRenderer: k.BulletRenderer;
  style?: CssValue;
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
    return (
      <BulletListItem
        key={`bullet.${i}`}
        index={i}
        total={items.length}
        data={item}
        orientation={orientation}
        bulletEdge={bulletEdge}
        bulletRenderer={props.bulletRenderer}
        bodyRenderer={props.bodyRenderer}
      />
    );
  });

  return <div {...css(styles.base, props.style)}>{elItems}</div>;
};
