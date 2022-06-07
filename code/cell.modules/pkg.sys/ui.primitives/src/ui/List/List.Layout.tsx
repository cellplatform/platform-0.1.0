import React from 'react';

import { css, t, FC } from './common';
import { Renderer } from './Renderer';
import { useContext } from './useCtx';
import { Cursor } from './Cursor';
import { Wrangle } from './Wrangle';

/**
 * Component specific
 */
export type ListLayoutProps = t.ListProps & {
  items: t.ListItem[] | t.ListCursor; // "Simple" list of items.
};

/**
 * Simple (non-virtualized) layout
 */
const View: React.FC<ListLayoutProps> = (props) => {
  const { tabIndex } = props;
  const items = Wrangle.items(props.items);
  const total = items.length;

  const ctx = useContext({ total, instance: props.instance });
  const { instance } = ctx;
  const renderer = Renderer({ instance, props, total });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: `${renderer.orientation}-stretch-stretch`,
      outline: 'none', // NB: supress default "focus" border.
    }),
  };

  const elements = items.map((item, index) => {
    return renderer.item({ item, index });
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

/**
 * Export
 */
type Fields = {
  //
};
export const ListLayout = FC.decorate<ListLayoutProps, Fields>(
  View,
  {},
  { displayName: 'List.Layout' },
);
