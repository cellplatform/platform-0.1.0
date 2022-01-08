import { expect, rx, Test, pkg } from '../web.test';
import { MyBus } from '.';

export default Test.describe('MyBus', (e) => {
  const bus = rx.bus();

  e.describe('is', (e) => {
    const is = MyBus.Events.is;

    e.it('is (static/instance)', () => {
      const events = MyBus.Events({ bus });
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
      const { dispose, events } = MyBus.Controller({ bus });
      const res = await events.info.get();
      dispose();

      expect(res.id).to.eql('default-instance');
      expect(res.info?.module.name).to.eql(pkg.name);
      expect(res.info?.module.version).to.eql(pkg.version);
    });
  });
});
