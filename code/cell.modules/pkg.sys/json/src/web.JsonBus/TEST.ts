import { t, expect, rx, Test, pkg, slug } from '../test';
import { Json } from '.';
import { DEFAULT } from './common';

export default Test.describe('JsonBus', (e) => {
  const Create = {
    instance: (): t.JsonBusInstance => ({ bus: rx.bus(), id: `foo.${slug()}` }),
  };

  e.describe('is', (e) => {
    const is = Json.Events.is;

    e.it('is (static/instance)', () => {
      const instance = Create.instance();
      const events = Json.Events({ instance });
      expect(events.is).to.equal(is);
    });

    e.it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('sys.json/', true);
    });

    e.it('is.instance', () => {
      const type = 'sys.json/';
      expect(is.instance({ type, payload: { instance: 'abc' } }, 'abc')).to.eql(true);
      expect(is.instance({ type, payload: { instance: 'abc' } }, '123')).to.eql(false);
      expect(is.instance({ type: 'foo', payload: { instance: 'abc' } }, 'abc')).to.eql(false);
    });
  });

  e.describe('Controller/Events', (e) => {
    const setup = () => {
      const instance = Create.instance();
      const controller = Json.Controller({ instance });
      const events = Json.Events({ instance });

      const dispose = () => {
        controller.dispose();
        events.dispose();
      };

      return { instance, controller, dispose, events };
    };

    e.it('instance details', async () => {
      const { instance, controller, events, dispose } = setup();
      const busid = rx.bus.instance(instance.bus);

      expect(controller.instance.bus).to.equal(busid);
      expect(controller.instance.id).to.equal(instance.id);

      expect(events.instance.bus).to.equal(busid);
      expect(events.instance.id).to.equal(instance.id);

      dispose();
    });

    e.describe('info: req/res', (e) => {
      e.it('info', async () => {
        const { instance, events, dispose } = setup();
        const res = await events.info.get();
        dispose();

        expect(res.instance).to.eql(instance.id);
        expect(res.info?.module.name).to.eql(pkg.name);
        expect(res.info?.module.version).to.eql(pkg.version);
        expect(res.info?.keys).to.eql([]);
      });
    });

    e.describe('get', (e) => {
      e.it('get === state.get.fire', () => {
        const { dispose, events } = setup();
        expect(events.get).to.equal(events.state.get.fire);
        dispose();
      });

      e.it('no key ("default"), no state', async () => {
        const { dispose, events, instance } = setup();
        const res = await events.get();
        dispose();

        expect(res.instance).to.eql(instance.id);
        expect(res.key).to.eql(DEFAULT.KEY);
        expect(res.value).to.eql(undefined);
        expect(res.error).to.eql(undefined);
      });
    });

    e.describe('put', (e) => {
      e.it('put === state.put.fire', () => {
        const { dispose, events } = setup();
        expect(events.put).to.equal(events.state.put.fire);
        dispose();
      });

      e.it('put<T> (default key)', async () => {
        const { dispose, events, controller, instance } = setup();

        // BEFORE state
        expect((await events.get()).value).to.eql(undefined);
        expect((await events.info.get()).info?.keys).to.eql([]);

        const fired: t.JsonStateChange[] = [];
        controller.changed$.subscribe((e) => fired.push(e));

        type T = { count: number };
        const value: T = { count: 123 };
        const res = await events.put<T>(value);

        expect(res.instance).to.eql(instance.id);
        expect(res.key).to.eql(DEFAULT.KEY);

        // AFTER state
        expect((await events.get()).value).to.eql(value);
        expect((await events.info.get()).info?.keys).to.eql([DEFAULT.KEY]);

        expect(fired.length).to.eql(1);
        expect(fired[0].key).to.eql(DEFAULT.KEY);
        expect(fired[0].op).to.eql('put');
        expect(fired[0].value).to.eql(value);

        dispose();
      });

      e.it('put (all types)', async () => {
        const { dispose, events } = setup();

        async function test(value: t.Json) {
          await events.put(value);
          expect((await events.get()).value).to.eql(value);
        }

        await test(null);
        await test(undefined);
        await test(true);
        await test(false);
        await test(123);
        await test('text');
        await test({ count: 123 });
        await test([{ count: 123 }, null, 'hello']);

        dispose();
      });

      e.it('put (specific key)', async () => {
        const { dispose, events } = setup();
        expect((await events.info.get()).info?.keys).to.eql([]);

        const key = 'foo.bar/baz';
        const value = { msg: 'hello' };
        await events.put(value, { key });

        expect((await events.info.get()).info?.keys).to.eql([key]); // BEFORE
        expect((await events.get({ key })).value).to.eql(value);

        dispose();
      });
    });
  });
});
