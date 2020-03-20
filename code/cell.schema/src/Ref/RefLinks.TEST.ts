import { t, fs, expect } from '../test';
import { RefLinks } from '.';

describe('RefLinks', () => {
  it('prefix', () => {
    expect(RefLinks.prefix).to.eql('ref');
  });

  describe('is', () => {
    it('refKey', () => {
      const test = (input: string | undefined, expected: boolean) => {
        const res = RefLinks.is.refKey(input);
        expect(res).to.eql(expected);
      };

      test(undefined, false);
      test('', false);
      test('  ', false);
      test('fs:func:wasm', false);

      test('  ref:ns:foo  ', true);
      test('ref:cell:foo!A1', true);
    });

    it('refValue', () => {
      const test = (input: string | undefined, expected: boolean) => {
        const res = RefLinks.is.refValue(input);
        expect(res).to.eql(expected);
      };

      test(undefined, false);
      test('', false);
      test('  ', false);
      test('fs:func:wasm', false);
      test('file:foo:abc', false);

      test('ns:foo', true);
      test('  ns:foo  ', true);
      test('cell:foo!A1', true);
      test('cell:foo!A', true);
      test('cell:foo!1', true);
    });
  });
});
