import React from 'react';
import { css, CssValue, k, color } from './common';

export type BulletListItemProps = {
  index: number;
  total: number;
  item: k.BulletItem;
  orientation: k.BulletOrientation;
  bulletEdge: k.BulletEdge;
  spacing: number;
  renderer: { bullet: k.BulletItemRenderer; body: k.BulletItemRenderer };
  style?: CssValue;
  debug?: { border?: boolean };
};

export const BulletListItem: React.FC<BulletListItemProps> = (props) => {
  const { item, orientation, bulletEdge, index, total, renderer, spacing, debug = {} } = props;

  const data = item.data;
  const invertedOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';

  const is: k.BulletItemProps['is'] = {
    first: index === 0,
    last: index === total - 1,
    edge: index === 0 || index === total - 1,
    vertical: orientation === 'vertical',
    horizontal: orientation === 'horizontal',
    spacer: false,
  };
  const args: k.BulletItemProps = { index, total, data, orientation, bulletEdge, spacing, is };

  console.log('spacing', spacing);

  /**
   * [Render]
   */
  const debugBorder = debug.border ? `solid 1px ${color.format(-0.1)}` : undefined;
  const styles = {
    base: css({ position: 'relative' }),
    main: css({
      Flex: `${invertedOrientation}-stretch-stretch`,
    }),
    debug: css({
      borderTop: debugBorder,
      borderBottom: args.is.last ? debugBorder : undefined,
      borderLeft: debugBorder,
      borderRight: debugBorder,
    }),
    spacer: css({
      backgroundColor: 'rgba(255, 0, 0, 0.03)' /* RED */,
      height: 10, // TEMP 🐷
    }),
  };

  const elBullet = renderer.bullet(args) ?? <div />;
  const elBody = renderer.body(args) ?? <div />;

  const elMain = (
    <>
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
    </>
  );

  const elSpacer = <div {...styles.spacer}></div>;

  return (
    <div {...css(styles.base, styles.debug, props.style)}>
      <div {...css(styles.main)}>{elMain}</div>
      {elSpacer}
    </div>
  );
};
