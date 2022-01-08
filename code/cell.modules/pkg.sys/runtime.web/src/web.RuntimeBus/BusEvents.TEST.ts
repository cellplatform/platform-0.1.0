import { expect, rx, Test } from '../web.test';
import { WebRuntimeBus } from '.';

const bus = rx.bus();

export default Test.describe('WebRuntimeBus (Events)', (e) => {
  e.describe('is', (e) => {
    const is = WebRuntimeBus.Events.is;

    e.it('is (static/instance)', () => {
      const events = WebRuntimeBus.Events({ bus });
      expect(events.is).to.equal(is);
    });

    e.it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('sys.runtime.web/', true);
    });

    e.it('is.instance', () => {
      const type = 'sys.runtime.web/';
      expect(is.instance({ type, payload: { id: 'abc' } }, 'abc')).to.eql(true);
      expect(is.instance({ type, payload: { id: 'abc' } }, '123')).to.eql(false);
      expect(is.instance({ type: 'foo', payload: { id: 'abc' } }, 'abc')).to.eql(false);
    });
  });
});
