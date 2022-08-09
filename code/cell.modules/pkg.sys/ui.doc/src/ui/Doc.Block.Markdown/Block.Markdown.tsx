import React, { useMemo } from 'react';
import { FC, COLORS, css, CssValue, Markdown, t } from './common';
import { markdownStyles, className } from './styles';

export type DocMarkdownBlockProps = {
  markdown?: string;
  margin?: t.DocBlockMargin;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<DocMarkdownBlockProps> = (props) => {
  const { margin = {}, markdown } = props;
  ensureStyles();

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
  };

  const html = useMemo(() => {
    const style = css({
      color: COLORS.DARK,
      fontKerning: 'auto',
      cursor: 'default',
    });
    return Markdown.UI.toElement(markdown, { style, className });
  }, [markdown]); // eslint-disable-line

  return <div {...css(styles.base, props.style)}>{html}</div>;
};

/**
 * Helpers
 */
function ensureStyles() {
  return Markdown.UI.ensureStyles(className, markdownStyles);
}

/**
 * Export
 */
type Fields = {
  className: string;
  ensureStyles: typeof ensureStyles;
};
export const DocMarkdownBlock = FC.decorate<DocMarkdownBlockProps, Fields>(
  View,
  { className, ensureStyles },
  { displayName: 'Doc.MarkdownBlock' },
);
