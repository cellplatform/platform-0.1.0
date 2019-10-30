import { expect } from 'chai';
import { parser } from '.';
import { alpha } from '../alpha';

describe('parser.toParts', () => {
  it('Sheet1!A1 (CELL)', () => {
    const parts = parser.toParts('Sheet1!A1');
    expect(parts.isValid).to.eql(true);
    expect(parts.error).to.eql('');
    expect(parts.type).to.eql('CELL');
    expect(parts.key).to.eql('A1');
    expect(parts.column.value).to.eql('A');
    expect(parts.row.value).to.eql('1');
    expect(parts.column.index).to.eql(0);
    expect(parts.row.index).to.eql(0);
    expect(parts.ns).to.eql('Sheet1');
    expect(parts.column.isRelative).to.eql(true);
    expect(parts.row.isRelative).to.eql(true);
    expect(parts.isWildcard).to.eql(false);
  });

  it('Sheet1!A (COLUMN)', () => {
    const parts = parser.toParts('Sheet1!A');
    expect(parts.isValid).to.eql(true);
    expect(parts.error).to.eql('');
    expect(parts.type).to.eql('COLUMN');
    expect(parts.key).to.eql('A');
    expect(parts.column.value).to.eql('A');
    expect(parts.row.value).to.eql('');
    expect(parts.type).to.eql('COLUMN');
    expect(parts.column.index).to.eql(0);
    expect(parts.row.index).to.eql(-1);
    expect(parts.ns).to.eql('Sheet1');
    expect(parts.column.isRelative).to.eql(true);
    expect(parts.row.isRelative).to.eql(undefined);
  });

  it('Sheet1!1 (ROW)', () => {
    const parts = parser.toParts('Sheet1!1');
    expect(parts.isValid).to.eql(true);
    expect(parts.error).to.eql('');
    expect(parts.type).to.eql('ROW');
    expect(parts.key).to.eql('1');
    expect(parts.column.value).to.eql('');
    expect(parts.row.value).to.eql('1');
    expect(parts.type).to.eql('ROW');
    expect(parts.column.index).to.eql(-1);
    expect(parts.row.index).to.eql(0);
    expect(parts.ns).to.eql('Sheet1');
    expect(parts.column.isRelative).to.eql(undefined);
    expect(parts.row.isRelative).to.eql(true);
  });

  it('without namespace', () => {
    const test = (input: string) => {
      const parts = parser.toParts(input);
      expect(parts.isValid).to.eql(true);
      expect(parts.key).to.eql(input);
      expect(parts.ns).to.eql('');
    };
    test('A1');
    test('A');
    test('1');
  });

  it('with namespace', () => {
    const test = (input: string, ns: string) => {
      const parts = parser.toParts(input);
      expect(parts.isValid).to.eql(true);
      expect(parts.ns).to.eql(ns);
    };
    test('abc!A1', 'abc');
    test('abc.foo!A1', 'abc.foo');
  });

  it('from uri', () => {
    const test = (input: string, ns: string, uriPrefix?: string) => {
      const options = { uriPrefix };
      const parts = parser.toParts(input, options);
      expect(parts.isValid).to.eql(true);
      expect(parts.key).to.eql('A1');
      expect(parts.ns).to.eql(ns);
    };
    test('cell:A1', '', '');
    test('cell:Sheet1!A1', 'Sheet1');
    test('cell:Sheet1!A1', 'Sheet1', '');
    test('cell:Sheet1!A1', 'Sheet1', '   ');
    test('myuri:Sheet1!A1', 'Sheet1', 'myuri');
  });

  it('large', () => {
    const parts = parser.toParts('SheetWithAVeryLongNamespace!ABCDEFGHIJKLMNOP123456789');
    expect(parts.isValid).to.eql(true);
    expect(parts.ns).to.eql('SheetWithAVeryLongNamespace');
    expect(parts.key).to.eql('ABCDEFGHIJKLMNOP123456789');
    expect(parts.column.value).to.eql('ABCDEFGHIJKLMNOP');
    expect(parts.row.value).to.eql('123456789');
    expect(parts.column.index).to.eql(alpha.fromCharacter('ABCDEFGHIJKLMNOP'));
    expect(parts.row.index).to.eql(123456789 - 1);
  });

  it('absolute', () => {
    const parts = parser.toParts('$A$1');
    expect(parts.column.isRelative).to.eql(false);
    expect(parts.row.isRelative).to.eql(false);
  });

  it('absolute column (mixed)', () => {
    const parts = parser.toParts('$A1');
    expect(parts.column.isRelative).to.eql(false);
    expect(parts.row.isRelative).to.eql(true);
  });

  it('absolute row (mixed)', () => {
    const parts = parser.toParts('A$1');
    expect(parts.column.isRelative).to.eql(true);
    expect(parts.row.isRelative).to.eql(false);
  });

  it('valid', () => {
    const valid = (key: string) => {
      const parts = parser.toParts(key);
      expect(parts.isValid).to.eql(true, `key '${key}' should be valid.`);
    };
    valid('A1');
    valid('=A1');
    valid(' =A1 ');
    valid(' = A1 ');
    valid('$A1');
    valid('A$1');
    valid('A');
    valid('$A');
    valid('1');
    valid(' A1 ');
    valid(' A  ');
    valid('$A');
    valid('  1 ');
    valid('$1');

    valid('cell:Sheet1!A1');

    valid('!A1');
    valid(' ! A1');

    valid('Sheet1!1');
    valid('Sheet1!A1');
    valid('=Sheet1!A1');
    valid(' Sheet1!A1 ');
    valid(' Sheet1!ABC ');
    valid(' Sheet1!123 ');
    valid('Sheet1.sys!A1');
    valid('Sheet1.foo!A1');
    valid('=Sheet_1!A3'); // Underscopes (_) allowed.

    valid('*');
    valid('**');
    valid('Sheet1!*');
    valid('Sheet1!**');
    valid('Sheet1.sys!*');
    valid('Sheet1.sys!**');
    valid('Sheet1.!A1');
  });

  it('invalid', () => {
    const invalid = (key: string) => {
      const parts = parser.toParts(key);
      expect(parts.isValid).to.eql(false, `key '${key}' should be invalid.`);
    };
    invalid('');
    invalid('  ');
    invalid('.');
    invalid('A$A1');
    invalid('A1$5');
    invalid('A1.0');
    invalid('A*A1');
    invalid('A1$');
    invalid('$A$1$');
    invalid('A1,');
    invalid('A:1');
    invalid('!');
    invalid(':');
    invalid('A-12');
    invalid('A1-2');
    invalid('Sheet1!');
    invalid('***');
    invalid('Sheet1!***');
    invalid('sheet-1!A1'); // Hyphen in namespace not allowed.
    invalid('123!A1'); // Number as ns.
    invalid('uri:cell:A1');
  });

  describe('wildcard', () => {
    const testWildcard = (input: string, cell: string, sheet = '') => {
      const parts = parser.toParts(input);
      expect(parts.isValid).to.eql(true);
      expect(parts.isWildcard).to.eql(true);
      expect(parts.ns).to.eql(sheet);
      expect(parts.key).to.eql(cell);
      expect(parts.column.value).to.eql(cell);
      expect(parts.column.index).to.eql(-1);
      expect(parts.column.isRelative).to.eql(undefined);
      expect(parts.row.value).to.eql(cell);
      expect(parts.row.index).to.eql(-1);
      expect(parts.row.isRelative).to.eql(undefined);
    };

    it('Sheet1!* (Wildcard)', () => {
      testWildcard('*', '*');
      testWildcard('Sheet1!*', '*', 'Sheet1');
      testWildcard('Sheet1.sys!*', '*', 'Sheet1.sys');
    });

    it('Sheet1!** (Double wildcard)', () => {
      testWildcard('**', '**');
      testWildcard('Sheet1!**', '**', 'Sheet1');
      testWildcard('Sheet1.sys!**', '**', 'Sheet1.sys');
    });
  });
});
