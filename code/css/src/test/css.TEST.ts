import { expect } from 'chai';
import { transform } from '../css/css';
import { css } from '..';

describe('css', () => {
  describe('transformStyle', () => {
    it('is a function', () => {
      expect(transform).to.be.an.instanceof(Function);
    });

    it('returns the given object', () => {
      const style = { color: 'red' };
      expect(transform(style)).to.equal(style);
    });

    it('returns an empty object if no `style` parameter is given', () => {
      expect(transform()).to.eql({});
    });

    it('removes undefined values', () => {
      const style = { color: undefined, background: null };
      expect(transform(style)).to.eql({});
    });
  });

  describe('head', () => {
    it('head', () => {
      expect(css.head.importStylesheet).to.be.an.instanceof(Function);
    });
  });
});
