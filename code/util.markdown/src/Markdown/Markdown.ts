import unified from 'unified';
import markdown from 'remark-parse';
import html from 'rehype-stringify';

const remark2rehype = require('remark-rehype'); // eslint-disable-line
const format = require('rehype-format'); // eslint-disable-line

/**
 * See:
 *   - https://github.com/remarkjs/remark-rehype
 */
const processor = unified().use(markdown).use(remark2rehype).use(format).use(html);

export const Markdown = {
  /**
   * Converts the given markdown to HTML asynchronously.
   */
  async toHtml(markdown: string): Promise<string> {
    const res = await processor.process(markdown);
    return formatHtmlResponse(res.contents);
  },

  /**
   * Converts the given markdown to HTML synchronously.
   */
  toHtmlSync(markdown: string): string {
    const res = processor.processSync(markdown);
    return formatHtmlResponse(res.contents);
  },
};

/**
 * [Helpers]
 */
function formatHtmlResponse(input: string | Uint8Array) {
  const html = input.toString().replace(/^\n/, '').replace(/\n$/, '');
  return html;
}
