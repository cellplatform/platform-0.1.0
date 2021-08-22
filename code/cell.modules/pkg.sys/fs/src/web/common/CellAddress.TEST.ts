import { expect } from '../../test';
import { CellAddress } from './CellAddress';

describe('CellAddress', () => {
  it('parse', () => {
    const test = (input: any, domain: string, uri: string, error?: string) => {
      const res = CellAddress.parse(input);
      expect(res.domain).to.eql(domain, 'domain');
      expect(res.uri).to.eql(uri, 'uri');
      if (error) expect(res.error).to.include(error, 'error');
      if (!error) expect(res.error).to.eql(undefined);
    };

    test({}, '', '', 'not a string');
    test('', '', '', 'empty');

    test('foo/cell:foo:A1', 'foo', 'cell:foo:A1');
    test('  foo/cell:foo:A1  ', 'foo', 'cell:foo:A1');
    test('  foo  /  cell:foo:A1  ', 'foo', 'cell:foo:A1');

    test('foo:8080/cell:foo:A1', 'foo:8080', 'cell:foo:A1');
    test('localhost/cell:foo:A1', 'localhost', 'cell:foo:A1');
    test('localhost:1234/cell:foo:A1', 'localhost:1234', 'cell:foo:A1');
    test('http://localhost:1234/cell:foo:A1', 'localhost:1234', 'cell:foo:A1');
    test('http://domain.com/cell:foo:A1', 'domain.com', 'cell:foo:A1');
    test('https://domain.com/cell:foo:A1', 'domain.com', 'cell:foo:A1');

    // Errors
    test('/cell:foo:A1', '', 'cell:foo:A1', 'no domain');
    test('foo/', 'foo', '', 'no <cell:uri>');
    test('foo/bar', 'foo', 'bar', 'invalid <cell:uri>');
    test('foo/cell:INVALID:A1', 'foo', 'cell:INVALID:A1', 'invalid <cell:uri>');
  });

  it('create', () => {
    const res = CellAddress.create('  foo:1234  ', '  cell:foo:A1  ');

    console.log('res', res);

    expect(res.domain).to.eql('foo:1234');
    expect(res.uri).to.eql('cell:foo:A1');
    expect(res.toString()).to.eql('foo:1234/cell:foo:A1');
  });

  it('toString', () => {
    const test = (input: any, expected: string) => {
      const res = CellAddress.parse(input);
      expect(res.toString()).to.eql(expected);
    };

    test('foo/cell:foo:A1', 'foo/cell:foo:A1');
    test('  foo/cell:foo:A1  ', 'foo/cell:foo:A1');
    test('  localhost:1234  /  cell:foo:A1  ', 'localhost:1234/cell:foo:A1');
    test('  https://domain.com  /  cell:foo:A1  ', 'domain.com/cell:foo:A1');

    // Error.
    test('/cell:ns:A1', '');
    test('foo/cell:INVALID:A1', '');
  });
});
