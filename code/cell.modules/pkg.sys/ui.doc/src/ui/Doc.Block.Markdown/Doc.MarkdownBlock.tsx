import React from 'react';
import { COLORS, css, CssValue, Markdown, SanitizeHtml } from './common';

export type DocMarkdownBlockProps = {
  markdown?: string;
  style?: CssValue;
};

export const DocMarkdownBlock: React.FC<DocMarkdownBlockProps> = (props) => {
  const html = Markdown.toHtmlSync(props.markdown ?? '');

  /**
   * TODO 🐷
   * - anchors to target new tab (safely)
   */

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    markdown: css({
      color: COLORS.DARK,
      fontKerning: 'auto',
    }),
  };
  return (
    <div {...css(styles.base, props.style)} className={Markdown.className}>
      <SanitizeHtml style={styles.markdown} html={html} />
    </div>
  );
};
