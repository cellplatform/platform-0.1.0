import React, { useEffect, useState } from 'react';
import { css, CssValue, Markdown } from '../common';

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
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };

  const style = css(styles.base, props.style);
  return Markdown.UI.toElement(html, { style });
};

/**
 * Memoized
 */
export const MarkdownView = React.memo(View, (prev, next) => {
  return prev.text === next.text;
});
