import { expect } from 'chai';
import { Router } from '.';
import { t } from '../common';

const handler: t.RouteHandler = async req => undefined;

describe('Router', () => {
  it('adds', () => {
    const router = Router.create();
    expect(router.routes.length).to.eql(0);
    router.add('GET', '/foo', handler);
    expect(router.routes.length).to.eql(1);
  });

  it('finds', () => {
    const router = Router.create();

    expect(router.find({})).to.eql(undefined);
    expect(router.find({ method: 'GET', url: '/foo' })).to.eql(undefined);

    router.get('/foo', handler);
    const res = router.find({ method: 'GET', url: '/foo' });

    expect(res && res.method).to.eql('GET');
    expect(res && res.path).to.eql('/foo');
  });

  it('throws if route already added.', () => {
    const router = Router.create();
    router.get('/foo', handler);
    const fn = () => router.get('/foo', handler);
    expect(fn).to.throw();
  });
});
