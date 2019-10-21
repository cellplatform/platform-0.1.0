import { expect } from 'chai';

import { t } from '../common';
import * as util from './util.cell';

describe('util.cell', () => {
  describe('isChanged', () => {
    type F = util.CellChangeField | util.CellChangeField[] | undefined;

    const test = (
      left: t.IGridCellData | undefined,
      right: t.IGridCellData | undefined,
      field: F,
      expected: boolean,
    ) => {
      const res = util.isCellChanged(left, right, field);
      expect(res).to.eql(expected);
    };

    const testProps = (
      left: t.IGridCellProps,
      right: t.IGridCellProps,
      field: F,
      expected: boolean,
    ) => {
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

  // describe('cellDiff', () => {
  //   it('no difference', () => {
  //     const cell: t.ICellData<{}> = { value: 1, props: { style: { bold: true } } };
  //     const res = util.cellDiff(cell, cell);
  //     expect(res.left).to.eql(cell);
  //     expect(res.right).to.eql(cell);
  //     expect(res.isDifferent).to.eql(false);
  //     expect(res.list.length).to.eql(0);
  //   });

  //   it('is different', () => {
  //     const left: t.ICellData<{}> = { value: 1, props: { style: { bold: true } } };
  //     const right: t.ICellData<{}> = { value: 2, props: { style: { bold: false } } };
  //     const res = util.cellDiff(left, right);

  //     expect(res.isDifferent).to.eql(true);
  //     expect(res.list.length).to.eql(2);

  //     expect((res.list[0].path || []).join('.')).to.eql('value');
  //     expect((res.list[1].path || []).join('.')).to.eql('props.style.bold');
  //   });
  // });

  describe('toCellProps', () => {
    it('default props (empty {})', () => {
      const test = (input?: any) => {
        const res = util.toCellProps(input);
        expect(res.value).to.eql(undefined);
        expect(res.merge).to.eql({});
        expect(res.style).to.eql({});
        expect(res.view).to.eql({});
        expect(res.status).to.eql({});
      };
      test();
      test(null);
      test({});
    });

    it('props', () => {
      const A2: t.IGridCellData = {
        value: 'Hello',
        props: {
          value: 456, // NB: Display value.
          style: { bold: true },
          merge: { colspan: 3 },
          view: { type: 'SHOP' },
          status: {
            error: { message: 'Fail', type: 'UNKNOWN' },
          },
        },
      };
      const props = util.toCellProps(A2.props);
      expect(props.style.bold).to.eql(true);
      expect(props.merge.colspan).to.eql(3);
      expect(props.value).to.eql(456);
      expect(props.view.type).to.eql('SHOP');
      expect(props.status.error).to.eql({ message: 'Fail', type: 'UNKNOWN' });
    });
  });

  describe('setCellProp', () => {
    const styleDefaults: t.IGridCellPropsStyleAll = {
      bold: false,
      italic: false,
      underline: false,
    };

    it('no change', () => {
      const res1 = util.setCellProp<'style'>({
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      const res2 = util.setCellProp<'style'>({
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
      const res1 = util.setCellProp<'style'>({
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: true,
      });
      const res2 = util.setCellProp<'style'>({
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: false,
      });
      expect(res1).to.eql({ style: { bold: true } });
      expect(res2).to.eql(undefined); // NB: All default props shake out to be nothing (undefined).
    });

    it('deletes default property value (style)', () => {
      const res1 = util.setCellProp<'style'>({
        props: { style: { bold: true, italic: false } },
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      const res2 = util.setCellProp<'style'>({
        props: { style: { bold: true, italic: true } },
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      const res3 = util.setCellProp<'style'>({
        defaults: styleDefaults,
        props: res2,
        section: 'style',
        field: 'italic',
        value: false,
      });

      const res4 = util.setCellProp<'style'>({
        props: { style: { bold: true }, merge: { colspan: 2 } },
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: false,
      });

      const res5 = util.setCellProp<'status'>({
        props: { status: { error: { message: 'FAIL', type: 'UNKNOWN' } } },
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

  describe('setCellError', () => {
    it('no error and no props', () => {
      const res = util.setCellError({});
      expect(res).to.eql(undefined);
    });

    it('assigns an error (existing props)', () => {
      const error: t.IGridCellPropsError = { type: 'FAIL', message: 'Derp' };
      const res1 = util.setCellError({ error });
      const res2 = util.setCellError({ props: {}, error });
      const res3 = util.setCellError({ props: { status: {} }, error });
      const res4 = util.setCellError({
        props: { status: { error: { type: 'TMP', message: 'Foo' } } },
        error,
      });
      const props = { status: { error } };
      expect(res1).to.eql(props);
      expect(res2).to.eql(props);
      expect(res3).to.eql(props);
      expect(res4).to.eql(props);
    });

    it('removes error', () => {
      const res1 = util.setCellError({
        error: undefined,
        props: {
          status: { error: { type: 'TMP', message: 'Foo' } },
        },
      });
      const res2 = util.setCellError({
        error: undefined,
        props: {
          style: { bold: true },
          status: { error: { type: 'TMP', message: 'Foo' } },
        },
      });
      expect(res1).to.eql(undefined);
      expect(res2).to.eql({ style: { bold: true } });
    });
  });

  describe('toggleCellProp', () => {
    const defaults: t.IGridCellPropsStyleAll = { bold: false, italic: false, underline: false };

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
});
