import React from 'react';
import { COLORS, css, CssValue, Markdown, SanitizeHtml, t } from './common';

export type DocMarkdownBlockProps = {
  markdown?: string;
  margin?: t.DocBlockMargin;
  style?: CssValue;
};

export const DocMarkdownBlock: React.FC<DocMarkdownBlockProps> = (props) => {
  const { margin = {} } = props;
  const html = Markdown.toHtmlSync(props.markdown ?? '');

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
  return (
    <div {...css(styles.base, props.style)} className={Markdown.className}>
      <SanitizeHtml style={styles.markdown} html={html} />
    </div>
  );
};
