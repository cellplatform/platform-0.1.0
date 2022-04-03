import { t, expect, rx, Test, pkg, slug } from '../test';
import { Json } from '.';

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
    e.it('info', async () => {
      const instance = Create.instance();
      const { dispose, events } = Json.Controller({ instance });
      const res = await events.info.get();
      dispose();

      expect(res.instance).to.eql(instance.id);
      expect(res.info?.module.name).to.eql(pkg.name);
      expect(res.info?.module.version).to.eql(pkg.version);
    });
  });
});
