import React, { useEffect, useState } from 'react';
import { css, CssValue, Markdown } from '../common';
import { SanitizeHtml } from './SanitizeHtml';

export type MarkdownViewProps = {
  text?: string;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<MarkdownViewProps> = (props) => {
  const [html, setHtml] = useState('');

  /**
   * Lifecycle
   */
  useEffect(() => {
    const html = typeof props.text === 'string' ? Markdown.toHtmlSync(props.text) : '';
    setHtml(html);
  }, [props.text]); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      Padding: [20, 30],
      Scroll: true,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <SanitizeHtml html={html} />
    </div>
  );
};

/**
 * Memoized
 */
export const MarkdownView = React.memo(View, (prev, next) => {
  return prev.text === next.text;
});
