import React from 'react';

import { Markdown as MD } from '../../Markdown';
import { SanitizeHtml } from '../SanitizeHtml';
import { CssValue, t, Style } from '../common';

const globalStyles: { [className: string]: boolean } = {};

/**
 * Tools for working with Markdown.
 */
export const Markdown = {
  /**
   * Transform markdown text into HTML elements.
   */
  toHtml(markdown?: string) {
    return MD.toHtmlSync(markdown ?? '');
  },

  /**
   * Transform markdown into a sanitized (safe) DOM element.
   */
  toElement(markdown: string | undefined, options: { style?: CssValue; className?: string } = {}) {
    const html = Markdown.toHtml(markdown ?? '');
    return <SanitizeHtml html={html} style={options.style} className={options.className} />;
  },

  /**
   * Register styles
   */
  ensureStyles(className: string, styles: t.CssPropsMap, options: { force?: boolean } = {}) {
    const exists = Boolean(globalStyles[className]);
    if (!exists || options.force) Style.global(styles, { prefix: `.${className}` });
    globalStyles[className] = true;
    return { exists, className };
  },
};
