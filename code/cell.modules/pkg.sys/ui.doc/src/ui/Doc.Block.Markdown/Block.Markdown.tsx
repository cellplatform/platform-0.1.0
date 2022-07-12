import React, { useMemo } from 'react';
import { COLORS, css, CssValue, Markdown, t } from './common';

export type DocMarkdownBlockProps = {
  markdown?: string;
  margin?: t.DocBlockMargin;
  style?: CssValue;
};

export const DocMarkdownBlock: React.FC<DocMarkdownBlockProps> = (props) => {
  const { margin = {}, markdown } = props;

  /**
   * TODO 🐷
   * - anchors to target new tab (safely)
   */

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      marginTop: margin.top,
      marginBottom: margin.bottom,
    }),
    markdown: css({
      color: COLORS.DARK,
      fontKerning: 'auto',
      cursor: 'default',
    }),
  };

  const html = useMemo(() => {
    return Markdown.toElement({ markdown, style: styles.markdown });
  }, [markdown]); // eslint-disable-line

  return (
    <div {...css(styles.base, props.style)} className={Markdown.className}>
      {html}
    </div>
  );
};
