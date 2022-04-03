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
      });
    });

    e.describe('state.get: req/res', (e) => {
      e.it('initial (no key, no state)', async () => {
        const { dispose, events, instance } = setup();
        const res = await events.state.get();
        dispose();

        expect(res.instance).to.eql(instance.id);
        expect(res.key).to.eql(DEFAULT.KEY);
        expect(res.state).to.eql(undefined);
        expect(res.error).to.eql(undefined);
      });
    });
  });
});
