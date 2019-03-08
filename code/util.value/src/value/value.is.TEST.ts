import { expect } from 'chai';
import { value } from '.';

describe('isPlainObject', () => {
  it('is a plain object', () => {
    expect(value.isPlainObject(Object.create({}))).to.equal(true);
    expect(value.isPlainObject(Object.create(Object.prototype))).to.equal(true);
    expect(value.isPlainObject({ foo: 123 })).to.equal(true);
    expect(value.isPlainObject({})).to.equal(true);
  });

  it('is not a plain object', () => {
    class Foo {}
    expect(value.isPlainObject(1)).to.equal(false);
    expect(value.isPlainObject(['foo', 'bar'])).to.equal(false);
    expect(value.isPlainObject([])).to.equal(false);
    expect(value.isPlainObject(new Foo())).to.equal(false);
    expect(value.isPlainObject(null)).to.equal(false);
    expect(value.isPlainObject(Object.create(null))).to.equal(false);
  });
});

describe('value.isBoolString', () => {
  it('is a boolean', () => {
    expect(value.isBoolString('true')).to.eql(true);
    expect(value.isBoolString('false')).to.eql(true);
    expect(value.isBoolString('True')).to.eql(true);
    expect(value.isBoolString('False')).to.eql(true);
    expect(value.isBoolString('TRUE')).to.eql(true);
    expect(value.isBoolString('FALSE')).to.eql(true);
  });

  it('is not a boolean', () => {
    expect(value.isBoolString(undefined)).to.eql(false);
    expect(value.isBoolString('')).to.eql(false);
    expect(value.isBoolString('HELLO')).to.eql(false);
  });
});

describe('value.isDateString', () => {
  const test = (expected: boolean, input?: any) => {
    const res = value.isDateString(input);
    expect(res).to.eql(expected, `${input} value is date: ${expected}`);
  };

  it('is a date', () => {
    test(true, '2019-03-07T21:07:33.062Z');
  });

  it('is not a date', () => {
    test(false);
    test(false, undefined);
    test(false, null);
    test(false, '');
    test(false, '  ');
    test(false, 123);
    test(false, new Date()); // NB: Not a date [string].
    test(false, {});
    test(false, { date: '2019-03-07T21:07:33.062Z' });
    test(false, '  2019-03-07T21:07:33.062Z  '); // NB: whitespace makes date invalid for parsing.
  });
});

describe('value.isBlank', () => {
  describe('blank', () => {
    it('is blank (nothing)', () => {
      expect(value.isBlank(undefined)).to.equal(true);
      expect(value.isBlank(null)).to.equal(true);
    });

    it('is blank (string)', () => {
      expect(value.isBlank('')).to.equal(true);
      expect(value.isBlank(' ')).to.equal(true);
      expect(value.isBlank('   ')).to.equal(true);
    });

    it('is blank (array)', () => {
      expect(value.isBlank([])).to.equal(true);
      expect(value.isBlank([null])).to.equal(true);
      expect(value.isBlank([undefined])).to.equal(true);
      expect(value.isBlank([undefined, null])).to.equal(true);
      expect(value.isBlank([undefined, null, ''])).to.equal(true);
    });
  });

  describe('NOT blank', () => {
    it('is not blank (string)', () => {
      expect(value.isBlank('a')).to.equal(false);
      expect(value.isBlank('   .')).to.equal(false);
    });

    it('is not blank (array)', () => {
      expect(value.isBlank([1])).to.equal(false);
      expect(value.isBlank([null, 'value'])).to.equal(false);
      expect(value.isBlank([null, '   '])).to.equal(false);
    });

    it('is not blank (other values)', () => {
      expect(value.isBlank(1)).to.equal(false);
      expect(value.isBlank({})).to.equal(false);
      expect(value.isBlank(() => 0)).to.equal(false);
    });
  });
});

describe('value.isNumeric', () => {
  it('is numeric (number)', () => {
    expect(value.isNumeric(0)).to.equal(true);
    expect(value.isNumeric(1)).to.equal(true);
    expect(value.isNumeric(-1)).to.equal(true);
    expect(value.isNumeric(0.5)).to.equal(true);
    expect(value.isNumeric(123456.123456)).to.equal(true);
  });

  it('is numeric (string)', () => {
    expect(value.isNumeric('0')).to.equal(true);
    expect(value.isNumeric('1')).to.equal(true);
    expect(value.isNumeric('-1')).to.equal(true);
    expect(value.isNumeric('0.5')).to.equal(true);
    expect(value.isNumeric('123456.123456')).to.equal(true);
  });

  it('is not numeric', () => {
    expect(value.isNumeric(null)).to.equal(false);
    expect(value.isNumeric(undefined)).to.equal(false);
    expect(value.isNumeric('string')).to.equal(false);
    expect(value.isNumeric('123px')).to.equal(false);
    expect(value.isNumeric({})).to.equal(false);
    expect(value.isNumeric(new Date())).to.equal(false);
  });
});

describe('isLetter', () => {
  it('is a letter', () => {
    expect(value.isLetter('A')).to.eql(true);
    expect(value.isLetter('a')).to.eql(true);
    expect(value.isLetter('b')).to.eql(true);
    expect(value.isLetter('z')).to.eql(true);
    expect(value.isLetter('Z')).to.eql(true);
  });

  it('is not a letter', () => {
    expect(value.isLetter(undefined)).to.eql(false);
    expect(value.isLetter(null)).to.eql(false);
    expect(value.isLetter('')).to.eql(false);
    expect(value.isLetter('\n')).to.eql(false);
    expect(value.isLetter(' ')).to.eql(false);
    expect(value.isLetter('1')).to.eql(false);
    expect(value.isLetter('*')).to.eql(false);
    expect(value.isLetter('.')).to.eql(false);
    expect(value.isLetter(' a')).to.eql(false);
    expect(value.isLetter(123)).to.eql(false);
    expect(value.isLetter({})).to.eql(false);
    expect(value.isLetter(new Date())).to.eql(false);
  });
});

describe('isAlpha', () => {
  it('is alphabet letters', () => {
    expect(value.isAlpha('A')).to.eql(true);
    expect(value.isAlpha('a')).to.eql(true);
    expect(value.isAlpha('ABC')).to.eql(true);
  });

  it('is not all letters', () => {
    expect(value.isAlpha(undefined)).to.eql(false);
    expect(value.isAlpha(null)).to.eql(false);
    expect(value.isAlpha('')).to.eql(false);
    expect(value.isAlpha('\n')).to.eql(false);
    expect(value.isAlpha(' ')).to.eql(false);
    expect(value.isAlpha('1')).to.eql(false);
    expect(value.isAlpha('*')).to.eql(false);
    expect(value.isAlpha('.')).to.eql(false);
    expect(value.isAlpha(' a')).to.eql(false);
    expect(value.isAlpha(123)).to.eql(false);
    expect(value.isAlpha({})).to.eql(false);
    expect(value.isAlpha(new Date())).to.eql(false);
    expect(value.isAlpha('A:B')).to.eql(false);
    expect(value.isAlpha('A-B')).to.eql(false);
    expect(value.isAlpha('A B')).to.eql(false);
  });
});

describe('hasWhitespace', () => {
  it('has whitespace', () => {
    expect(value.hasWhitespace(' ')).to.eql(true);
    expect(value.hasWhitespace('  ')).to.eql(true);
    expect(value.hasWhitespace('one two')).to.eql(true);
    expect(value.hasWhitespace(' one two ')).to.eql(true);
  });

  it('has no whitespace', () => {
    expect(value.hasWhitespace('')).to.eql(false);
    expect(value.hasWhitespace('hello')).to.eql(false);
    expect(value.hasWhitespace('123')).to.eql(false);
  });
});

describe('isEmail', () => {
  it('is not an email when empty', () => {
    expect(value.isEmail('')).to.eql(false);
    expect(value.isEmail('  ')).to.eql(false);
    expect(value.isEmail()).to.eql(false);
  });

  it('is not an email address whem not trimmed of whitespace', () => {
    expect(value.isEmail(' phil@foo.com')).to.eql(false);
    expect(value.isEmail('phil@foo.com ')).to.eql(false);
    expect(value.isEmail('  phil@foo.com ')).to.eql(false);
  });

  it('is not an email address', () => {
    expect(value.isEmail('phil@foo.c')).to.eql(false);
    expect(value.isEmail('phil@foo.')).to.eql(false);
    expect(value.isEmail('@foo.com')).to.eql(false);
    expect(value.isEmail('foo.com')).to.eql(false);
  });

  it('is an email', () => {
    expect(value.isEmail('phil@foo.com')).to.eql(true);
    expect(value.isEmail('1@1.nz')).to.eql(true);
  });
});
