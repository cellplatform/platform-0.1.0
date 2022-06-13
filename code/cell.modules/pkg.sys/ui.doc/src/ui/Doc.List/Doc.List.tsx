import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, FC, DEFAULT, List } from './common';
import { renderers } from './ui/renderers';
import { LayoutSize } from '../Doc.LayoutContainer';

export type DocListProps = {
  sizes?: t.DocLayoutSizes;
  showAsCards?: boolean | t.DocListCardType;
  connectorLines?: boolean;
  tracelines?: boolean;

  style?: CssValue;
};

const View: React.FC<DocListProps> = (props) => {
  const { sizes, tracelines } = props;

  /**
   * TODO 🐷
   *  Pass in cursor
   */
  const items: t.ListItem[] = [];

  const push = () => {
    const sizes = props.sizes ?? LayoutSize.dummy();
    const data: t.DocListItemData = {
      sizes,
      showAsCard: props.showAsCards,
      connectorLines: Boolean(props.connectorLines),
    };
    items.push({ data });
  };

  Array.from({ length: 150 }).forEach(() => push());

  const total = items.length;
  const getData: t.GetListItem = (index) => items[index];
  const getSize: t.GetListItemSize = () => 140;
  const cursor = { total, getData, getSize };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', display: 'flex' }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <List.Virtual
        cursor={cursor}
        renderers={renderers}
        debug={{ tracelines }}
        style={{ flex: 1 }}
      />
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
};
export const DocList = FC.decorate<DocListProps, Fields>(
  View,
  { DEFAULT },
  { displayName: 'Doc.List' },
);
