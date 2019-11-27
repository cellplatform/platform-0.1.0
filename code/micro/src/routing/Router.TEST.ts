import { expect, t } from '../test';
import { Router } from '.';

const handler: t.RouteHandler = async req => undefined;

describe('Router', () => {
  it('adds', () => {
    const router = Router.create();
    expect(router.routes.length).to.eql(0);
    router.add('GET', '/foo', handler);
    expect(router.routes.length).to.eql(1);
  });

  it('throws if route already added.', () => {
    const router = Router.create();
    router.get('/foo', handler);
    const fn = () => router.get('/foo', handler);
    expect(fn).to.throw();
  });

  describe.only('find', () => {
    it('no match', () => {
      const router = Router.create();
      router.get('/foo', handler);
      const res = router.find({ method: 'GET', url: '/bar' });
      expect(res).to.eql(undefined);
    });

    it('GET /foo', () => {
      const router = Router.create();

      expect(router.find({})).to.eql(undefined);
      expect(router.find({ method: 'GET', url: '/foo' })).to.eql(undefined);

      router.get('/foo', handler);
      const res = router.find({ method: 'GET', url: '/foo' });

      expect(res && res.method).to.eql('GET');
      expect(res && res.path).to.eql('/foo');
    });

    it('GET /foo?q=123 (query-string)', () => {
      const router = Router.create();

      router.get('/foo', handler);
      const res = router.find({ method: 'GET', url: '/foo?q=123' });

      expect(res && res.method).to.eql('GET');
      expect(res && res.path).to.eql('/foo');
    });

    it('GET /foo/:id/bar', () => {
      const router = Router.create();

      router.get('/foo/:id/bar', handler);

      const res = router.find({ method: 'GET', url: '/foo/123/bar?q=123' });
      expect(res).to.not.eql(undefined);

      const tokens = res ? res.tokens : [];

      expect(tokens.length).to.eql(3);
      expect(tokens[0]).to.eql('/foo');
      expect((tokens[1] as any).name).to.eql('id');
      expect(tokens[2]).to.eql('/bar');
    });

    it('GET array of route-paths', () => {
      const router = Router.create();

      router.get(['/foo', '/bar'], handler);

      expect(router.routes.map(m => m.path)).to.eql(['/foo', '/bar']);

      const res1 = router.find({ method: 'GET', url: '/foo' });
      const res2 = router.find({ method: 'GET', url: '/bar' });
      const res3 = router.find({ method: 'GET', url: '/zoo' });

      expect(res1 && res1.path).to.eql('/foo');
      expect(res2 && res2.path).to.eql('/bar');
      expect(res3 && res3.path).to.eql(undefined);
    });
  });

  describe('params', () => {
    it('empty (no params)', () => {
      const router = Router.create();
      router.get('/foo', handler);

      const route = router.routes[0];
      const res1 = Router.params({ route, path: '/foo' });
      const res2 = Router.params({ route, path: '/bar' });

      expect(res1).to.eql({});
      expect(res2).to.eql({});
    });

    it('types: string | number | boolean', () => {
      const router = Router.create();
      router.get('/:id', handler);

      type T = { id: string | number | boolean | null };

      const route = router.routes[0];
      const res1 = Router.params<T>({ route, path: '/foo' });
      const res2 = Router.params<T>({ route, path: '/123' });
      const res3 = Router.params<T>({ route, path: '/undefined' });
      const res4 = Router.params<T>({ route, path: '/null' });
      const res5 = Router.params<T>({ route, path: '/0' });
      const res6 = Router.params<T>({ route, path: '/TRUE' });
      const res7 = Router.params<T>({ route, path: '/False' });

      expect(res1.id).to.eql('foo');
      expect(res2.id).to.eql(123);
      expect(res3.id).to.eql('undefined');
      expect(res4.id).to.eql('null');
      expect(res5.id).to.eql(0);
      expect(res6.id).to.eql(true);
      expect(res7.id).to.eql(false);
    });

    it('patterns', () => {
      const test = (pattern: string, path: string, expected: any) => {
        const router = Router.create().get(pattern, handler);
        const route = router.routes[0];
        const res = Router.params({ route, path });
        expect(res).to.eql(expected);
      };

      test('/:id', '/hello', { id: 'hello' });
      test('/:id', '/hello///', { id: 'hello' });
      test('/:id/bar', '/hello/bar', { id: 'hello' });
      test('/:id/bar', '/hello/bar/boo', {}); // No match.
      test('/:id/bar/boo', '/123/bar/boo', { id: 123 });
      test('/:id/:name', '/hello/mary', { id: 'hello', name: 'mary' });
      test('/:id/bar/:name', '/hello/bar/mary', { id: 'hello', name: 'mary' });

      test('/foo/:id/:count/bar', '/foo/abc/123/bar', { id: 'abc', count: 123 });
      test('/foo/:id/:count/bar', '/foo/abc/123', {}); // No match.

      test('/:id', '/bob?q=123', { id: 'bob' });
      test('/foo/:id', '/foo/bob/?q=123', { id: 'bob' });
    });
  });

  describe('query-string', () => {
    it('query', () => {
      const test = (path: string, expected: any) => {
        const res = Router.query({ path });
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
  });
});
