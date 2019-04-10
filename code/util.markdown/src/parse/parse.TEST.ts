import { expect } from 'chai';
import { parse } from '.';

describe('parse.toHtml', () => {
  it('converts to HTML', async () => {
    const markdown = `# Heading`;
    const html = await parse.toHtml(markdown);
    expect(html).to.eql('<h1>Heading</h1>');
  });
});
