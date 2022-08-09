import { unified, Processor } from 'unified';
import markdown from 'remark-parse';
import html from 'rehype-stringify';

import remark2rehype from 'remark-rehype';
import format from 'rehype-format';

/**
 * See:
 *   - https://github.com/remarkjs/remark-rehype
 */
export const Markdown = {
  /**
   * Converts the given markdown to HTML asynchronously.
   */
  async toHtml(markdown: string): Promise<string> {
    const res = await Util.processor.process(markdown);
    return Util.formatHtml(res.toString());
  },

  /**
   * Converts the given markdown to HTML synchronously.
   */
  toHtmlSync(markdown: string): string {
    const res = Util.processor.processSync(markdown);
    return Util.formatHtml(res.toString());
  },
};

/**
 * Helpers
 */
let _processor: Processor | undefined;
const Util = {
  get processor(): Processor {
    if (!_processor) _processor = unified().use(markdown).use(remark2rehype).use(format).use(html);
    return _processor;
  },

  formatHtml(input: string) {
    return input.replace(/^\n/, '').replace(/\n$/, '');
  },
};
