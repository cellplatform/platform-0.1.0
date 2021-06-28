import { expect, rx } from '../../test';
import { Bundle } from '.';

const bus = rx.bus();

describe('main.Bundle', () => {
  describe('Events', () => {
    const is = Bundle.Events.is;

    it('is (static/instance)', () => {
      const events = Bundle.Events({ bus });
      expect(events.is).to.equal(Bundle.Events.is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };

      test('foo', false);
      test('runtime.electron/Bundle', false);

      test('runtime.electron/Bundle/', true);
      test('runtime.electron/Bundle/status:req', true);
    });
  });
});
