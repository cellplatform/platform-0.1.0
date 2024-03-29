import { RouteBus } from '.';
import { expect, rx, slug, t, Test } from '../../test';
import { DEFAULT } from './common';

export default Test.describe('Route.Bus', (e) => {
  const Create = {
    instance: (): t.RouteInstance => ({ bus: rx.bus(), id: `foo.${slug()}` }),
    controller(options: { href?: string } = {}) {
      const instance = Create.instance();
      const href = options.href ?? 'https://domain.com/mock';
      const { location, getHref, pushState } = RouteBus.Dev.mock(href);
      const events = RouteBus.Controller({ instance, getHref, pushState });
      const dispose = events.dispose;
      return { instance, location, events, dispose };
    },
  };

  e.describe('is', (e) => {
    const is = RouteBus.Events.is;

    e.it('is (static/instance)', () => {
      const instance = Create.instance();
      const events = RouteBus.Events({ instance });
      expect(events.is).to.equal(is);
    });

    e.it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('sys.ui.route/', true);
    });

    e.it('is.instance', () => {
      const type = 'sys.ui.route/';
      expect(is.instance({ type, payload: { instance: 'abc' } }, 'abc')).to.eql(true);
      expect(is.instance({ type, payload: { instance: 'abc' } }, '123')).to.eql(false);
      expect(is.instance({ type: 'foo', payload: { instance: 'abc' } }, 'abc')).to.eql(false);
    });
  });

  e.describe('Controller/Events', (e) => {
    e.it('instance (bus/id)', () => {
      const events = RouteBus.Events({ instance: { bus: rx.bus(), id: 'foo' } });
      expect(events.instance.id).to.eql('foo');
    });

    e.it('info (with mock)', async () => {
      const instance = Create.instance();
      const { location, getHref } = RouteBus.Dev.mock('https://domain.com/mock');
      const events = RouteBus.Controller({ instance, getHref });
      const res = await events.info.get();
      events.dispose();

      expect(res.instance).to.eql(instance.id);
      expect(res.info?.secure).to.eql(true);
      expect(res.info?.localhost).to.eql(false);
      expect(res.info?.url.href).to.eql(location.href);
      expect(res.info?.url.path).to.eql('/mock');
      expect(res.info?.url.query).to.eql({});
      expect(res.info?.url.hash).to.eql('');
    });

    e.it('info (with default [window.location])', async () => {
      const instance = Create.instance();
      const events = RouteBus.Controller({ instance });
      const res = await events.info.get();
      events.dispose();

      const protocol = window.location.protocol;
      const isLocalhost = window.location.hostname === 'localhost';
      const isSecure = protocol === 'https:' ? true : false;

      expect(res.info?.url.href).to.eql(window.location.href, 'url.href');
      expect(res.info?.secure).to.eql(isSecure, 'info.secure');
      expect(res.info?.localhost).to.eql(isLocalhost, 'info.localhost');
    });

    e.it('current', async () => {
      const { dispose, events, location } = Create.controller();
      expect(events.current.url).to.eql(DEFAULT.URL); // NB: Initial before load it complete.

      const res = await events.ready();
      expect((res as any).dispose).to.eql(undefined); // NB: An undisposable clone is returned.
      dispose();

      expect(events.current.url.href).to.eql(location.href);
      expect(res.current.url.href).to.eql(location.href);
    });

    e.it('info.url: href / path / query / hash', async () => {
      const href = 'https://domain.com/doc?foo=123#fragment';
      const { dispose, events } = Create.controller({ href });

      const res = await events.info.get();
      dispose();

      const url = res.info?.url;
      expect(url?.href).to.eql('https://domain.com/doc?foo=123#fragment');
      expect(url?.path).to.eql('/doc');
      expect(url?.query).to.eql({ foo: '123' });
      expect(url?.hash).to.eql('fragment');
    });

    e.it('cloneable', async () => {
      const { dispose, events: parent } = Create.controller();
      const clone = parent.clone();

      expect(typeof parent.dispose).to.eql('function');
      expect((clone as any).dispose).to.eql(undefined);

      await clone.change.path('/foo');
      expect(clone.current.url.path).to.eql('/foo');
      expect(parent.current.url.path).to.eql('/foo');

      await parent.change.path('/bar');
      expect(clone.current.url.path).to.eql('/bar');
      expect(parent.current.url.path).to.eql('/bar');

      dispose();
    });

    e.describe('change', (e) => {
      e.it('change: path', async () => {
        const { dispose, events } = Create.controller({ href: 'http://localhost/?foo=123#one' });
        const res = await events.change.fire({ path: 'hello' });

        // NB: Other values (hash, query) unchanged.
        expect(res.info?.url.path).to.eql('/hello');
        expect(res.info?.url.hash).to.eql('one');
        expect(res.info?.url.query).to.eql({ foo: '123' });

        expect((await events.info.get()).info).to.eql(res.info);
        dispose();
      });

      e.it('change: path AND hash', async () => {
        const { dispose, events } = Create.controller({});
        const res = await events.change.fire({ path: 'hello', hash: 'foobar' });

        expect(res.info?.url.path).to.eql('/hello');
        expect(res.info?.url.hash).to.eql('foobar');

        expect((await events.info.get()).info).to.eql(res.info);
        dispose();
      });

      e.it('change: query (append with [array])', async () => {
        const { dispose, events } = Create.controller();
        const res1 = await events.change.fire({ query: [{ key: 'foo', value: '123' }] });
        expect(res1.info?.url.query.foo).to.eql('123');

        const res2 = await events.change.fire({
          query: [
            { key: 'foo', value: '456' },
            { key: 'foo', value: '4567' },
          ],
        });
        expect(res2.info?.url.query.foo).to.eql('4567');

        const res3 = await events.change.fire({
          query: [
            { key: 'bar', value: '789' },
            { key: 'zoo', value: '0' },
          ],
        });

        expect(res3.info?.url.query.foo).to.eql('4567');
        expect(res3.info?.url.query.bar).to.eql('789');
        expect(res3.info?.url.query.zoo).to.eql('0');

        expect((await events.info.get()).info).to.eql(res3.info);
        dispose();
      });

      e.it('change: query (replave with {object})', async () => {
        const { dispose, events } = Create.controller({ href: 'https://domain.com/?foo=123' });
        const res = await events.change.fire({ query: { foo: '456', bar: 'boo' } });

        expect(res.info?.url.query.foo).to.eql('456');
        expect(res.info?.url.query.bar).to.eql('boo');

        expect((await events.info.get()).info).to.eql(res.info);
        dispose();
      });

      e.it('changed$', async () => {
        const { dispose, events } = Create.controller({ href: 'https://domain.com/mock' });

        const fired: t.RouteCurrent[] = [];
        events.current.$.subscribe((e) => fired.push(e));
        expect(fired.length).to.eql(0); // NB: not ready yet.

        await events.ready();
        expect(fired.length).to.eql(1);
        expect(fired[0].info.url.href).to.eql('https://domain.com/mock'); // Initial firing of "current" url.

        await events.change.fire({ query: { foo: '456', bar: 'boo' } });
        await events.change.fire({ path: 'hello' });
        dispose();

        expect(fired.length).to.eql(3);
        expect(fired[1].info.url.href).to.eql('https://domain.com/mock?foo=456&bar=boo');
        expect(fired[2].info.url.href).to.eql('https://domain.com/hello?foo=456&bar=boo');
      });
    });
  });

  e.describe('QueryParams', (e) => {
    e.it('url', () => {
      const url = new URL('https://domain.com');
      const query = RouteBus.QueryParams(url);
      expect(query.url).to.equal(url);
    });

    e.it('get | keys', () => {
      const query1 = RouteBus.QueryParams(new URL('https://domain.com'));
      const query2 = RouteBus.QueryParams('https://domain.com/?foo=123');

      expect(query1.toString()).to.eql('');
      expect(query2.toString()).to.eql('?foo=123');

      expect(query1.get('foo')).to.eql(null);
      expect(query1.keys).to.eql([]);
      expect(query1.toObject()).to.eql({});

      expect(query2.get('foo')).to.eql('123');
      expect(query2.keys).to.eql(['foo']);
      expect(query2.toObject()).to.eql({ foo: '123' });
    });

    e.it('set (mutate)', () => {
      const query = RouteBus.QueryParams('https://domain.com/mock');

      expect(query.toString()).to.eql('');
      expect(query.keys).to.eql([]);

      query.set('foo', '123');
      expect(query.toString()).to.eql('?foo=123');
      expect(query.keys).to.eql(['foo']);

      query.set('bar', '');
      expect(query.toString()).to.eql('?foo=123&bar=');
      expect(query.keys).to.eql(['foo', 'bar']);

      expect(query.url.href).to.eql('https://domain.com/mock?foo=123&bar=');
    });

    e.it('set (null, undefined)', () => {
      const query = RouteBus.QueryParams('https://domain.com/mock');

      const test = (value: any) => {
        query.set('foo', value);
        expect(query.keys).to.eql([]);

        query.set('foo', 'DUMMY');
        query.set('foo', value);
        expect(query.keys).to.eql([]); // NB: The empty value removes the key.
      };

      test(undefined);
      test(null);
      test({});
      test([{}]);
      test(123);
    });

    e.it('set: with space ("+")', () => {
      const query = RouteBus.QueryParams('https://domain.com/mock');
      query.set('foo', 'with space');
      expect(query.url.href).to.eql('https://domain.com/mock?foo=with+space');
      expect(query.get('foo')).to.eql('with space'); // NB: Decoded via "get" method.
    });

    e.it('set: URL encoding ("one/two")', () => {
      const query = RouteBus.QueryParams('https://domain.com/mock');
      query.set('foo', 'one/two');
      expect(query.url.href).to.eql('https://domain.com/mock?foo=one%2Ftwo');
      expect(query.get('foo')).to.eql('one/two'); // NB: Decoded via "get" method.
    });

    e.it('delete', () => {
      const query = RouteBus.QueryParams('https://domain.com/mock');
      query.set('foo', '123');
      query.set('bar', '456');
      expect(query.keys).to.eql(['foo', 'bar']);
      expect(query.url.href).to.eql('https://domain.com/mock?foo=123&bar=456');

      query.delete('foo');
      expect(query.keys).to.eql(['bar']);
      expect(query.url.href).to.eql('https://domain.com/mock?bar=456');

      query.delete('NO_EXIST');
      expect(query.keys).to.eql(['bar']);
      expect(query.url.href).to.eql('https://domain.com/mock?bar=456');

      query.delete('bar');
      expect(query.keys).to.eql([]);
      expect(query.url.href).to.eql('https://domain.com/mock');
    });

    e.it('clear', () => {
      const query = RouteBus.QueryParams('https://domain.com/mock?foo=123&bar=456');
      expect(query.keys).to.eql(['foo', 'bar']);
      query.clear();
      expect(query.keys).to.eql([]);
    });
  });
});
