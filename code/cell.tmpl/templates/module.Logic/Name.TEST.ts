import { expect, rx } from '../../test';
import { Name } from '.';

const bus = rx.bus();

describe('Name', () => {
  describe('Events', () => {
    const events = Name.Events({ bus });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(events.is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('namespace/', true);
    });
  });
});
