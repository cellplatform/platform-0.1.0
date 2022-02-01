import React from 'react';
import { css, CssValue, k, color } from './common';

export type BulletListItemProps = {
  data: any;
  orientation: k.BulletOrientation;
  bulletEdge: k.BulletEdge;
  index: number;
  total: number;
  bulletRenderer: k.BulletRenderer;
  bodyRenderer: k.BulletRenderer;
  style?: CssValue;
  debug?: { border?: boolean };
};

export const BulletListItem: React.FC<BulletListItemProps> = (props) => {
  const {
    data,
    orientation,
    bulletEdge,
    index,
    total,
    bulletRenderer,
    bodyRenderer,
    debug = {},
  } = props;
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
  const debugBorder = debug.border ? `solid 1px ${color.format(-0.1)}` : undefined;
  const styles = {
    base: css({
      Flex: `${invertedOrientation}-stretch-stretch`,
    }),
    baseDebug: css({
      borderTop: debugBorder,
      borderBottom: args.is.last ? debugBorder : undefined,
      borderLeft: debugBorder,
      borderRight: debugBorder,
    }),
  };

  const elBullet = bulletRenderer(args) ?? <div />;
  const elBody = bodyRenderer(args) ?? <div />;

  return (
    <div {...css(styles.base, styles.baseDebug, props.style)}>
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
