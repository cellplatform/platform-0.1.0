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

  const elements = items.map((item, i) => {
    return renderer.item(item, i);
  });

  return (
    <div
      tabIndex={tabIndex}
      ref={ctx.list.ref}
      {...ctx.list.handlers}
      {...css(styles.base, props.style)}
    >
      {elements}
    </div>
  );
};
