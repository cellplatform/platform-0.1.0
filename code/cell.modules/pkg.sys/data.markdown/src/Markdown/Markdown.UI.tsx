import React from 'react';

import { CssValue, Style, t } from '../common';
import { SanitizeHtml } from '../SanitizeHtml';
import { MarkdownProcessor } from './Markdown.Processor';

const globalStyles: { [className: string]: boolean } = {};

export const MarkdownUI = {
  /**
   * Transform markdown into a sanitized (safe) DOM element.
   */
  toElement(markdown: string | undefined, options: { style?: CssValue; className?: string } = {}) {
    const html = MarkdownProcessor.toHtmlSync(markdown ?? '');
    return <SanitizeHtml html={html} style={options.style} className={options.className} />;
  },

  /**
   * Register markdown CSS styles
   */
  ensureStyles(className: string, styles: t.CssPropsMap, options: { force?: boolean } = {}) {
    const exists = Boolean(globalStyles[className]);
    if (!exists || options.force) Style.global(styles, { prefix: `.${className}` });
    globalStyles[className] = true;
    return { exists, className };
  },
};
