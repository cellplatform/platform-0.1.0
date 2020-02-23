import { expect } from 'chai';
import { str, queryString } from '..';

describe('queryString', () => {
  it('is exposed from module', () => {
    expect(queryString.toObject).to.be.an.instanceof(Function);
    expect(str.queryString.toObject).to.be.an.instanceof(Function);
  });

  describe('toObject', () => {
    it('handles empty/nothing', () => {
      const test = (input?: any) => {
        expect(queryString.toObject(input)).to.eql({});
      };
      test('');
      test('  ');
      test();
      test(undefined);
      test(null);
    });

    it('parses href (full URL)', () => {
      const test = (input: string | undefined) => {
        const res = queryString.toObject(input);
        expect(res).to.eql({ foo: '123' });
      };

      test('http://domain.com?foo=123');
      test(' http://domain.com/?foo=123 ');
      test('domain.com/?foo=123');
      test('domain.com?foo=123');
      test('domain.com?foo=123');
      test('http://localhost?foo=123');
      test('http://localhost:8080/?foo=123');
      test('localhost:8080/?foo=123');
    });

    it('reads key:value (without "?" prefix)', () => {
      const result = queryString.toObject('zoo=123');
      expect(result).to.eql({ zoo: '123' });
    });

    it('reads key:value (with "?" prefix)', () => {
      const result = queryString.toObject('  ?search=abc  ');
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

    it('boolean <empty> key (defaults to true)', () => {
      const result = queryString.toObject('?red');
      expect(result).to.eql({ red: true });
    });

    it('boolean key (true)', () => {
      const result = queryString.toObject('?red=true');
      expect(result).to.eql({ red: true });
    });

    it('boolean key (false)', () => {
      const result = queryString.toObject('?red=false');
      expect(result).to.eql({ red: false });
    });

    it('multiple key:value pairs', () => {
      const result = queryString.toObject('?color=red&width=50px');
      expect(result).to.eql({ color: 'red', width: '50px' });
    });

    it('multiple keys stack up into array', () => {
      const result = queryString.toObject('?item=one&item&item=false');
      expect(result.item).to.eql(['one', true, false]);
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
    const test = (keys: string[], query: queryString.UrlQuery | undefined, result: boolean) => {
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
