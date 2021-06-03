import { expect, rx } from '../../test';
import { Name } from '.';

const bus = rx.bus();

describe('Name', () => {
  describe('Events', () => {
    it('is', () => {
      const events = Name.Events({ bus });

      const test = (type: string, expected: boolean) => {
        const event = { type, payload: {} };
        expect(events.is.base(event)).to.eql(expected);
      };

      test('foo', false);
      test('namespace/', true);
    });
  });
});
