import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, k } from './common';

export type BulletListItemProps = {
  item: k.BulletItem;
  orientation: k.BulletOrientation;
  bulletEdge: k.BulletEdge;
  index: number;
  total: number;
  style?: CssValue;
};

export const BulletListItem: React.FC<BulletListItemProps> = (props) => {
  const { item, orientation, bulletEdge, index, total } = props;
  const invertedOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';

  const args: k.BulletRenderArgs = {
    orientation,
    edge: bulletEdge,
    index,
    total,
    is: {
      first: index === 0,
      last: index === total - 1,
      vertical: orientation === 'vertical',
      horizontal: orientation === 'horizontal',
      bulletNear: bulletEdge === 'near',
      bulletFar: bulletEdge === 'far',
    },
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: `${invertedOrientation}-stretch-stretch`,
    }),
  };

  const elBullet = item.renderBullet(args);
  const elBody = item.renderBody(args);

  return (
    <div {...css(styles.base, props.style)}>
      {bulletEdge === 'near' && (
        <>
          {elBullet}
          {elBody}
        </>
      )}
      {bulletEdge === 'far' && (
        <>
          {elBody}
          {elBullet}
        </>
      )}
    </div>
  );
};
