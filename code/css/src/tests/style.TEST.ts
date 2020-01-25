import { expect } from 'chai';
import { style, css } from '..';

describe('css', () => {
  it('is a function', () => {
    expect(css).to.be.an.instanceof(Function);
  });
});

describe('style', () => {
  describe('format', () => {
    it('is a function', () => {
      expect(style.format).to.be.an.instanceof(Function);
    });
  });

  describe('transform', () => {
    it('is a function', () => {
      expect(style.transform).to.be.an.instanceof(Function);
    });

    it('returns the given object', () => {
      const input = { color: 'red' };
      expect(style.transform(input)).to.equal(input);
    });

    it('returns an empty object if no `style` parameter is given', () => {
      expect(style.transform()).to.eql({});
    });

    it('removes undefined values', () => {
      const input = { color: undefined, background: null };
      expect(style.transform(input)).to.eql({});
    });
  });

  describe('head', () => {
    it('head', () => {
      expect(style.head.importStylesheet).to.be.an.instanceof(Function);
    });
  });
});
