import { expect } from 'chai';
import { parse } from '.';

describe('parse.toHtml', () => {
  it('async', async () => {
    const markdown = `# Heading`;
    const html = await parse.toHtml(markdown);
    expect(html).to.eql('<h1>Heading</h1>');
  });

  it('sync', () => {
    const markdown = `# Heading`;
    const html = parse.toHtmlSync(markdown);
    expect(html).to.eql('<h1>Heading</h1>');
  });
});
