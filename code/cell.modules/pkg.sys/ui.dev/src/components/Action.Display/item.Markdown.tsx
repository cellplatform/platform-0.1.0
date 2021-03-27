import React from 'react';

import { color, css, Format, t, style } from '../common';
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
      boxSizing: 'border-box',
      paddingLeft: typeof item.indent === 'number' ? item.indent : undefined,
    }),
    md: css({
      position: 'relative',
      boxSizing: 'border-box',
      fontSize: 11,
      color: color.format(-0.4),
      ...style.toPadding(item.margin),
    }),
  };

  return (
    <div {...styles.base}>
      <MarkdownComponent style={styles.md}>{item.markdown}</MarkdownComponent>
    </div>
  );
};
