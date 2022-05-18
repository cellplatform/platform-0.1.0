import React from 'react';

import { color, css, CssValue, t, UIEvent } from './common';
import { Renderers } from './renderers';
import { useDynamicItemState } from './useDynamicState';

/**
 * Types
 */
type Pixels = number;
type R = {
  bullet?: t.ListItemRenderer;
  body: t.ListItemRenderer;
};

export type ListLayoutItemProps = {
  instance: t.ListInstance;
  index: number;
  total: number;
  item: t.ListItem;
  orientation: t.ListOrientation;
  state?: t.ListStateLazy;
  bullet: {
    edge: t.ListBulletEdge;
    size: Pixels; // Offset size of the bullet row/column.
  };
  spacing: t.ListBulletSpacing;
  renderers: R;
  isScrolling?: boolean;
  style?: CssValue;
  debug?: t.ListPropsDebug;
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
  const { bus, id } = props.instance;
  const { index, total, item, orientation, renderers, bullet, debug = {} } = props;
  const { data } = item;

  const ctx: t.CtxItem = { kind: 'Item', index, total, item };
  const ui = UIEvent.useEventPipe<t.CtxItem, HTMLDivElement>({ bus, instance: id, ctx });
  const dynamic = useDynamicItemState({ index, total, orientation, bullet, state: props.state });

  const spacing = formatSpacing(props.spacing);
  const invertedOrientation = orientation === 'x' ? 'y' : 'x';
  const scrolling = Boolean(props.isScrolling);
  const is: t.ListItemRenderFlags = { ...dynamic.is, scrolling };
  const args: t.ListItemRendererArgs = {
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
  const tracelines = debug.tracelines ? `solid 1px ${color.format(-0.06)}` : undefined;
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
      borderTop: is.vertical && tracelines,
      borderBottom: is.vertical && is.last && tracelines,
      borderLeft: is.horizontal && tracelines,
      borderRight: is.horizontal && is.last && tracelines,
    }),
  };

  const renderContent: t.ListItemRenderer = (args: t.ListItemRendererArgs) => {
    const parts = renderParts(args, renderers);
    const elBullet = parts.bullet && <div {...styles.bullet.outer}>{parts.bullet}</div>;
    const elBody = <div {...styles.body.outer}>{parts.body}</div>;
    return placeInOrder(args.bullet.edge, elBullet, elBody);
  };

  const renderSpacer = (args: t.ListItemRendererArgs, edge: 'before' | 'after', offset: Pixels) => {
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
        borderTop: is.vertical && tracelines,
        borderBottom: is.vertical && is.last && edge === 'after' && tracelines,
        borderLeft: is.horizontal && tracelines,
        borderRight: is.horizontal && is.last && edge === 'after' && tracelines,
      }),
    };

    const e: t.ListItemRendererArgs = {
      ...args,
      kind: 'Spacing',
      is: { ...is, spacer: true },
    };

    return <div {...css(styles.base, styles.debug)}>{renderContent(e)}</div>;
  };

  /**
   * TODO 🐷 BUG
   * - is.scrolling flag
   *
   *
   */

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
    <div {...css(styles.base, props.style)} key={`item.${index}`}>
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
  e: t.ListItemRendererArgs,
  renderer: t.ListItemRenderer,
  defaultRenderer?: t.ListItemRenderer,
) {
  const el = renderer(e);
  return (el === undefined ? defaultRenderer?.(e) : el) as JSX.Element | null;
}

function renderParts(e: t.ListItemRendererArgs, renderers: R) {
  return {
    bullet: renderers.bullet ? renderPart(e, renderers.bullet) : undefined,
    body: renderPart(e, renderers.body, DEFAULT_RENDERER.body),
  };
}

function formatSpacing(input: t.ListBulletSpacing): Required<t.ListBulletSpacing> {
  const { before = 0, after = 0 } = input;
  return { before, after };
}
