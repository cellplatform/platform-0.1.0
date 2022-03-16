import React from 'react';

import { css, t } from './common';
import { Renderer } from './Renderer';
import { useContext } from './useCtx';

/**
 * Component specific
 */
export type ListLayoutProps = t.ListProps & {
  items: t.ListItem[]; // "Simple" list of items.
};

/**
 * Simple (non-virtualized) layout
 */
export const ListLayout: React.FC<ListLayoutProps> = (props) => {
  const { items = [], tabIndex } = props;
  const total = items.length;

  const ctx = useContext({ total, event: props.event });
  const { bus, instance, state } = ctx;
  const renderer = Renderer({ bus, instance, props, state, total });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: `${renderer.orientation}-stretch-stretch`,
      outline: 'none', // NB: supress default "focus" border.
    }),
  };
  const elements = items.map((item, i) => renderer.item(item, i));

  return (
    <div
      {...css(styles.base, props.style)}
      ref={ctx.ui.ref}
      tabIndex={tabIndex}
      onMouseDown={ctx.ui.mouse.onMouseDown}
      onMouseUp={ctx.ui.mouse.onMouseUp}
      onMouseEnter={ctx.ui.mouse.onMouseEnter}
      onMouseLeave={ctx.ui.mouse.onMouseLeave}
      onFocus={ctx.ui.focus.onFocus}
      onBlur={ctx.ui.focus.onBlur}
    >
      {elements}
    </div>
  );
};
