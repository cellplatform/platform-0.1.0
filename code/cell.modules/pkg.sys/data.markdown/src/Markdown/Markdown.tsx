import { MarkdownProcessor } from './Markdown.Processor';
import { MarkdownUI as UI } from './Markdown.UI';

const { toHtml, toHtmlSync } = MarkdownProcessor;

/**
 * See:
 *   - https://github.com/remarkjs/remark-rehype
 */
export const Markdown = {
  toHtml,
  toHtmlSync,

  UI,
};
