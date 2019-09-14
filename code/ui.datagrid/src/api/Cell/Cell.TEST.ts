import '../../test/dom';
import { expect } from 'chai';
import { Cell } from '.';
import { t } from '../../common';

describe('Cell', () => {
  describe('static', () => {
    it('converts row/column to key', () => {
      expect(Cell.toKey({ row: 0, column: 0 })).to.eql('A1');
      expect(Cell.toKey({ row: 4, column: 1 })).to.eql('B5');
    });

    it('isEmpty', () => {
      const test = (input: t.IGridCell | undefined, expected: boolean) => {
        expect(Cell.isEmpty(input)).to.eql(expected);
      };
      test(undefined, true);
      test({ value: '' }, true);
      test({ value: undefined }, true);
      test({ value: undefined, props: {} }, true); // NB: props object is empty.
      test({ value: '', props: {} }, true);

      test({ value: ' ' }, false);
      test({ value: 0 }, false);
      test({ value: null }, false);
      test({ value: {} }, false);
      test({ value: { foo: 123 } }, false);
      test({ value: true }, false);
      test({ value: false }, false);
      test({ value: undefined, props: { foo: 123 } }, false); // NB: has props, not empty.
    });
  });
});
