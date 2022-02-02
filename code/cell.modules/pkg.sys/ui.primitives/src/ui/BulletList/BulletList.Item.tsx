import React from 'react';
import { css, CssValue, k, color } from './common';

type Pixels = number;

export type BulletListItemProps = {
  index: number;
  total: number;
  item: k.BulletItem;
  orientation: k.BulletOrientation;
  bulletEdge: k.BulletEdge;
  bulletSize: Pixels; // Offset size of the bullet row/column.
  spacing: number;
  renderer: { bullet: k.BulletItemRenderer; body: k.BulletItemRenderer };
  style?: CssValue;
  debug?: { border?: boolean };
};

export const BulletListItem: React.FC<BulletListItemProps> = (props) => {
  const { item, orientation, index, total, renderer, spacing, debug = {} } = props;

  const data = item.data;
  const invertedOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';

  const is: k.BulletItemProps['is'] = {
    empty: total === 0,
    single: total === 1,
    first: index === 0,
    last: index === total - 1,
    edge: index === 0 || index === total - 1,
    vertical: orientation === 'vertical',
    horizontal: orientation === 'horizontal',
    spacing: false,
    bullet: { near: props.bulletEdge === 'near', far: props.bulletEdge === 'far' },
  };
  const args: k.BulletItemProps = {
    kind: 'Default',
    index,
    total,
    data,
    orientation,
    bullet: { edge: props.bulletEdge, size: props.bulletSize },
    spacing,
    is,
  };

  /**
   * [Render]
   */
  const debugBorder = debug.border ? `solid 1px ${color.format(-0.06)}` : undefined;
  const styles = {
    base: css({ Flex: `${orientation}-stretch-stretch` }),
    main: css({ Flex: `${invertedOrientation}-stretch-stretch` }),

    bullet: {
      outer: css({
        display: 'flex',
        position: 'relative',
        width: is.vertical && args.bullet.size,
        height: is.horizontal && args.bullet.size,
      }),
    },

    body: {
      outer: css({ flex: 1 }),
    },

    spacer: {
      outer: css({
        Flex: `${invertedOrientation}-stretch-stretch`,
        display: 'flex',
        position: 'relative',
        height: is.vertical ? spacing : undefined,
        width: is.horizontal ? spacing : undefined,
      }),
    },

    debug: css({
      border: debugBorder,
      borderBottom: is.vertical && is.last ? undefined : 'none',
      borderRight: is.horizontal && is.last ? undefined : 'none',
    }),
  };

  const elBullet = <div {...styles.bullet.outer}>{renderer.bullet(args)}</div>;
  const elBody = renderer.body(args) ?? <div />;
  const elMain = placeInOrder(args.bullet.edge, elBullet, elBody);

  const elSpacer = (() => {
    if (spacing === 0 || is.last) return null;

    const e: k.BulletItemProps = {
      ...args,
      kind: 'Spacing',
      is: { ...is, spacing: true },
    };
    const elBullet = <div {...styles.bullet.outer}>{renderer.bullet(e)}</div>;
    const elBody = <div {...styles.body.outer}>{renderer.body(e)}</div>;

    return (
      <div {...css(styles.spacer.outer, styles.debug)}>
        {placeInOrder(args.bullet.edge, elBullet, elBody)}
      </div>
    );
  })();

  return (
    <div {...css(styles.base, props.style)}>
      <div {...css(styles.main, styles.debug)}>{elMain}</div>
      {elSpacer}
    </div>
  );
};

/**
 * [Helpers]
 */

function placeInOrder(edge: k.BulletEdge, bullet: JSX.Element, body: JSX.Element) {
  if (edge === 'near') {
    return (
      <>
        {bullet}
        {body}
      </>
    );
  }

  if (edge === 'far') {
    return (
      <>
        {body}
        {bullet}
      </>
    );
  }

  throw new Error(`Edge '${edge}' not supported`);
}
