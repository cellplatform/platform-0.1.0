import { expect, rx } from '../../test';
import { Name } from '.';

const bus = rx.bus();

describe('Name', () => {
  describe('Events', () => {
    const is = Name.Events.is;

    it('is (static/instance)', () => {
      const events = Name.Events({ bus });
      expect(events.is).to.equal(is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('namespace/', true);
    });
  });
});
