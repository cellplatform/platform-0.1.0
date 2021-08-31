import { expect, rx } from '../test';
import { Compiler } from '.';

const bus = rx.bus();

describe('Compiler', () => {
  describe('Events', () => {
    const is = Compiler.Events.is;

    it('is (static/instance)', () => {
      const events = Compiler.Events({ bus });
      expect(events.is).to.equal(is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('cell.compiler/', true);
    });
  });
});
