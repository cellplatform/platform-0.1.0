import React from 'react';

import { color, css, Format, t } from '../common';
import { Markdown as MarkdownComponent } from '../Markdown';

export type MarkdownProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionMarkdown;
};

export const Markdown: React.FC<MarkdownProps> = (props) => {
  const { item } = props;
  const margin = Format.toEdges(item.margin);

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      fontSize: 11,
      color: color.format(-0.4),
      paddingTop: margin.top,
      paddingRight: margin.right,
      paddingBottom: margin.bottom,
      paddingLeft: margin.left,
    }),
  };

  return <MarkdownComponent style={styles.base}>{item.markdown}</MarkdownComponent>;
};
