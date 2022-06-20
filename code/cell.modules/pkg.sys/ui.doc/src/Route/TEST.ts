import { Route } from '.';
import { expect, rx, slug, t, Test } from '../test';

export default Test.describe('MyBus', (e) => {
  const Create = {
    instance: (): t.RouteInstance => ({ bus: rx.bus(), id: `foo.${slug()}` }),
    mock: () => Route.LocationMock(),
  };

  e.describe('is', (e) => {
    const is = Route.Events.is;

    e.it('is (static/instance)', () => {
      const instance = Create.instance();
      const events = Route.Events({ instance });
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
    e.it('info (with mock)', async () => {
      const instance = Create.instance();
      const location = Create.mock();
      const events = Route.Controller({ instance, location });
      const res = await events.info.get();
      events.dispose();

      expect(res.instance).to.eql(instance.id);
      expect(res.info?.url.href).to.eql(location.href);
      expect(res.info?.secure).to.eql(true);
      expect(res.info?.localhost).to.eql(false);
    });

    e.it('info (with default [window.location])', async () => {
      const instance = Create.instance();
      const events = Route.Controller({ instance });
      const res = await events.info.get();
      events.dispose();

      expect(res.info?.url.href).to.eql(window.location.href);
      expect(res.info?.secure).to.eql(false);
      expect(res.info?.localhost).to.eql(true);
    });

    e.it('singleton instance', () => {
      const events = Route.Events({ instance: { bus: rx.bus() } });
      expect(events.instance.id).to.eql('singleton');
    });
  });

  e.describe('LocationMock', (e) => {
    e.it('init: default href', () => {
      const mock = Route.LocationMock();
      expect(mock.href).to.eql('https://domain.com/mock');
      expect(mock.pathname).to.eql('/mock');
      expect(mock.protocol).to.eql('https:');
      expect(mock.origin).to.eql('https://domain.com');
      expect(mock.host).to.eql('domain.com');
      expect(mock.hostname).to.eql('domain.com');
      expect(mock.port).to.eql('');
    });

    e.it('init: custom href', () => {
      const mock = Route.LocationMock('https://foo.org');
      expect(mock.href).to.eql('https://foo.org/');
      expect(mock.pathname).to.eql('/');
    });

    e.it('change "pathname"', () => {
      const mock = Route.LocationMock();
      mock.pathname = 'foobar';
      expect(mock.href).to.eql('https://domain.com/foobar');
      expect(mock.toString()).to.eql(mock.href);
      expect(mock.pathname).to.eql('/foobar');

      mock.pathname = '';
      expect(mock.href).to.eql('https://domain.com/');
      expect(mock.pathname).to.eql('/');

      mock.pathname = 'foo.bar/baz/';
      expect(mock.href).to.eql('https://domain.com/foo.bar/baz/');
      expect(mock.pathname).to.eql('/foo.bar/baz/');

      mock.pathname = 'with space';
      expect(mock.pathname).to.eql('/with%20space');
    });

    e.it('change "hash" (fragment)', () => {
      const mock = Route.LocationMock();
      expect(mock.hash).to.eql('');

      mock.hash = 'foo';
      expect(mock.hash).to.eql('#foo');
      expect(mock.href).to.eql('https://domain.com/mock#foo');

      mock.hash = 'with space';
      expect(mock.hash).to.eql('#with%20space');
      expect(mock.href).to.eql('https://domain.com/mock#with%20space');

      mock.hash = '';
      expect(mock.hash).to.eql('');
      expect(mock.href).to.eql('https://domain.com/mock');
    });

    e.describe('searchParams', (e) => {
      e.it('get | keys', () => {
        const mock1 = Route.LocationMock();
        const mock2 = Route.LocationMock('https://domain.com/?foo=123');

        expect(mock1.search).to.eql('');
        expect(mock2.search).to.eql('?foo=123');

        expect(mock1.searchParams.get('foo')).to.eql(null);
        expect(mock1.searchParams.keys).to.eql([]);

        expect(mock2.searchParams.get('foo')).to.eql('123');
        expect(mock2.searchParams.keys).to.eql(['foo']);
      });

      e.it('set', () => {
        const mock = Route.LocationMock();
        expect(mock.search).to.eql('');
        expect(mock.searchParams.keys).to.eql([]);

        mock.searchParams.set('foo', '123');
        expect(mock.search).to.eql('?foo=123');
        expect(mock.searchParams.keys).to.eql(['foo']);

        mock.searchParams.set('bar', '');
        expect(mock.search).to.eql('?foo=123&bar=');
        expect(mock.searchParams.keys).to.eql(['foo', 'bar']);

        expect(mock.href).to.eql('https://domain.com/mock?foo=123&bar=');
      });

      e.it('set: with space ("+")', () => {
        const mock = Route.LocationMock();
        mock.searchParams.set('foo', 'with space');
        expect(mock.href).to.eql('https://domain.com/mock?foo=with+space');
        expect(mock.searchParams.get('foo')).to.eql('with space'); // NB: Decoded via "get" method.
      });

      e.it('set: URL encoding ("one/two")', () => {
        const mock = Route.LocationMock();
        mock.searchParams.set('foo', 'one/two');
        expect(mock.href).to.eql('https://domain.com/mock?foo=one%2Ftwo');
        expect(mock.searchParams.get('foo')).to.eql('one/two'); // NB: Decoded via "get" method.
      });

      e.it('delete', () => {
        const mock = Route.LocationMock();
        mock.searchParams.set('foo', '123');
        mock.searchParams.set('bar', '456');
        expect(mock.searchParams.keys).to.eql(['foo', 'bar']);
        expect(mock.href).to.eql('https://domain.com/mock?foo=123&bar=456');

        mock.searchParams.delete('foo');
        expect(mock.searchParams.keys).to.eql(['bar']);
        expect(mock.href).to.eql('https://domain.com/mock?bar=456');

        mock.searchParams.delete('NO_EXIST');
        expect(mock.searchParams.keys).to.eql(['bar']);
        expect(mock.href).to.eql('https://domain.com/mock?bar=456');

        mock.searchParams.delete('bar');
        expect(mock.searchParams.keys).to.eql([]);
        expect(mock.href).to.eql('https://domain.com/mock');
      });
    });
  });
});
