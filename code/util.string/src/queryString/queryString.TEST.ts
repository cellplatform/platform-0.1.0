import { expect } from '../test';
import { str, QueryString } from '..';

describe('QueryString', () => {
  it('is exposed from module', () => {
    expect(QueryString.toObject).to.be.an.instanceof(Function);
    expect(str.QueryString.toObject).to.be.an.instanceof(Function);
  });

  describe('toObject', () => {
    it('handles empty/nothing', () => {
      const test = (input?: any) => {
        expect(QueryString.toObject(input)).to.eql({});
      };
      test('');
      test('  ');
      test();
      test(undefined);
      test(null);
    });

    it('parses href (full URL)', () => {
      const test = (input: string | undefined) => {
        const res = QueryString.toObject(input);
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
      const result = QueryString.toObject('zoo=123');
      expect(result).to.eql({ zoo: '123' });
    });

    it('reads key:value (with "?" prefix)', () => {
      const result = QueryString.toObject('  ?search=abc  ');
      expect(result).to.eql({ search: 'abc' });
    });

    it('reads key:value (with "#" prefix)', () => {
      const result = QueryString.toObject('#search=abc&color=red');
      expect(result).to.eql({ search: 'abc', color: 'red' });
    });

    it('reads key:value with surrounding whitespaces', () => {
      expect(QueryString.toObject(' ?filter=abc  ')).to.eql({ filter: 'abc' });
      expect(QueryString.toObject('  search=cat ')).to.eql({ search: 'cat' });
    });

    it('boolean <empty> key (defaults to true)', () => {
      const result = QueryString.toObject('?red');
      expect(result).to.eql({ red: true });
    });

    it('boolean key (true)', () => {
      const result = QueryString.toObject('?red=true');
      expect(result).to.eql({ red: true });
    });

    it('boolean key (false)', () => {
      const result = QueryString.toObject('?red=false');
      expect(result).to.eql({ red: false });
    });

    it('multiple key:value pairs', () => {
      const result = QueryString.toObject('?color=red&width=50px');
      expect(result).to.eql({ color: 'red', width: '50px' });
    });

    it('multiple keys stack up into array', () => {
      const result = QueryString.toObject('?item=one&item&item=false');
      expect(result.item).to.eql(['one', true, false]);
    });

    it('decodeURIComponent', () => {
      const result = QueryString.toObject('?msg=into%20the%20wild');
      expect(result).to.eql({ msg: 'into the wild' });
    });

    it('supports specific generic type', () => {
      const result = QueryString.toObject<{ bar: string }>('?bar=abc');
      expect(result.bar).to.eql('abc');
    });

    it('supports generic type <any>', () => {
      const result = QueryString.toObject<any>('?size=32x36');
      expect(result.size).to.eql('32x36');
    });
  });

  describe('valueAsFlag', () => {
    const test = (value: any, result: boolean) => {
      expect(QueryString.valueAsFlag(value)).to.eql(result);
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
    const test = (keys: string[], query: QueryString.UrlQuery | undefined, result: boolean) => {
      expect(QueryString.isFlag(keys, query)).to.eql(result);
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

  describe('build', () => {
    it('nothing', () => {
      expect(QueryString.build().toString()).to.eql('');
    });

    it('add', () => {
      const builder = QueryString.build();
      expect(builder.toString()).to.eql('');

      builder.add('foo', 123);
      expect(builder.toString()).to.eql('?foo=123');

      builder.add('bar', 'hello '); // NB: encodes space
      expect(builder.toString()).to.eql('?foo=123&bar=hello%20');

      // Fluent (stack up same key).
      builder.add('foo', 123).add('foo', 456);
      expect(builder.toString()).to.eql('?foo=123&bar=hello%20&foo=123&foo=456');

      const obj = QueryString.toObject(builder.toString());
      expect(obj).to.eql({ foo: ['123', '123', '456'], bar: 'hello ' });
    });

    describe('null | undefined | "" (<empty>)', () => {
      it('allowNil: true (default)', () => {
        const builder = QueryString.build().add('myNull', null).add('myUndefined');
        expect(builder.toString()).to.eql('?myNull&myUndefined');
      });

      it('allowNil: false', () => {
        const builder = QueryString.build({ allowNil: false })
          .add('myNull', null)
          .add('myUndefined');
        expect(builder.toString()).to.eql('');
      });
    });
  });
});
