import { expect } from '../test';
import { Markdown } from '.';

describe('parse.toHtml', () => {
  it('async', async () => {
    const markdown = `# Heading`;
    const html = await Markdown.toHtml(markdown);
    expect(html).to.eql('<h1>Heading</h1>');
  });

  it('sync', () => {
    const markdown = `# Heading`;
    const html = Markdown.toHtmlSync(markdown);
    expect(html).to.eql('<h1>Heading</h1>');
  });
});
