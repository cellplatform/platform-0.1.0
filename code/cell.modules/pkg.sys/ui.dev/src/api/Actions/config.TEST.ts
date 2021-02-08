import { expect, t } from '../../test';
import { Select } from '.';

describe('Actions/config', () => {
  describe('Select', () => {
    it('toOption', () => {
      const test = (
        input: t.DevActionSelectItemInput | undefined,
        expected: t.DevActionSelectItem,
      ) => {
        const res = Select.toOption(input);
        expect(res).to.eql(expected);
      };

      test(1, { label: '1', value: 1 });
      test('one', { label: 'one', value: 'one' });
      test(true, { label: 'true', value: true });
      test(false, { label: 'false', value: false });
      test(' ', { label: 'Unnamed', value: ' ' });

      const obj = { label: ' foo ', value: { msg: 'hello' } };
      test(obj, obj);
    });

    it('assignInitial', () => {
      const test = (item: t.DevActionItem, expected: t.DevActionSelectItemInput[]) => {
        const res = Select.assignInitial(item) as t.DevActionSelect;
        expect(res).to.equal(item);
        expect(res.current).to.eql(expected);
      };

      test(Select.default(), []);
      test(Select.default({ initial: 1 }), [{ label: '1', value: 1 }]);

      test(Select.default({ initial: [1, 2] }), [{ label: '1', value: 1 }]); // NB: not "multi".
      test(Select.default({ initial: [1, 2], multi: true }), [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
      ]);

      test(Select.default({ initial: { label: 'one', value: 1 } }), [{ label: 'one', value: 1 }]);
      test(
        Select.default({
          initial: [
            { label: 'one', value: 1 },
            { label: 'two', value: 2 },
          ],
        }),
        [{ label: 'one', value: 1 }], // NB: not "multi".
      );
      test(
        Select.default({
          multi: true,
          initial: [
            { label: 'one', value: 1 },
            { label: 'two', value: 2 },
          ],
        }),
        [
          { label: 'one', value: 1 },
          { label: 'two', value: 2 },
        ],
      );
    });
  });
});
