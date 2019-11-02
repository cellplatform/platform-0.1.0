import { expect } from 'chai';
import { t } from '../common';
import { value } from '.';

type P = t.ICellProps & {
  style: { bold?: boolean; italic?: boolean };
  status: { error?: { message: string } };
  merge?: { colspan?: number; rowspan?: number };
};

describe('cell', () => {
  it('isEmptyCell', () => {
    const hash = '346854e8420ee165a8146d0c385eb148f172c7cabb3a3b76d542252890cd0cf9';
    const test = (input: t.ICellData<any> | undefined, expected: boolean) => {
      expect(value.isEmptyCell(input)).to.eql(expected);
    };
    test(undefined, true);
    test({ value: '' }, true);
    test({ value: undefined }, true);
    test({ value: '', hash }, true);
    test({ value: undefined, hash: 'abc123z' }, true);
    test({ value: undefined, props: {} }, true); // NB: props object is empty.
    test({ value: '', props: {} }, true);
    test({ value: '', props: { status: {} } }, true);
    test({ value: '', props: { status: {}, style: {}, view: {}, merge: {} } }, true);
    test({ value: undefined, props: { status: {}, style: {}, view: {}, merge: {} } }, true);
    test({ props: { status: {}, style: {}, view: {}, merge: {} } }, true);
    test({ value: undefined, props: { value: undefined } }, true);
    test({ links: {} }, true);

    test({ value: ' ' }, false);
    test({ value: ' ', hash }, false);
    test({ value: 0 }, false);
    test({ value: null }, false);
    test({ value: {} }, false);
    test({ value: { foo: 123 } }, false);
    test({ value: true }, false);
    test({ value: false }, false);
    test({ value: undefined, props: { value: 456 } }, false); // NB: has props, therefore not empty.
    test({ links: { foo: 'ns:abc' } }, false);
  });

  it('isEmptyCellValue', () => {
    const test = (input: t.CellValue | undefined, expected: boolean) => {
      expect(value.isEmptyCellValue(input)).to.eql(expected);
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
    const test = (input: {} | undefined, expected: boolean) => {
      expect(value.isEmptyCellProps(input)).to.eql(expected);
    };
    test(undefined, true);
    test({}, true);
    test({ style: {} }, true);
    test({ style: {}, merge: {} }, true);
    test({ style: {}, merge: {}, view: {} }, true);
    test({ status: {} }, true);
    test({ value: undefined }, true);

    test({ style: { bold: true } }, false);
    test({ style: { bold: true }, merge: {} }, false);
    test({ view: { type: 'DEFAULT' } }, false);
    test({ status: { error: { message: 'Fail', type: 'UNKNOWN' } } }, false);
  });

  it('isEmptyCellLinks', () => {
    const test = (input: {} | undefined, expected: boolean) => {
      expect(value.isEmptyCellLinks(input)).to.eql(expected);
    };
    test(undefined, true);
    test({}, true);
    test({ foo: 'ns:abc' }, false);
  });

  describe('squash', () => {
    it('squash.props', () => {
      const test = (props?: Partial<P>, expected?: any) => {
        const res = value.squash.props(props);
        expect(res).to.eql(expected);
      };
      test();
      test({});
      test({ style: {} });
      test({ merge: {} });
      test({ style: {}, merge: {} });
      test({ style: { bold: true }, merge: {} }, { style: { bold: true } });
    });

    it('squash.cell', () => {
      const test = (cell?: t.ICellData, expected?: any, empty?: any) => {
        const res = value.squash.cell(cell, { empty });
        expect(res).to.eql(expected);
      };
      test();
      test({});
      test({ value: undefined });
      test({ value: null }, { value: null });
      test({ value: 123 }, { value: 123 });
      test({ value: 123, links: {} }, { value: 123 });
      test({ value: 0, links: {} }, { value: 0 });
      test({ hash: 'cell:abc!A1' }, { hash: 'cell:abc!A1' });
      test(
        { value: undefined, error: { type: 'UNKNOWN', message: 'Fail' } },
        { error: { type: 'UNKNOWN', message: 'Fail' } },
      );

      test({ value: undefined }, {}, {}); // NB: Squash to {} not undefined.
    });
  });

  describe('cellHash', () => {
    it('throw if URI not passed', () => {
      const fn = () => value.cellHash('A1', { value: 123 });
      expect(fn).to.throw(/Hashing requires a valid cell URI/);
    });

    it('hashes a cell', () => {
      let index = -1;
      const test = (input: {} | undefined, expected: string) => {
        const hash = value.cellHash('cell:abcd!A1', input);

        index++;
        const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

        expect(hash.startsWith('sha256-')).to.eql(true);
        expect(hash.endsWith(expected)).to.eql(true, err);
      };

      test(undefined, '74cbb77a4112ea85f3a3');
      test({ value: undefined }, '74cbb77a4112ea85f3a3');
      test({ value: null }, '74cbb77a4112ea85f3a3');
      test({ value: 123 }, 'd53be0bdbce2a25b2a36');
      test({ value: 'hello' }, 'b3813001a7b30883363c');
      test({ value: 'hello', props: {} }, 'b3813001a7b30883363c');
      test({ value: 'hello', props: { style: { bold: true } } }, 'fab8857189a788c7af8e');
      test({ links: { main: 'ns:abc' } }, '921f26767a2d39629');

      const error: t.IRefErrorCircular = { type: 'REF/circular', path: 'A1/A1', message: 'Fail' };
      test({ value: 'hello', error }, '92a8675656f6818ec330');
    });

    it('same hash for no param AND no cell-value', () => {
      const HASH = 'sha256-77f00fd1a859e597968d1987608778ac197505ea97d174cbb77a4112ea85f3a3';
      const test = (input?: t.ICellData) => {
        const hash = value.cellHash('cell:abcd!A1', input);
        expect(hash).to.eql(HASH);
      };
      test();
      test(undefined);
      test({ value: undefined });
    });

    it('returns same hash for equivalent props variants', () => {
      const HASH = 'sha256-4b3640ce563efa431406a23c8cb3683e9fe714349f07d5648106e98ac7d1f8e8';
      const test = (props?: {}) => {
        const hash = value.cellHash('cell:abcd:A1', { value: 123, props });
        // console.log('hash', hash);
        expect(hash).to.eql(HASH);
      };
      test();
      test({});
      test({ style: {} });
      test({ merge: {} });
      test({ style: {}, merge: {} });
    });
  });

  describe('cellDiff', () => {
    it('no difference', () => {
      const cell: t.ICellData<{}> = { value: 1, props: { style: { bold: true } } };
      const res = value.cellDiff(cell, cell);
      expect(res.left).to.eql(cell);
      expect(res.right).to.eql(cell);
      expect(res.isDifferent).to.eql(false);
      expect(res.list.length).to.eql(0);
    });

    it('is different', () => {
      const left: t.ICellData<{}> = { value: 1, props: { style: { bold: true } } };
      const right: t.ICellData<{}> = { value: 2, props: { style: { bold: false } } };
      const res = value.cellDiff(left, right);

      expect(res.isDifferent).to.eql(true);
      expect(res.list.length).to.eql(2);

      expect((res.list[0].path || []).join('.')).to.eql('value');
      expect((res.list[1].path || []).join('.')).to.eql('props.style.bold');
    });
  });

  describe('setCellProp', () => {
    const styleDefaults = {
      bold: false,
      italic: false,
      underline: false,
    };

    it('no change', () => {
      const res1 = value.setCellProp<P, 'style'>({
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      const res2 = value.setCellProp<P, 'style'>({
        defaults: styleDefaults,
        props: { style: { bold: true } },
        section: 'style',
        field: 'bold',
        value: true,
      });
      expect(res1).to.eql(undefined);
      expect(res2).to.eql({ style: { bold: true } });
    });

    it('from undefined props (generates new object)', () => {
      const res1 = value.setCellProp<P, 'style'>({
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: true,
      });
      const res2 = value.setCellProp<P, 'style'>({
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: false,
      });
      expect(res1).to.eql({ style: { bold: true } });
      expect(res2).to.eql(undefined); // NB: All default props shake out to be nothing (undefined).
    });

    it('deletes default property value (style)', () => {
      const res1 = value.setCellProp<P, 'style'>({
        props: { style: { bold: true, italic: false } },
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      const res2 = value.setCellProp<P, 'style'>({
        props: { style: { bold: true, italic: true } },
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      const res3 = value.setCellProp<P, 'style'>({
        defaults: styleDefaults,
        props: res2,
        section: 'style',
        field: 'italic',
        value: false,
      });

      const res4 = value.setCellProp<P, 'style'>({
        props: { style: { bold: true }, merge: { colspan: 2 } },
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      const res5 = value.setCellProp<P, 'status'>({
        props: { status: { error: { message: 'FAIL' } } },
        defaults: {},
        section: 'status',
        field: 'error',
        value: undefined,
      });

      expect(res1).to.eql(undefined); // NB: All default props shake out to be nothing (undefined).
      expect(res2).to.eql({ style: { italic: true } });
      expect(res3).to.eql(undefined); // NB: Italic flipped to default (false).
      expect(res4).to.eql({ merge: { colspan: 2 } });
      expect(res5).to.eql(undefined);
    });
  });

  describe('toggleCellProp', () => {
    const defaults = { bold: false, italic: false, underline: false };

    it('non-boolean values ignored', () => {
      const style = { bold: { msg: 'NEVER' } } as any;
      const props = { style };
      const res = value.toggleCellProp<P, 'style'>({
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

      const res1 = value.toggleCellProp<P, 'style'>({ defaults, section, field });
      const res2 = value.toggleCellProp<P, 'style'>({ defaults, props: res1, section, field });
      const res3 = value.toggleCellProp<P, 'style'>({ defaults, props: res2, section, field });
      const res4 = value.toggleCellProp<P, 'style'>({
        defaults,
        props: res3,
        section,
        field: 'italic',
      });
      const res5 = value.toggleCellProp<P, 'style'>({ defaults, props: res4, section, field });

      expect(res1).to.eql({ style: { bold: true } }); // Nothing => true (default)
      expect(res2).to.eql(undefined); // True to nothing
      expect(res3).to.eql({ style: { bold: true } }); // Nothing => true (default)
      expect(res4).to.eql({ style: { bold: true, italic: true } });
      expect(res5).to.eql({ style: { italic: true } });
    });
  });

  describe('cellPropValue', () => {
    const test = (cell?: t.ICellData<any>, expected?: t.CellValue) => {
      const res = value.cellPropValue(cell);
      expect(res).to.eql(expected);
    };

    it('undefined', () => {
      test();
      test(undefined, undefined);
      test({}, undefined);
      test({ value: 123 }, undefined);
      test({ props: {} }, undefined);
      test({ props: { style: { bold: true } } }, undefined);
      test({ props: { value: undefined } }, undefined);
    });

    it('value', () => {
      test({ props: { value: 123 } }, 123);
      test({ props: { value: {} } }, {});
      test({ props: { value: 'hello' } }, 'hello');
    });
  });
});
