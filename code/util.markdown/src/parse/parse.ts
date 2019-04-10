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
 * Converts the given markdown to HTML.
 */
export function toHtml(markdown: string) {
  return new Promise<string>((resolve, reject) => {
    processor.process(markdown, (err: Error, file: any) => {
      if (err) {
        reject(err);
      }
      const contents = file.contents as string;
      const html = contents.replace(/^\n/, '').replace(/\n$/, '');
      resolve(html);
    });
  });
}
