import React from 'react';
import sanitizeHtml from 'sanitize-html';

import { css, CssValue } from '../common';

export type SanitizeHtmlProps = {
  html?: string;
  className?: string;
  style?: CssValue;
};

/**
 * See:
 *    https://www.npmjs.com/package/sanitize-html
 *    https://stackoverflow.com/a/38663813
 */
export const SanitizeHtml: React.FC<SanitizeHtmlProps> = (props) => {
  const { html, className } = props;
  const __html = sanitizeHtml(html ?? '');
  return <div {...css(props.style)} dangerouslySetInnerHTML={{ __html }} className={className} />;
};
