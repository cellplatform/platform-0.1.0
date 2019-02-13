import { expect } from 'chai';
import { toBool } from '.';

describe('toBool', () => {
  describe('existing Boolean value', () => {
    it('true (no change)', () => {
      expect(toBool(true)).to.equal(true);
    });

    it('false (no change)', () => {
      expect(toBool(false)).to.equal(false);
    });
  });

  describe('string to Boolean', () => {
    it('converts `true` (string) to true', () => {
      expect(toBool('true')).to.equal(true);
      expect(toBool('True')).to.equal(true);
      expect(toBool('   truE   ')).to.equal(true);
    });

    it('converts `false` (string) to false', () => {
      expect(toBool('false')).to.equal(false);
      expect(toBool('False')).to.equal(false);
      expect(toBool('   falSe   ')).to.equal(false);
    });
  });

  it('does not convert other value types', () => {
    expect(toBool(undefined)).to.equal(undefined);
    expect(toBool(null)).to.equal(undefined);
    expect(toBool('Foo')).to.equal(undefined);
    expect(toBool('')).to.equal(undefined);
    expect(toBool(' ')).to.equal(undefined);
    expect(toBool(123)).to.equal(undefined);
    expect(toBool({ foo: 123 })).to.eql(undefined);
  });

  it('returns the given default value', () => {
    expect(toBool(undefined, true)).to.equal(true);
    expect(toBool(undefined, false)).to.equal(false);
    expect(toBool(undefined, 123)).to.equal(123);

    expect(toBool(null, true)).to.equal(true);
    expect(toBool(null, false)).to.equal(false);
    expect(toBool(null, 123)).to.equal(123);
  });
});
