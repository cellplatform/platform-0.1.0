import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, SanitizeHtml, Markdown, Style } from './common';

export type DocBlockProps = {
  markdown?: string;
  style?: CssValue;
};

export const DocBlock: React.FC<DocBlockProps> = (props) => {
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
    }),
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
