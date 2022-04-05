import { expect, rx, Test, pkg, slug } from '../test';
import { MyBus } from '.';

export default Test.describe('MyBus', (e) => {
  const Create = {
    instance: (): t.JsonBusInstance => ({ bus: rx.bus(), id: `foo.${slug()}` }),
  };

  e.describe('is', (e) => {
    const is = MyBus.Events.is;

    e.it('is (static/instance)', () => {
      const instance = Create.instance();
      const events = MyBus.Events({ instance });
      expect(events.is).to.equal(is);
    });

    e.it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('my.namespace/', true);
    });

    e.it('is.instance', () => {
      const type = 'my.namespace/';
      expect(is.instance({ type, payload: { id: 'abc' } }, 'abc')).to.eql(true);
      expect(is.instance({ type, payload: { id: 'abc' } }, '123')).to.eql(false);
      expect(is.instance({ type: 'foo', payload: { id: 'abc' } }, 'abc')).to.eql(false);
    });
  });

  e.describe('Controller/Events', (e) => {
    e.it('info', async () => {
      const instance = Create.instance();
      const { dispose, events } = MyBus.Controller({ instance });
      const res = await events.info.get();
      dispose();

      expect(res.instance).to.eql(instance.id);
      expect(res.info?.module.name).to.eql(pkg.name);
      expect(res.info?.module.version).to.eql(pkg.version);
    });
  });
});
