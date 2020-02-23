import { expect, t, bodyParser } from '../test';
import { Router } from '.';

const handler: t.RouteHandler = async req => undefined;

describe('Router', () => {
  it('adds', () => {
    const router = Router.create({ bodyParser });
    expect(router.routes.length).to.eql(0);
    router.add('GET', '/foo', handler);
    expect(router.routes.length).to.eql(1);
  });

  it('throws if route already added.', () => {
    const router = Router.create({ bodyParser });
    router.get('/foo', handler);
    const fn = () => router.get('/foo', handler);
    expect(fn).to.throw();
  });

  describe('find', () => {
    it('no match', () => {
      const router = Router.create({ bodyParser });
      router.get('/foo', handler);
      const res = router.find({ method: 'GET', url: '/bar' });
      expect(res).to.eql(undefined);
    });

    it('GET /foo', () => {
      const router = Router.create({ bodyParser });

      expect(router.find({})).to.eql(undefined);
      expect(router.find({ method: 'GET', url: '/foo' })).to.eql(undefined);

      router.get('/foo', handler);
      const res = router.find({ method: 'GET', url: '/foo' });

      expect(res && res.method).to.eql('GET');
      expect(res && res.path).to.eql('/foo');
    });

    it('GET /foo?q=123 (query-string)', () => {
      const router = Router.create({ bodyParser });

      router.get('/foo', handler);
      const res = router.find({ method: 'GET', url: '/foo?q=123' });

      expect(res && res.method).to.eql('GET');
      expect(res && res.path).to.eql('/foo');
    });

    it('GET /foo/:id/bar', () => {
      const router = Router.create({ bodyParser });

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
      const router = Router.create({ bodyParser });

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
});
