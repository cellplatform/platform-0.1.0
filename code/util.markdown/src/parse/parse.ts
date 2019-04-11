const unified = require('unified');
const markdown = require('remark-parse');
const remark2rehype = require('remark-rehype');
const format = require('rehype-format');
const html = require('rehype-stringify');

/**
 * See:
 *   - https://github.com/remarkjs/remark-rehype
 */
const processor = unified()
  .use(markdown, { commonmark: true })
  .use(remark2rehype)
  .use(format)
  .use(html);

/**
 * Converts the given markdown to HTML asynchronously.
 */
export function toHtml(markdown: string) {
  return new Promise<string>((resolve, reject) => {
    processor.process(markdown, (err: Error, res: any) => {
      if (err) {
        reject(err);
      }
      const html = formatHtmlResponse(res.contents);
      resolve(html);
    });
  });
}

/**
 * Converts the given markdown to HTML synchronously.
 */
export function toHtmlSync(markdown: string) {
  const res = processor.processSync(markdown);
  return formatHtmlResponse(res.contents);
}

/**
 * [Helpers]
 */
function formatHtmlResponse(html: string) {
  return html.replace(/^\n/, '').replace(/\n$/, '');
}
