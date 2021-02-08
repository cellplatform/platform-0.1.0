/* eslint-disable  @typescript-eslint/no-var-requires */
const unified = require('unified');
const markdown = require('remark-parse');
const remark2rehype = require('remark-rehype');
const format = require('rehype-format');
const html = require('rehype-stringify');
/* eslint-enable */

/**
 * See:
 *   - https://github.com/remarkjs/remark-rehype
 */
const processor = unified()
  .use(markdown, { commonmark: true })
  .use(remark2rehype)
  .use(format)
  .use(html);

export const Markdown = {
  /**
   * Converts the given markdown to HTML asynchronously.
   */
  toHtml(markdown: string) {
    return new Promise<string>((resolve, reject) => {
      processor.process(markdown, (err: Error, res: any) => {
        if (err) return reject(err);
        resolve(formatHtmlResponse(res.contents));
      });
    });
  },

  /**
   * Converts the given markdown to HTML synchronously.
   */
  toHtmlSync(markdown: string) {
    const res = processor.processSync(markdown);
    return formatHtmlResponse(res.contents);
  },
};

/**
 * [Helpers]
 */
function formatHtmlResponse(html: string) {
  html = html.replace(/^\n/, '').replace(/\n$/, '');
  return html;
}
