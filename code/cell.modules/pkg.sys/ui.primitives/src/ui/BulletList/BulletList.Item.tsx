import React from 'react';
import { css, CssValue, k } from './common';

export type BulletListItemProps = {
  data: any;
  orientation: k.BulletOrientation;
  bulletEdge: k.BulletEdge;
  index: number;
  total: number;
  bulletRenderer: k.BulletRenderer;
  bodyRenderer: k.BulletRenderer;
  style?: CssValue;
};

export const BulletListItem: React.FC<BulletListItemProps> = (props) => {
  const { data, orientation, bulletEdge, index, total, bulletRenderer, bodyRenderer } = props;
  const invertedOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';

  const args: k.BulletProps = {
    data,
    orientation,
    edge: bulletEdge,
    index,
    total,
    is: {
      first: index === 0,
      last: index === total - 1,
      edge: index === 0 || index === total - 1,
      vertical: orientation === 'vertical',
      horizontal: orientation === 'horizontal',
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

  const elBullet = bulletRenderer(args) ?? <div />;
  const elBody = bodyRenderer(args) ?? <div />;

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
