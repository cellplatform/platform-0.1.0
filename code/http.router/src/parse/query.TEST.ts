import { Router } from '..';
import { expect } from '../test';

describe('query-string', () => {
  it('query (object)', () => {
    const test = (path: string, expected: any) => {
      const res = Router.query({ path });

      expect(res.toString).to.be.an.instanceof(Function);
      delete res.toString; // NB: Hack, remove the [toString] method for simpler test comparison.

      expect(res).to.eql(expected);
    };
    test('/foo', {});
    test('/foo?q=123', { q: 123 });
    test('/foo?q=', { q: true }); // NB: absence of value is converted to [true] flag.
    test('/foo?q', { q: true });
    test('/foo?q=FALSE', { q: false });
    test('/foo/?name=hello', { name: 'hello' });
    test('/foo?name=hello&count=456&flag=true', { name: 'hello', count: 456, flag: true });
    test('/foo?item=123&item=hello&item=false&item=true&count=123', {
      count: 123,
      item: [123, 'hello', false, true],
    });
    test(
      '/foo?q&q=123&q&q=false&q=hello', // NB: absence of value is converted to [true] flag.
      { q: [true, 123, true, false, 'hello'] },
    );
  });

  it('query.toString()', () => {
    const test = (path: string, expected: string) => {
      const res = Router.query({ path }).toString();
      expect(res).to.eql(expected);
    };

    test('/foo', '');
    test('/foo?q=123', '?q=123');
    test('/foo?q', '?q');
    test('/foo?q=123&color=red&force=true', '?q=123&color=red&force=true');
  });
});
