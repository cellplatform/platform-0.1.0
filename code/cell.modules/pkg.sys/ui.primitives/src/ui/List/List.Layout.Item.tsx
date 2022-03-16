import React from 'react';

import { color, css, CssValue, Is, t, UIEvent } from './common';
import { Renderers } from './renderers';

/**
 * Types
 */
type Pixels = number;
type R = {
  bullet?: t.ListBulletRenderer;
  body: t.ListBulletRenderer;
};

export type ListLayoutItemProps = {
  event: t.ListEventArgs;
  index: number;
  total: number;
  item: t.ListItem;
  orientation: t.ListOrientation;
  state?: t.ListState;
  selection?: t.ListSelection;
  bullet: {
    edge: t.ListBulletEdge;
    size: Pixels; // Offset size of the bullet row/column.
  };
  spacing: t.ListBulletSpacing;
  renderers: R;
  style?: CssValue;
  debug?: { border?: boolean };
};

/**
 * Constants
 */
const DEFAULT_RENDERER: R = {
  body: Renderers.asRenderer(Renderers.Body.Default),
};

/**
 * Component
 */
export const ListLayoutItem: React.FC<ListLayoutItemProps> = (props) => {
  const { bus, instance } = props.event;
  const {
    item,
    orientation,
    index,
    total,
    renderers,
    debug = {},
    bullet,
    selection,
    state,
  } = props;
  const { data } = item;

  const ctx: t.CtxItem = { kind: 'Item', index, total, item };
  const ui = UIEvent.useEventPipe<t.CtxItem, HTMLDivElement>({ bus, instance, ctx });

  const spacing = formatSpacing(props.spacing);
  const invertedOrientation = orientation === 'x' ? 'y' : 'x';
  const is = Is.toItemFlags({
    index,
    total,
    bullet,
    orientation,
    selection,
    state,
  });

  const args: t.ListBulletRendererArgs = {
    kind: 'Default',
    index,
    total,
    data,
    orientation,
    bullet,
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

  const renderContent: t.ListBulletRenderer = (args: t.ListBulletRendererArgs) => {
    const parts = renderParts(args, renderers);
    const elBullet = parts.bullet && <div {...styles.bullet.outer}>{parts.bullet}</div>;
    const elBody = <div {...styles.body.outer}>{parts.body}</div>;
    return placeInOrder(args.bullet.edge, elBullet, elBody);
  };

  const renderSpacer = (
    args: t.ListBulletRendererArgs,
    edge: 'before' | 'after',
    offset: Pixels,
  ) => {
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

    const e: t.ListBulletRendererArgs = {
      ...args,
      kind: 'Spacing',
      is: { ...is, spacer: true },
    };

    return <div {...css(styles.base, styles.debug)}>{renderContent(e)}</div>;
  };

  /**
   * Main rendering.
   */
  const elMain = (
    <div
      {...css(styles.main, styles.debug)}
      ref={ui.ref}
      onMouseDown={ui.mouse.onMouseDown}
      onMouseUp={ui.mouse.onMouseUp}
      onMouseEnter={ui.mouse.onMouseEnter}
      onMouseLeave={ui.mouse.onMouseLeave}
    >
      {renderContent(args)}
    </div>
  );

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

type RenderOutput = JSX.Element | null | undefined | false;
function placeInOrder(edge: t.ListBulletEdge, bullet: RenderOutput, body: RenderOutput) {
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

  throw new Error(`"${edge}" not supported`);
}

function renderPart(
  e: t.ListBulletRendererArgs,
  renderer: t.ListBulletRenderer,
  defaultRenderer?: t.ListBulletRenderer,
) {
  const el = renderer(e);
  return (el === undefined ? defaultRenderer?.(e) : el) as JSX.Element | null;
}

function renderParts(e: t.ListBulletRendererArgs, renderers: R) {
  return {
    bullet: renderers.bullet ? renderPart(e, renderers.bullet) : undefined,
    body: renderPart(e, renderers.body, DEFAULT_RENDERER.body),
  };
}

function formatSpacing(input: t.ListBulletSpacing): Required<t.ListBulletSpacing> {
  const { before = 0, after = 0 } = input;
  return { before, after };
}
