import { expect, rx } from '../../test';
import { Bundle } from '.';

const bus = rx.bus();

describe('main.Bundle', () => {
  describe('Events', () => {
    const events = Bundle.Events({ bus });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(events.is.base({ type, payload: {} })).to.eql(expected);
      };

      test('foo', false);
      test('runtime.electron/Bundle', false);

      test('runtime.electron/Bundle/', true);
      test('runtime.electron/Bundle/status:req', true);
    });
  });
});
