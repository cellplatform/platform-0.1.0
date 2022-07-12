import React from 'react';

import { Markdown as MD } from '@platform/util.markdown';
import { SanitizeHtml } from '../SanitizeHtml';
import { CssValue } from '../common';

/**
 * Tools for working with Markdown.
 */
export const Markdown = {
  className: 'sys-doc-md',

  toHtml(input?: string) {
    return MD.toHtmlSync(input ?? '');
  },

  toElement(props: { markdown?: string; style?: CssValue }) {
    console.log('toElement');
    const html = Markdown.toHtml(props.markdown ?? '');
    return <SanitizeHtml style={props.markdown} html={html} />;
  },
};
