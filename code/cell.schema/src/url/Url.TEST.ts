import { expect } from '../test';
import { Url } from './Url';

const origin = 'https://domain.com/';

type Q = {
  force?: boolean;
  color: 'red' | 'blue';
  thing?: string | Array<boolean | string | number>;
  text?: string;
};

describe('Url', () => {
  it('origin/path', () => {
    const res = new Url({ origin: 'https://domain.com/', path: '///foo/bar' });
    expect(res.origin).to.eql('https://domain.com');
    expect(res.path).to.eql('/foo/bar');
  });

  it('no path', async () => {
    const test = (path: string | undefined) => {
      const res = new Url({ origin: 'https://domain.com', path });
      expect(res.path).to.eql('/');
      expect(res.toString()).to.eql('https://domain.com/');
    };

    test(undefined);
    test('');
    test('   ');
    test('/');
    test('///');
    test(' /// ');
  });

  it('querystring (from constructor string)', () => {
    const test = (input: string | undefined, expected: string) => {
      const res = new Url({ origin, querystring: input });
      expect(res.querystring).to.eql(expected);
    };

    test(undefined, '');
    test('', '');
    test('  ', '');

    test('foo', '?foo');
    test('foo=bar', '?foo=bar');
    test('  foo=bar&force  ', '?foo=bar&force');
  });

  it('querystring (from constructor object)', () => {
    const test = (query: Partial<Q> | undefined, expected: string) => {
      const res = new Url<Q>({ origin, query });
      expect(res.querystring).to.eql(expected);
    };

    test(undefined, '');
    test({ color: 'red' }, '?color=red');
    test({ force: true }, '?force=true');
    test({ force: true, color: ' blue' as any }, '?force=true&color=blue');
    test({ color: 'blue', force: true }, '?color=blue&force=true');
    test({ force: true, toString: () => 'hello' } as any, '?force=true');

    // NB: Empty strings not inserted into query-string.
    test({ text: '' }, '');
    test({ text: '', force: true }, '?force=true');

    // Array (multiple keys)
    test({ thing: [] }, '');
    test({ thing: ['one', true, false] }, '?thing=one&thing=true&thing=false');
    test({ thing: ['same', '  same  ', 'diff', 'same'] }, '?thing=same&thing=diff'); // NB: de-duped.
  });

  it('add [query] returns a new instance', () => {
    const url1 = new Url<Q>({ origin });
    const url2 = url1.query({ force: true });
    expect(url1).to.not.equal(url2);
    expect(url1.querystring).to.eql('');
    expect(url2.querystring).to.eql('?force=true');
  });

  it('add [query] array (multiple keys)', () => {
    const url = new Url<Q>({ origin }).query({ thing: [true, ' foo ', 123] });
    expect(url.querystring).to.eql('?thing=true&thing=foo&thing=123');
  });

  it('does not add [query] if value is undefined', () => {
    const url = new Url<Q>({ origin }).query({ thing: undefined });
    expect(url.querystring).to.eql('');
  });

  it('build query-string (mixed from object and/or string)', () => {
    const res = new Url<Q>({ origin, querystring: 'boom=bam' })
      .query({ color: 'red' })
      .query({ force: true, color: ' blue  ' } as any);
    expect(res.querystring).to.eql('?color=blue&force=true&boom=bam');
  });

  it('toPath | toString', () => {
    let url = new Url<Q>({ origin, path: '//foo/' });
    expect(url.toString({ origin: false })).to.eql('/foo/');
    expect(url.toString()).to.eql('https://domain.com/foo/');

    url = url.query({ force: true });
    expect(url.toString({ origin: false })).to.eql('/foo/?force=true');
    expect(url.toString()).to.eql('https://domain.com/foo/?force=true');
  });
});
