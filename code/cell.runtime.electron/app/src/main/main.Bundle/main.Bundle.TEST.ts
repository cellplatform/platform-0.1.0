import { expect, rx } from '../../test';
import { Bundle } from '.';

const bus = rx.bus();

describe('main.Bundle', () => {
  describe('Events', () => {
    it('is', () => {
      const events = Bundle.Events({ bus });

      const test = (type: string, expected: boolean) => {
        const event = { type, payload: {} };
        expect(events.is.base(event)).to.eql(expected);
      };

      test('foo', false);
      test('runtime.electron/Bundle', false);

      test('runtime.electron/Bundle/', true);
      test('runtime.electron/Bundle/status:req', true);
    });
  });
});
