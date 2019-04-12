import { expect } from 'chai';
import { Keyboard } from '.';
import * as t from './types';

describe('keyboard', () => {
  describe('(static) parse', () => {
    it('string', () => {
      const test = (pattern: string, expectedKeys: string[], expectedModifiers: string[] = []) => {
        const res = Keyboard.parse(pattern);
        expect(res.keys).to.eql(expectedKeys);
        expect(res.modifiers).to.eql(expectedModifiers);
      };
      test('', []);
      test('r', ['R']);
      test(' r ', ['R']);
      test('+r', ['R']);
      test('+r+', ['R']);
      test(' + r + ', ['R']);
      test('r+R+r', ['R']);
      test('cmd+l', ['L'], ['META']);
      test('MetA+l', ['L'], ['META']);
      test('ComMand+l', ['L'], ['META']);
      test('cmd+l+alt', ['L'], ['META', 'ALT']);
      test('cmd+ALT+Shift+l+aLt+P+ctrl+SHIFT', ['L', 'P'], ['META', 'ALT', 'SHIFT', 'CTRL']);
    });

    it('boolean', () => {
      const test = (pattern?: boolean) => {
        const res = Keyboard.parse(pattern);
        expect(res).to.eql({ keys: [], modifiers: [] });
      };
      test(true);
      test(false);
    });

    it('undefined', () => {
      const test = (pattern?: boolean) => {
        const res = Keyboard.parse(pattern);
        expect(res).to.eql({ keys: [], modifiers: [] });
      };
      test();
      test(undefined);
    });

    it('default value', () => {
      const test = (
        pattern: string | boolean | undefined,
        defaultValue: string | undefined,
        expectedKeys: string[],
        expectedModifiers: string[] = [],
      ) => {
        const res = Keyboard.parse(pattern, defaultValue);
        expect(res.keys).to.eql(expectedKeys);
        expect(res.modifiers).to.eql(expectedModifiers);
      };

      test(undefined, 'CMD+Z', ['Z'], ['META']);
      test('', 'CMD+Z', ['Z'], ['META']);
      test('  ', 'CMD+Z', ['Z'], ['META']);
      test(true, 'CMD+Z', ['Z'], ['META']);
      test(false, 'CMD+Z', [], []);
    });
  });

  describe('(static) includes', () => {
    const test = (
      pattern: t.IKeyPattern | string,
      event: Partial<t.IKeyMatchEventArgs>,
      expected: boolean,
    ) => {
      const res = Keyboard.matchEvent(pattern, event);
      expect(res).to.eql(expected);
    };

    it('from pattern object', () => {
      test(Keyboard.parse('r'), { key: 'r' }, true);
      test(Keyboard.parse('CMD+r'), { key: 'r', metaKey: true }, true);
      test(Keyboard.parse('CMD+r'), { key: 'R' }, false);
    });

    it('from pattern string', () => {
      test('r', { key: 'r' }, true);
      test('CMD+r', { key: 'r', metaKey: true }, true);
      test('CMD+r', { key: 'R', metaKey: true }, true);
      test('cmd+r', { key: 'R', metaKey: true }, true);
      test(
        'CMD+ALT+SHIFT+CTRL+R',
        { key: 'r', metaKey: true, ctrlKey: true, altKey: true, shiftKey: true },
        true,
      );

      test('CMD+r', { key: 'R' }, false);
      test('ALT+r', { key: 'R' }, false);
      test('SHIFT+r', { key: 'R' }, false);
      test('CTRL+r', { key: 'R' }, false);

      test('CMD+SHIFT+L', { key: 'L', metaKey: true, shiftKey: true }, true);
      test('CMD+SHIFT+L', { key: 'L', metaKey: true }, false);
      test('CMD+L', { key: 'L', metaKey: true, shiftKey: true }, false);
    });
  });
});
