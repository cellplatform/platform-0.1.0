import { JsonBus } from '.';
import { expect, pkg, rx, slug, t, Test, time, expectError } from '../test';
import { DEFAULT, Patch } from './common';

const Setup = {
  instance: (): t.JsonBusInstance => ({ bus: rx.bus(), id: `foo.${slug()}` }),
  controller() {
    const instance = Setup.instance();
    const controller = JsonBus.Controller({ instance });
    const events = JsonBus.Events({ instance });

    const dispose = () => {
      controller.dispose();
      events.dispose();
    };

    return { instance, controller, dispose, events };
  },
};

export default Test.describe('JsonBus', (e) => {
  type T = { count: number };

  e.describe('is', (e) => {
    const is = JsonBus.Events.is;

    e.it('is (static/instance)', () => {
      const instance = Setup.instance();
      const events = JsonBus.Events({ instance });
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
    e.it('instance details', async () => {
      const { instance, controller, events, dispose } = Setup.controller();
      const busid = rx.bus.instance(instance.bus);

      expect(controller.instance.bus).to.equal(busid);
      expect(controller.instance.id).to.equal(instance.id);

      expect(events.instance.bus).to.equal(busid);
      expect(events.instance.id).to.equal(instance.id);

      dispose();
    });

    e.describe('info (module)', (e) => {
      e.it('info', async () => {
        const { instance, events, dispose } = Setup.controller();
        const res = await events.info.get();
        dispose();

        expect(res.instance).to.eql(instance.id);
        expect(res.info?.module.name).to.eql(pkg.name);
        expect(res.info?.module.version).to.eql(pkg.version);
        expect(res.info?.keys).to.eql([]);
      });
    });

    e.describe('events.state', (e) => {
      e.describe('state.get', (e) => {
        e.it('no key ("default"), no state', async () => {
          const { dispose, events, instance } = Setup.controller();
          const res = await events.state.get.fire();
          dispose();

          expect(res.instance).to.eql(instance.id);
          expect(res.key).to.eql(DEFAULT.KEY);
          expect(res.value).to.eql(undefined);
          expect(res.error).to.eql(undefined);
        });

        e.it('get <typed>', async () => {
          const { dispose, events } = Setup.controller();
          await events.state.put.fire<T>({ count: 123 });
          expect((await events.state.get.fire<T>()).value?.count).to.eql(123);

          dispose();
        });

        e.it('get - initial {object}', async () => {
          const { dispose, events } = Setup.controller();

          const res1 = await events.state.get.fire<T>({ key: '1', initial: { count: 1 } });
          const res2 = await events.state.get.fire<T>({ key: '2', initial: () => ({ count: 2 }) });

          expect(res1.value?.count).to.eql(1);
          expect(res2.value?.count).to.eql(2);

          expect((await events.json<T>({ count: 0 }, { key: '1' }).get()).value?.count).to.eql(1);
          expect((await events.json<T>({ count: 0 }, { key: '2' }).get()).value?.count).to.eql(2);

          dispose();
        });
      });

      e.describe('state.put', (e) => {
        e.it('put<T> (default key)', async () => {
          const { dispose, events, controller, instance } = Setup.controller();

          // BEFORE state
          expect((await events.state.get.fire()).value).to.eql(undefined);
          expect((await events.info.get()).info?.keys).to.eql([]);

          const fired: t.JsonStateChange[] = [];
          controller.changed$.subscribe((e) => fired.push(e));

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
          const { dispose, events } = Setup.controller();
          expect((await events.info.get()).info?.keys).to.eql([]);

          const key = 'foo.bar/baz';
          const value = { msg: 'hello' };
          await events.state.put.fire(value, { key });

          expect((await events.info.get()).info?.keys).to.eql([key]); // BEFORE
          expect((await events.state.get.fire({ key })).value).to.eql(value);

          dispose();
        });
      });

      e.describe('state.patch', (e) => {
        e.it('mutator (sync)', async () => {
          const { dispose, events, instance } = Setup.controller();

          await events.state.put.fire<T>({ count: 123 });
          const res = await events.state.patch.fire<T>((prev, ctx) => prev.count++);

          expect(res.key).to.eql(DEFAULT.KEY);
          expect(res.instance).to.eql(instance.id);
          expect(res.error).to.eql(undefined);

          expect((await events.state.get.fire()).value).to.eql({ count: 124 });
          dispose();
        });

        e.it('mutator (async)', async () => {
          const { dispose, events } = Setup.controller();

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

        e.it('patch with {initial} value option', async () => {
          const { dispose, events } = Setup.controller();

          const initial: T = { count: 10 };
          const patch = events.state.patch;

          await patch.fire<T>((prev) => (prev.count -= 5), { key: '1', initial });
          expect((await events.state.get.fire({ key: '1' })).value).to.eql({ count: 5 });

          await patch.fire<T>((prev) => (prev.count += 5), { key: '2', initial: () => initial });
          expect((await events.state.get.fire({ key: '2' })).value).to.eql({ count: 15 });

          dispose();
        });

        e.it('patch on key object', async () => {
          const { dispose, events } = Setup.controller();

          const key = 'foo.bar';
          const initial: T = { count: 10 };
          await events.state.patch.fire<T>((prev) => (prev.count += 1), { initial, key });
          await events.state.patch.fire<T>((prev) => (prev.count += 4), { key });

          expect((await events.state.get.fire({ key })).value).to.eql({ count: 15 });
          dispose();
        });

        e.it('throw: no current state', async () => {
          const { dispose, events } = Setup.controller();

          const res1 = await events.state.patch.fire((prev) => null);
          const res2 = await events.state.patch.fire((prev) => null, { key: 'foo' });
          dispose();

          // Failed to patch, could not retrieve current state
          expect(res1.error).to.include('Failed to patch, could not retrieve current state');
          expect(res2.error).to.include('key="foo"');
        });
      });
    });

    e.describe('events.json<T>(...)', (e) => {
      e.it('.get(...)', async () => {
        const { events, dispose } = Setup.controller();

        await events.state.put.fire<T>({ count: 123 });
        const res1 = await events.json<T>({ count: 0 }).get();
        const res2 = await events.json<T>({ count: 1 }, { key: '1' }).get();
        const res3 = await events.json<T>(() => ({ count: 2 }), { key: '2' }).get();

        expect(res1.key).to.eql(DEFAULT.KEY);
        expect(res2.key).to.eql('1');
        expect(res3.key).to.eql('2');

        expect(res1.value?.count).to.eql(123);
        expect(res2.value?.count).to.eql(1);
        expect(res3.value?.count).to.eql(2);

        dispose();
      });

      e.it('.put(...)', async () => {
        const { events, dispose } = Setup.controller();

        const key = 'foo';
        const initial: T = { count: 0 };
        const res1 = await events.json<T>(initial).put({ count: 123 });
        const res2 = await events.json<T>(initial, { key }).put({ count: 456 });

        expect(res1.key).to.eql(DEFAULT.KEY);
        expect(res2.key).to.eql(key);

        expect((await events.info.get()).info?.keys).to.eql([DEFAULT.KEY, key]);
        expect((await events.state.get.fire()).value).to.eql({ count: 123 });
        expect((await events.state.get.fire({ key })).value).to.eql({ count: 456 });

        dispose();
      });

      e.it('.patch(...)', async () => {
        const { events, dispose } = Setup.controller();

        const key = 'foo';
        const initial: T = { count: 10 };
        await events.state.put.fire<T>({ count: 1 });

        const res1 = await events.json<T>(initial).patch((prev) => prev.count++);
        const res2 = await events.json<T>(initial, { key }).patch((prev, ctx) => prev.count--);

        expect(res1.key).to.eql(DEFAULT.KEY);
        expect(res2.key).to.eql(key);

        expect((await events.state.get.fire()).value).to.eql({ count: 2 });
        expect((await events.state.get.fire({ key })).value).to.eql({ count: 9 });

        dispose();
      });

      e.it('.$ (change stream)', async () => {
        const { events, dispose } = Setup.controller();
        const json = events.json<T>({ count: 0 });

        const fired: t.JsonStateChange<T>[] = [];
        json.$.subscribe((e) => fired.push(e));

        await json.put({ count: 1 });

        expect(fired.length).to.eql(1);
        expect(fired[0].op).to.eql('replace');
        expect(fired[0].value).to.eql({ count: 1 });

        await json.patch((prev) => (prev.count = 99));

        expect(fired.length).to.eql(2);
        expect(fired[1].op).to.eql('update');
        expect(fired[1].value).to.eql({ count: 99 });

        dispose();
      });

      e.it('.current', async () => {
        const { events, dispose } = Setup.controller();

        const initial: T = { count: 10 };
        const json = events.json<T>(initial);
        expect(json.current).to.eql(initial);

        await json.patch((prev) => (prev.count -= 5));
        expect(json.current).to.eql({ count: 5 });

        dispose();
      });
    });

    e.describe('changed$', (e) => {
      e.it('fires - replace / update', async () => {
        const { events, dispose } = Setup.controller();

        const fired: t.JsonStateChange[] = [];
        events.changed$.subscribe((e) => fired.push(e));
        const json = events.json<T>({ count: 0 });

        await json.get();
        expect(fired.length).to.eql(1);
        expect(fired[0].op).to.eql('replace'); // Iniital value set.
        expect(fired[0].value).to.eql({ count: 0 });

        await json.put({ count: 1 });
        expect(fired.length).to.eql(2);
        expect(fired[1].op).to.eql('replace');
        expect(fired[1].value).to.eql({ count: 1 });

        // NB: a PUT operation will always cause the event to fire, even when the values
        //    are identical. PATCH operations are more granular (for performance reasons).
        await json.put({ count: 1 });
        expect(fired.length).to.eql(3);
        expect(fired[2].op).to.eql('replace');
        expect(fired[2].value).to.eql({ count: 1 });

        await json.patch((prev) => prev.count++);

        expect(fired.length).to.eql(4);
        expect(fired[3].op).to.eql('update');
        expect(fired[3].value).to.eql({ count: 2 });

        dispose();
      });

      e.it('does not repeat fire when patch yields no changes', async () => {
        const { events, dispose } = Setup.controller();

        const fired: t.JsonStateChange[] = [];
        events.changed$.subscribe((e) => fired.push(e));
        const json = events.json<T>({ count: 0 });

        await json.patch((prev) => prev.count++);

        expect(fired.length).to.eql(2); // NB: First event is the {initial} PUT.
        expect(fired[0].op).to.eql('replace');
        expect(fired[1].op).to.eql('update');
        expect(fired[0].value).to.eql({ count: 0 });
        expect(fired[1].value).to.eql({ count: 1 });

        await json.patch(() => null); //   NB: do nothing.
        expect(fired.length).to.eql(2); // NB: no change.

        dispose();
      });

      e.it('fires on method/key subset', async () => {
        const { events, dispose } = Setup.controller();

        const initial: T = { count: 0 };
        const json1 = events.json<T>(initial);
        const json2 = events.json<T>(initial, { key: '2' });

        const fired1: t.JsonStateChange[] = [];
        const fired2: t.JsonStateChange[] = [];

        json1.$.subscribe((e) => fired1.push(e));
        json2.$.subscribe((e) => fired2.push(e));

        await json1.put({ count: 1 });
        await json2.put({ count: 2 });
        await json2.patch((prev) => prev.count++);

        expect(fired1.length).to.eql(1);
        expect(fired2.length).to.eql(2);

        expect(fired1[0].value).to.eql({ count: 1 });
        expect(fired2[1].value).to.eql({ count: 3 });

        expect(fired1.every((e) => e.key === DEFAULT.KEY)).to.eql(true);
        expect(fired2.every((e) => e.key === '2')).to.eql(true);

        dispose();
      });
    });

    e.describe('json.lens (method)', (e) => {
      type T = { child: { count: number } };

      e.describe('lens.get', (e) => {
        e.it('get (child target)', async () => {
          const { events, dispose } = Setup.controller();
          const initial: T = { child: { count: 10 } };
          const lens = events.json<T>(initial).lens((root) => root.child);
          const res = await lens.get();
          expect(res).to.eql(initial.child);
          dispose();
        });

        e.it('throw: root object not derived', async () => {
          const { events, dispose } = Setup.controller();
          const json = events.json<T>(undefined as any); // NB: No initial object.
          const lens = json.lens((root) => root.child);
          await expectError(lens.get, 'Lens root object could not be derived');
          dispose();
        });

        e.it('throw: child target not derived', async () => {
          const { events, dispose } = Setup.controller();
          const initial: T = { child: { count: 10 } };
          const json = events.json<T>(initial);
          const lens = json.lens((root) => null as any); // NB: fake not returning the lens target.
          await expectError(lens.get, 'Lens target child could not be derived');
          dispose();
        });
      });

      e.describe('lens.patch', (e) => {
        e.it('patch (child target)', async () => {
          const { events, dispose } = Setup.controller();
          const initial: T = { child: { count: 0 } };

          const lens = events.json<T>(initial).lens((root) => root.child);
          await lens.patch((target, ctx) => (target.count += 5));

          expect(await lens.get()).to.eql({ count: 5 });
          dispose();
        });

        e.it('throw: root/target objects not derived', async () => {
          const { events, dispose } = Setup.controller();

          // NB: No initial (root) object.
          await expectError(async () => {
            const lens = events.json<T>(undefined as any).lens((root) => root.child);
            await lens.patch((doc) => doc.count++);
          }, 'Lens root object could not be derived');

          // NB: no target supplied from factory.
          await expectError(async () => {
            const initial: T = { child: { count: 10 } };
            const lens = events.json<T>(initial).lens((root) => null as any);
            await lens.patch((doc) => doc.count++);
          }, 'Lens target child could not be derived');

          dispose();
        });
      });
    });
  });
});
