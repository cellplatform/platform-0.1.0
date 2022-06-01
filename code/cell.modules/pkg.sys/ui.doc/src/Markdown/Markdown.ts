import { Markdown as MD } from '@platform/util.markdown';

/**
 * Tools for working with Markdown.
 */
export const Markdown = {
  className: 'sys-doc-md',

  toHtmlSync(input?: string) {
    return MD.toHtmlSync(input ?? '');
  },
};
