import { Test, expect } from 'sys.ui.dev';
import { DefaultTokenizer } from './Tokenizer';

export default Test.describe('Text.Syntax', (e) => {
  e.describe('Tokenizer', (e) => {
    e.describe('DefaultTokenizer', (e) => {
      e.it('<Component>', () => {
        const res = DefaultTokenizer('<Component>');
        expect(res.text).to.eql('<Component>');
        expect(res.parts.length).to.eql(3);

        expect(res.parts[0].kind).to.eql('Brace');
        expect(res.parts[1].kind).to.eql('Word');
        expect(res.parts[2].kind).to.eql('Brace');

        expect(res.parts[0].text).to.eql('<');
        expect(res.parts[1].text).to.eql('Component');
        expect(res.parts[2].text).to.eql('>');
      });

      e.it('predicate:value', () => {
        const res = DefaultTokenizer('foo:bar');

        expect(res.text).to.eql('foo:bar');
        expect(res.parts.length).to.eql(3);

        expect(res.parts[0].kind).to.eql('Predicate');
        expect(res.parts[1].kind).to.eql('Colon');
        expect(res.parts[2].kind).to.eql('Word');
      });
    });
  });
});
