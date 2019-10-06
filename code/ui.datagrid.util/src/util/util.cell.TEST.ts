import { expect } from 'chai';

import { t } from '../common';
import * as util from './util.cell';

describe('util.cell', () => {
  it('isEmptyCell', () => {
    const hash = '346854e8420ee165a8146d0c385eb148f172c7cabb3a3b76d542252890cd0cf9';
    const test = (input: t.IGridCell | undefined, expected: boolean) => {
      expect(util.isEmptyCell(input)).to.eql(expected);
    };
    test(undefined, true);
    test({ value: '' }, true);
    test({ value: undefined }, true);
    test({ value: '', hash }, true);
    test({ value: undefined, hash: 'abc123z' }, true);
    test({ value: undefined, props: {} }, true); // NB: props object is empty.
    test({ value: '', props: {} }, true);

    test({ value: ' ' }, false);
    test({ value: ' ', hash }, false);
    test({ value: 0 }, false);
    test({ value: null }, false);
    test({ value: {} }, false);
    test({ value: { foo: 123 } }, false);
    test({ value: true }, false);
    test({ value: false }, false);
    test({ value: undefined, props: { value: 456 } }, false); // NB: has props, therefore not empty.
  });

  it('isEmptyCellValue', () => {
    const test = (input: t.CellValue | undefined, expected: boolean) => {
      expect(util.isEmptyCellValue(input)).to.eql(expected);
    };
    test(undefined, true);
    test('', true);

    test(' ', false);
    test(null, false);
    test(0, false);
    test(123, false);
    test({}, false);
    test([], false);
    test(true, false);
    test(false, false);
  });

  it('isEmptyCellProps', () => {
    const test = (input: t.ICellProps | undefined, expected: boolean) => {
      expect(util.isEmptyCellProps(input)).to.eql(expected);
    };
    test(undefined, true);
    test({}, true);
    test({ style: {} }, true);
    test({ style: {}, merge: {} }, true);
    test({ style: {}, merge: {}, view: {} }, true);

    test({ style: { bold: true } }, false);
    test({ style: { bold: true }, merge: {} }, false);
    test({ view: { type: 'DEFAULT' } }, false);
  });

  describe('isChanged', () => {
    type F = util.CellChangeField | util.CellChangeField[] | undefined;

    const test = (
      left: t.IGridCell | undefined,
      right: t.IGridCell | undefined,
      field: F,
      expected: boolean,
    ) => {
      const res = util.isCellChanged(left, right, field);
      expect(res).to.eql(expected);
    };

    const testProps = (left: t.ICellProps, right: t.ICellProps, field: F, expected: boolean) => {
      test({ value: -1, props: left }, { value: -1, props: right }, field, expected);
    };

    it('undefined (no change)', () => {
      test(undefined, undefined, undefined, false);
      test(undefined, undefined, 'PROPS', false);
      test(undefined, undefined, 'VALUE', false);
      test(undefined, undefined, 'merge', false);
      test(undefined, undefined, 'style', false);

      test(undefined, undefined, [], false);
      test(undefined, undefined, ['style', 'VALUE'], false);
      test(undefined, undefined, ['PROPS', 'VALUE'], false);
    });

    it('isChanged: props', () => {
      testProps({ style: { bold: true } }, { style: { bold: true } }, undefined, false);
      testProps({ style: { bold: true } }, { style: { bold: true } }, 'PROPS', false);
      testProps({ style: { bold: true } }, { style: { bold: false } }, 'PROPS', true);
      testProps({ style: { bold: true } }, { style: { bold: false } }, undefined, true);
      testProps(
        { style: { bold: true }, merge: { rowspan: 2 } },
        { style: { bold: true }, merge: { rowspan: 3 } },
        'PROPS',
        true,
      );
      testProps({ style: { bold: true } }, { style: { bold: false } }, 'merge', false); // Looking at merge.
      testProps({ style: { bold: true } }, { style: { bold: false } }, ['VALUE', 'style'], true);
      testProps({ style: { bold: true } }, { style: { bold: false } }, ['merge', 'style'], true);
    });

    it('isChanged: value', () => {
      test({ value: 1 }, { value: 1 }, undefined, false);
      test({ value: 1 }, { value: 1 }, 'VALUE', false);
      test({ value: 1 }, { value: 2 }, 'PROPS', false);

      test({ value: 1 }, { value: 2 }, undefined, true);
      test({ value: 1 }, { value: 2 }, 'VALUE', true);

      test({ value: 1 }, { value: 2 }, [], false);
      test({ value: 1 }, { value: 2 }, ['VALUE', 'style'], true);
      test({ value: 1 }, { value: 2 }, ['PROPS'], false);
    });
  });

  describe('cellDiff', () => {
    it('no difference', () => {
      const cell: t.IGridCell = { value: 1, props: { style: { bold: true } } };
      const res = util.cellDiff(cell, cell);
      expect(res.left).to.eql(cell);
      expect(res.right).to.eql(cell);
      expect(res.isDifferent).to.eql(false);
      expect(res.list.length).to.eql(0);
    });

    it('is different', () => {
      const left: t.IGridCell = { value: 1, props: { style: { bold: true } } };
      const right: t.IGridCell = { value: 2, props: { style: { bold: false } } };
      const res = util.cellDiff(left, right);

      expect(res.isDifferent).to.eql(true);
      expect(res.list.length).to.eql(2);

      expect((res.list[0].path || []).join('.')).to.eql('value');
      expect((res.list[1].path || []).join('.')).to.eql('props.style.bold');
    });
  });

  describe('toCellProps', () => {
    it('has default props (empty {})', () => {
      const test = (input?: any) => {
        const res = util.toCellProps(input);
        expect(res.value).to.eql(undefined);
        expect(res.merge).to.eql({});
        expect(res.style).to.eql({});
        expect(res.view).to.eql({});
      };
      test();
      test(null);
      test({});
    });

    it('props', () => {
      const A2: t.IGridCell = {
        value: 'Hello',
        props: {
          value: 456, // NB: Display value.
          style: { bold: true },
          merge: { colspan: 3 },
          view: { type: 'SHOP' },
        },
      };
      const props = util.toCellProps(A2.props);
      expect(props.style.bold).to.eql(true);
      expect(props.merge.colspan).to.eql(3);
      expect(props.value).to.eql(456);
      expect(props.view.type).to.eql('SHOP');
    });
  });

  describe('setCellProp', () => {
    const defaults: t.ICellPropsStyleAll = { bold: false, italic: false, underline: false };

    it('no change', () => {
      const res1 = util.setCellProp<'style'>({
        defaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      const res2 = util.setCellProp<'style'>({
        defaults,
        props: { style: { bold: true } },
        section: 'style',
        field: 'bold',
        value: true,
      });
      expect(res1).to.eql(undefined);
      expect(res2).to.eql({ style: { bold: true } });
    });

    it('from undefined props (generates new object)', () => {
      const res1 = util.setCellProp<'style'>({
        defaults,
        section: 'style',
        field: 'bold',
        value: true,
      });
      const res2 = util.setCellProp<'style'>({
        defaults,
        section: 'style',
        field: 'bold',
        value: false,
      });
      expect(res1).to.eql({ style: { bold: true } });
      expect(res2).to.eql(undefined); // NB: All default props shake out to be nothing (undefined).
    });

    it('deletes default property value', () => {
      const res1 = util.setCellProp<'style'>({
        props: { style: { bold: true, italic: false } },
        defaults,
        section: 'style',
        field: 'bold',
        value: false,
      });
      const res2 = util.setCellProp<'style'>({
        props: { style: { bold: true, italic: true } },
        defaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      const res3 = util.setCellProp<'style'>({
        defaults,
        props: res2,
        section: 'style',
        field: 'italic',
        value: false,
      });

      const res4 = util.setCellProp<'style'>({
        props: { style: { bold: true }, merge: { colspan: 2 } },
        defaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      expect(res1).to.eql(undefined); // NB: All default props shake out to be nothing (undefined).
      expect(res2).to.eql({ style: { italic: true } });
      expect(res3).to.eql(undefined); // NB: Italic flipped to default (false).
      expect(res4).to.eql({ merge: { colspan: 2 } });
    });
  });

  describe('toggleCellProp', () => {
    const defaults: t.ICellPropsStyleAll = { bold: false, italic: false, underline: false };

    it('non-boolean values ignored', () => {
      const style = { bold: { msg: 'NEVER' } } as any;
      const props = { style };
      const res = util.toggleCellProp<'style'>({
        defaults,
        section: 'style',
        field: 'bold',
        props,
      });
      expect(res).to.eql(props); // Non boolean field value ignored.
    });

    it('toggle sequence', () => {
      const section = 'style';
      const field = 'bold';

      const res1 = util.toggleCellProp<'style'>({ defaults, section, field });
      const res2 = util.toggleCellProp<'style'>({ defaults, props: res1, section, field });
      const res3 = util.toggleCellProp<'style'>({ defaults, props: res2, section, field });
      const res4 = util.toggleCellProp<'style'>({
        defaults,
        props: res3,
        section,
        field: 'italic',
      });
      const res5 = util.toggleCellProp<'style'>({ defaults, props: res4, section, field });

      expect(res1).to.eql({ style: { bold: true } }); // Nothing => true (default)
      expect(res2).to.eql(undefined); // True to nothing
      expect(res3).to.eql({ style: { bold: true } }); // Nothing => true (default)
      expect(res4).to.eql({ style: { bold: true, italic: true } });
      expect(res5).to.eql({ style: { italic: true } });
    });
  });

  describe('cellHash', () => {
    it('hashes a cell', () => {
      const test = (input: t.IGridCell | undefined, expected: string) => {
        const hash = util.cellHash('A1', input);
        expect(hash).to.eql(expected);
      };

      test(undefined, '7b7e3362bbbcc8baf036f1f1ded64fa23836e4b389a23c00d33a7473cf8dda72');
      test(
        { value: undefined },
        '7b7e3362bbbcc8baf036f1f1ded64fa23836e4b389a23c00d33a7473cf8dda72',
      );
      test({ value: null }, 'd9533a1f95b3a5ea64315d235161edff661ffcf8bc5b92ace02e9b19ba505b3a');
      test({ value: 123 }, '6be869f659d8562edd4491ef804e0b90d6e56a37349614eaee7facb2b882d949');
      test({ value: '' }, '6ffb4dfc7fee470f754150ee33c356b65de71f062ab12b0cc1a8cf47ac4bc0e5');
      test({ value: 'hello' }, '7435a542af4a3f7d425c18a87693b04100845dbe86fb7c896d364bd8a27f4dd2');
      test(
        { value: 'hello', props: {} },
        '7435a542af4a3f7d425c18a87693b04100845dbe86fb7c896d364bd8a27f4dd2',
      );
      test(
        { value: 'hello', props: { style: { bold: true } } },
        '577bd1b1b605485a09fc953c1658d6319930433c0f4ab677aafd33db96ab6aa9',
      );
    });

    it('same hash for no param AND no cell-value', () => {
      const HASH = '7b7e3362bbbcc8baf036f1f1ded64fa23836e4b389a23c00d33a7473cf8dda72';
      const test = (input?: t.IGridCell) => {
        const res = util.cellHash('A1', input);
        expect(res).to.eql(HASH);
      };
      test();
      test(undefined);
      test({ value: undefined });
    });

    it('returns same hash for equivalent props variants', () => {
      const HASH = '6be869f659d8562edd4491ef804e0b90d6e56a37349614eaee7facb2b882d949';
      const test = (props?: t.ICellProps) => {
        const res = util.cellHash('A1', { value: 123, props });
        expect(res).to.eql(HASH);
      };
      test();
      test({});
      test({ style: {} });
      test({ merge: {} });
      test({ style: {}, merge: {} });
    });
  });
});
