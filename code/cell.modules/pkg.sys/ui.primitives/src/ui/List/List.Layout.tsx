import React, { useRef } from 'react';

import { css, CssValue, DEFAULTS, eventDummy, t, useEventPipe } from './common';
import { ListLayoutItem } from './List.Layout.Item';
import { Renderers } from './renderers';

type Pixels = number;

/**
 * Shared with "Virtual" variant of the component.
 */
export type ListProps = {
  event?: t.ListEventArgs;
  renderers?: { bullet?: t.ListBulletRenderer; body?: t.ListBulletRenderer };
  selection?: t.ListSelection;
  orientation?: t.ListOrientation;
  bullet?: { edge?: t.ListBulletEdge; size?: Pixels };
  spacing?: number | t.ListBulletSpacing; // Number (defaults to) => { before }
  tabIndex?: number;
  style?: CssValue;
  debug?: { border?: boolean };
};

/**
 * Component specific
 */
export type ListLayoutProps = ListProps & {
  items: t.ListItem[]; // "Simple" list of items.
};

/**
 * Simple (non-virtualized) layout
 */
export const ListLayout: React.FC<ListLayoutProps> = (props) => {
  const { items = [], tabIndex } = props;
  const total = items.length;

  const refEvent = useRef<t.ListEventArgs>(props.event ?? eventDummy());
  const event = refEvent.current;
  const { bus, instance } = event;

  const ctx: t.CtxList = { kind: 'List', total };
  const ui = useEventPipe<t.CtxList, HTMLDivElement>({ bus, instance, ctx, focusRedraw: true });
  const isFocused = ui.element.containsFocus;
  const renderer = Util.renderer({ props, total, event, isFocused });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: `${renderer.orientation}-stretch-stretch`,
      outline: 'none', // NB: supress default "focus" border
    }),
  };
  const elements = items.map((item, i) => renderer.item(item, i));

  return (
    <div
      {...css(styles.base, props.style)}
      ref={ui.ref}
      tabIndex={tabIndex}
      onMouseDown={ui.mouse.onMouseDown}
      onMouseUp={ui.mouse.onMouseUp}
      onMouseEnter={ui.mouse.onMouseEnter}
      onMouseLeave={ui.mouse.onMouseLeave}
      onFocus={ui.focus.onFocus}
      onBlur={ui.focus.onBlur}
    >
      {elements}
    </div>
  );
};

/**
 * Helpers
 */

export const Util = {
  renderer(args: { props: ListProps; total: number; event: t.ListEventArgs; isFocused: boolean }) {
    const { props, total, event, isFocused } = args;
    const { orientation = DEFAULTS.Orientation, bullet = {} } = props;

    const renderers = {
      bullet: props.renderers?.bullet ?? Renderers.asRenderer(Renderers.Bullet.ConnectorLines),
      body: props.renderers?.body ?? Renderers.asRenderer(Renderers.Body.Default),
    };

    const toSpacing = (itemSpacing?: t.ListBulletSpacing): t.ListBulletSpacing => {
      if (typeof itemSpacing === 'object') return itemSpacing;
      const spacing = props.spacing;
      if (typeof spacing === 'number') return { before: spacing, after: 0 };
      return typeof spacing === 'object' ? spacing : { before: 0, after: 0 };
    };

    const api = {
      orientation,
      renderers,
      item(item: t.ListItem, index: number, style?: CssValue) {
        return (
          <ListLayoutItem
            event={event}
            key={`bullet.${index}`}
            index={index}
            total={total}
            renderers={renderers}
            item={item}
            selection={props.selection}
            orientation={orientation}
            isFocused={isFocused}
            bullet={{ edge: bullet.edge ?? 'near', size: bullet.size ?? 15 }}
            spacing={toSpacing(item.spacing)}
            debug={props.debug}
            style={style}
          />
        );
      },
    };

    return api;
  },
};
