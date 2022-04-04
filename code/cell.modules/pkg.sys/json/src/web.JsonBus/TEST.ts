import { Json } from '.';
import { expect, pkg, rx, slug, t, Test, time } from '../test';
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

    e.describe('info (module)', (e) => {
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
      e.it('no key ("default"), no state', async () => {
        const { dispose, events, instance } = setup();
        const res = await events.state.get.fire();
        dispose();

        expect(res.instance).to.eql(instance.id);
        expect(res.key).to.eql(DEFAULT.KEY);
        expect(res.value).to.eql(undefined);
        expect(res.error).to.eql(undefined);
      });

      e.it('get <typed>', async () => {
        const { dispose, events, instance } = setup();
        //
        type T = { count: number };

        await events.state.put.fire<T>({ count: 123 });
        expect((await events.state.get.fire<T>()).value?.count).to.eql(123);

        dispose();
      });

      e.it('get (setting initial value)', async () => {
        //
      });
    });

    e.describe('put', (e) => {
      e.it('put<T> (default key)', async () => {
        const { dispose, events, controller, instance } = setup();

        // BEFORE state
        expect((await events.state.get.fire()).value).to.eql(undefined);
        expect((await events.info.get()).info?.keys).to.eql([]);

        const fired: t.JsonStateChange[] = [];
        controller.changed$.subscribe((e) => fired.push(e));

        type T = { count: number };
        const value: T = { count: 123 };
        const res = await events.state.put.fire<T>(value);

        expect(res.instance).to.eql(instance.id);
        expect(res.key).to.eql(DEFAULT.KEY);

        // AFTER state
        expect((await events.state.get.fire()).value).to.eql(value);
        expect((await events.info.get()).info?.keys).to.eql([DEFAULT.KEY]);

        expect(fired.length).to.eql(1);
        expect(fired[0].key).to.eql(DEFAULT.KEY);
        expect(fired[0].op).to.eql('replace');
        expect(fired[0].value).to.eql(value);

        dispose();
      });

      e.it('put (specific key)', async () => {
        const { dispose, events } = setup();
        expect((await events.info.get()).info?.keys).to.eql([]);

        const key = 'foo.bar/baz';
        const value = { msg: 'hello' };
        await events.state.put.fire(value, { key });

        expect((await events.info.get()).info?.keys).to.eql([key]); // BEFORE
        expect((await events.state.get.fire({ key })).value).to.eql(value);

        dispose();
      });
    });

    e.describe('patch', (e) => {
      type T = { count: number };

      e.it('throw: no current state', async () => {
        const { dispose, events } = setup();

        const res1 = await events.state.patch.fire((prev) => null);
        const res2 = await events.state.patch.fire((prev) => null, { key: 'foo' });
        dispose();

        // Failed to patch, could not retrieve current state
        expect(res1.error).to.include('Failed to patch, could not retrieve current state');
        expect(res2.error).to.include('key="foo"');
      });

      e.it('patch results', async () => {
        const { dispose, events, instance } = setup();

        await events.state.put.fire<T>({ count: 123 });
        const res = await events.state.patch.fire<T>((prev) => prev.count++);

        expect(res.key).to.eql(DEFAULT.KEY);
        expect(res.instance).to.eql(instance.id);
        expect(res.error).to.eql(undefined);

        expect((await events.state.get.fire()).value).to.eql({ count: 124 });
        dispose();
      });

      e.it('patch with {initial} value option', async () => {
        const { dispose, events, instance } = setup();

        const initial: T = { count: 10 };
        const res = await events.state.patch.fire<T>((prev) => (prev.count -= 5), { initial });

        expect(res.key).to.eql(DEFAULT.KEY);
        expect(res.instance).to.eql(instance.id);
        expect(res.error).to.eql(undefined);

        expect((await events.state.get.fire()).value).to.eql({ count: 5 });
        dispose();
      });

      e.it('patch on key object', async () => {
        const { dispose, events } = setup();

        const key = 'foo.bar';
        const initial: T = { count: 10 };
        await events.state.patch.fire<T>((prev) => (prev.count += 1), { initial, key });
        await events.state.patch.fire<T>((prev) => (prev.count += 4), { key });

        expect((await events.state.get.fire({ key })).value).to.eql({ count: 15 });
        dispose();
      });

      e.it('async patch mutator', async () => {
        const { dispose, events } = setup();

        const initial: T = { count: 10 };
        await events.state.patch.fire<T>(
          async (prev) => {
            await time.wait(5);
            prev.count += 10;
          },
          { initial },
        );

        expect((await events.state.get.fire()).value).to.eql({ count: 20 });
        dispose();
      });
    });

    // e.describe('key( ... )', (e) => {
    //   e.it('key property', () => {
    //     const { events, dispose } = setup();

    //     const res1 = events.key('foo', { timeout: 1234 });
    //     const res2 = events.key();

    //     expect(res1.key).to.eql('foo');
    //     expect(res2.key).to.eql(DEFAULT.KEY);

    //     expect(res1.timeout).to.eql(1234);
    //     expect(res2.timeout).to.eql(DEFAULT.TIMEOUT);

    //     dispose();
    //   });
    // });
  });
});
