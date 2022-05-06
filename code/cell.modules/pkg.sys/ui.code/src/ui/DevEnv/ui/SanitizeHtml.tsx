import React from 'react';
import sanitizeHtml from 'sanitize-html';

import { css, CssValue } from '../common';

export type SanitizeHtmlProps = {
  html?: string;
  style?: CssValue;
};

/**
 * See:
 *    https://www.npmjs.com/package/sanitize-html
 *    https://stackoverflow.com/a/38663813
 */
export const SanitizeHtml: React.FC<SanitizeHtmlProps> = (props) => {
  const __html = sanitizeHtml(props.html ?? '');

  /**
   * [Render]
   */
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)} dangerouslySetInnerHTML={{ __html }} />;
};
