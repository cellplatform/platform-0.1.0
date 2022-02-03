import React from 'react';

import { color, css, CssValue, k } from './common';
import { Renderers } from './renderers';

type Pixels = number;
type R = {
  bullet: k.BulletItemRenderer;
  body: k.BulletItemRenderer;
};

const DEFAULT_RENDERER: R = {
  bullet: Renderers.Bullet.ConnectorLines.render,
  body: Renderers.Body.Debug.render,
};

export type BulletListLayoutItemProps = {
  index: number;
  total: number;
  item: k.BulletItem;
  orientation: k.BulletOrientation;
  bulletEdge: k.BulletEdge;
  bulletSize: Pixels; // Offset size of the bullet row/column.
  spacing: k.BulletSpacing;
  renderers: R;
  style?: CssValue;
  debug?: { border?: boolean };
};

export const BulletListLayoutItem: React.FC<BulletListLayoutItemProps> = (props) => {
  const { item, orientation, index, total, renderers, debug = {} } = props;
  const { data } = item;

  const spacing = formatSpacing(props.spacing);
  const invertedOrientation = orientation === 'x' ? 'y' : 'x';

  const is: k.BulletItemArgs['is'] = {
    empty: total === 0,
    single: total === 1,
    first: index === 0,
    last: index === total - 1,
    edge: index === 0 || index === total - 1,
    horizontal: orientation === 'x',
    vertical: orientation === 'y',
    spacer: false,
    bullet: { near: props.bulletEdge === 'near', far: props.bulletEdge === 'far' },
  };

  const args: k.BulletItemArgs = {
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

    debug: css({
      borderTop: is.vertical && debugBorder,
      borderBottom: is.vertical && is.last && debugBorder,
      borderLeft: is.horizontal && debugBorder,
      borderRight: is.horizontal && is.last && debugBorder,
    }),
  };

  const renderContent: k.BulletItemRenderer = (args: k.BulletItemArgs) => {
    const parts = renderParts(args, renderers);
    const elBullet = <div {...styles.bullet.outer}>{parts.bullet}</div>;
    const elBody = <div {...styles.body.outer}>{parts.body}</div>;
    return placeInOrder(args.bullet.edge, elBullet, elBody);
  };

  const renderSpacer = (args: k.BulletItemArgs, edge: 'before' | 'after', offset: Pixels) => {
    if (offset === 0) return null;

    const styles = {
      base: css({
        position: 'relative',
        display: 'flex',
        Flex: `${invertedOrientation}-stretch-stretch`,
        height: is.vertical ? offset : undefined,
        width: is.horizontal ? offset : undefined,
      }),
      debug: css({
        borderTop: is.vertical && debugBorder,
        borderBottom: is.vertical && is.last && edge === 'after' && debugBorder,
        borderLeft: is.horizontal && debugBorder,
        borderRight: is.horizontal && is.last && edge === 'after' && debugBorder,
      }),
    };

    const e: k.BulletItemArgs = {
      ...args,
      kind: 'Spacing',
      is: { ...is, spacer: true },
    };

    return <div {...css(styles.base, styles.debug)}>{renderContent(e)}</div>;
  };

  /**
   * Main rendering.
   */
  const elMain = <div {...css(styles.main, styles.debug)}>{renderContent(args)}</div>;

  /**
   * Spacer rendering.
   */
  const elSpacer = {
    before: !is.first && renderSpacer(args, 'before', spacing.before),
    after: !is.last && renderSpacer(args, 'after', spacing.after),
  };

  /**
   * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
   *
   *                      EXTENSION Entry Point
   *
   * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
   *
   *    To add rendered elements above/below ("near" | "far") the
   *    item <Body>:
   *
   *    - 🌳 Expose a renderer within the <Body> section of the <Spacer> item above.
   *    - 🌳 Allow the height/width of the <Spacer> to be determined by the offset
   *         size of the rendered [JSX.Element]
   *    - 🌳 Surface as a flexible renderer property on the [{Item}].
   *
   *
   * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
   */

  /**
   * Component.
   */
  return (
    <div {...css(styles.base, props.style)}>
      {elSpacer.before}
      {elMain}
      {elSpacer.after}
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

function renderPart(
  e: k.BulletItemArgs,
  renderer: k.BulletItemRenderer,
  defaultRenderer: k.BulletItemRenderer,
) {
  const el = renderer(e);
  return (el === undefined ? defaultRenderer(e) : el) as JSX.Element | null;
}

function renderParts(e: k.BulletItemArgs, renderers: R) {
  return {
    bullet: renderPart(e, renderers.bullet, DEFAULT_RENDERER.bullet),
    body: renderPart(e, renderers.body, DEFAULT_RENDERER.body),
  };
}

function formatSpacing(input: k.BulletSpacing): Required<k.BulletSpacing> {
  const { before = 0, after = 0 } = input;
  return { before, after };
}
