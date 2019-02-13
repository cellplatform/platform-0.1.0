import { expect } from 'chai';
import { queryString } from '.';

describe('queryString', () => {
  describe('toObject', () => {
    it('handles empty/nothing', () => {
      expect(queryString.toObject('')).to.eql({});
      expect(queryString.toObject('  ')).to.eql({});
      expect(queryString.toObject(undefined)).to.eql({});
      expect(queryString.toObject()).to.eql({});
    });

    it('reads key:value (without "?" prefix)', () => {
      const result = queryString.toObject('zoo=123');
      expect(result).to.eql({ zoo: '123' });
    });

    it('reads key:value (with "?" prefix)', () => {
      const result = queryString.toObject('?search=abc');
      expect(result).to.eql({ search: 'abc' });
    });

    it('reads key:value (with "#" prefix)', () => {
      const result = queryString.toObject('#search=abc&color=red');
      expect(result).to.eql({ search: 'abc', color: 'red' });
    });

    it('reads key:value with surrounding whitespaces', () => {
      expect(queryString.toObject(' ?filter=abc  ')).to.eql({ filter: 'abc' });
      expect(queryString.toObject('  search=cat ')).to.eql({ search: 'cat' });
    });

    it('reads a key with no value', () => {
      const result = queryString.toObject('?red');
      expect(result).to.eql({ red: undefined });
    });

    it('multiple key:value pairs', () => {
      const result = queryString.toObject('?color=red&width=50px');
      expect(result).to.eql({ color: 'red', width: '50px' });
    });

    it('decodeURIComponent', () => {
      const result = queryString.toObject('?msg=into%20the%20wild');
      expect(result).to.eql({ msg: 'into the wild' });
    });

    it('supports specific generic type', () => {
      const result = queryString.toObject<{ bar: string }>('?bar=abc');
      expect(result.bar).to.eql('abc');
    });

    it('supports generic type <any>', () => {
      const result = queryString.toObject<any>('?size=32x36');
      expect(result.size).to.eql('32x36');
    });
  });

  describe('valueAsFlag', () => {
    const test = (value: any, result: boolean) => {
      expect(queryString.valueAsFlag(value)).to.eql(result);
    };

    it('is TRUE', () => {
      test('true', true);
      test('  true ', true);
      test('True', true);
      test('TRUE', true);
    });

    it('is FALSE', () => {
      test('false', false);
      test('  false ', false);
      test('False', false);
      test('FALSE', false);
      test(undefined, false);
      test('something', false);
      test(['one', 'two'], false);
    });
  });

  describe('isFlag', () => {
    const test = (
      keys: string[],
      query: queryString.UrlQuery | undefined,
      result: boolean,
    ) => {
      expect(queryString.isFlag(keys, query)).to.eql(result);
    };

    it('is TRUE', () => {
      test(['force', 'f'], { force: '' }, true);
      test(['force', 'f'], { f: '' }, true);
      test(['force', 'f'], { force: 'true' }, true);
      test(['force', 'f'], { f: 'true' }, true);
    });

    it('is FALSE', () => {
      test(['force', 'f'], { force: undefined }, false);
      test(['force', 'f'], { force: 'false' }, false);
      test(['force', 'f'], { f: 'something' }, false);
      test(['force', 'f'], {}, false);
    });
  });
});
