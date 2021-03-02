import React from 'react';

import { color, css, t } from '../common';
import { Markdown as MarkdownComponent } from '../Markdown';

export type MarkdownProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionMarkdown;
};

export const Markdown: React.FC<MarkdownProps> = (props) => {
  const { item } = props;
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      paddingLeft: 12,
      paddingRight: 15,
      PaddingY: 5,
      fontSize: 11,
      color: color.format(-0.4),
    }),
  };

  return <MarkdownComponent style={styles.base}>{item.markdown}</MarkdownComponent>;
};
