import { expect } from '../test';
import { t } from '../common';
import { value } from '.';

type P = t.ICellProps & {
  style: { bold?: boolean; italic?: boolean; underline?: boolean };
  status: { error?: { message: string } };
  merge?: { colspan?: number; rowspan?: number };
};

const styleDefaults: P['style'] = {
  bold: false,
  italic: false,
  underline: false,
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

  describe('cellData', () => {
    it('getValue', () => {
      const test = (cell?: t.ICellData<any>, expected?: t.CellValue) => {
        const res = value.cellData(cell).getValue();
        expect(res).to.eql(expected);
      };
      test();
      test(undefined, undefined);
      test({}, undefined);
      test({ value: 123 }, undefined);
      test({ props: {} }, undefined);
      test({ props: { style: { bold: true } } }, undefined);
      test({ props: { value: undefined } }, undefined);

      test({ props: { value: 123 } }, 123);
      test({ props: { value: {} } }, {});
      test({ props: { value: 'hello' } }, 'hello');
    });

    it('setValue', () => {
      const test = (cell?: t.ICellData<any>, to?: t.CellValue) => {
        const data = value.cellData(cell);
        const res = data.setValue(to);
        expect(res ? res.value : undefined).to.eql(to);
        if (cell) {
          expect(res).to.not.equal(cell); // NB: Different instance.
        }
      };
      test();
      test({}, 'hello');
      test({ value: 123 }, { foo: 456 });
    });

    it('setProp', () => {
      const res1 = value.cellData<P>().setProp<'style'>({
        defaults: styleDefaults,
        section: 'style',
        field: 'bold',
        value: true,
      });

      const res2 = value
        .cellData<P>({ value: '123', props: { style: { underline: true } } })
        .setProp<'style'>({
          defaults: styleDefaults,
          section: 'style',
          field: 'bold',
          value: true,
        });

      const res3 = value
        .cellData<P>({ props: { style: { bold: true } } })
        .setProp<'style'>({
          defaults: styleDefaults,
          section: 'style',
          field: 'bold',
          value: false,
        });

      const res4 = value
        .cellData<P>({ value: 123, props: { style: { bold: true } } })
        .setProp<'style'>({
          defaults: styleDefaults,
          section: 'style',
          field: 'bold',
          value: false,
        });

      expect(res1).to.eql({ props: { style: { bold: true } } });
      expect(res2).to.eql({ value: '123', props: { style: { underline: true, bold: true } } });
      expect(res3).to.eql(undefined);
      expect(res4).to.eql({ value: 123 });
    });

    it('setLink', () => {
      const test = (
        cell: t.ICellData<any> | undefined,
        key: string,
        uri?: string,
        expected?: any,
      ) => {
        const data = value.cellData(cell);
        const res = data.setLink(key, uri);
        expect(res).to.eql(expected);
      };
      test(undefined, 'foo', undefined, undefined);
      test({}, 'foo', 'ns:abc', { links: { foo: 'ns:abc' } });

      test({ links: {} }, 'foo', 'ns:abc', { links: { foo: 'ns:abc' } });
      test({ links: {} }, 'foo', '  ns:abc    ', { links: { foo: 'ns:abc' } });

      // Changed
      test({ links: { foo: 'ns:foo' } }, 'foo', 'ns:abc', { links: { foo: 'ns:abc' } });
      test({ links: { foo: 'ns:abc', bar: 'ns:yo' } }, 'foo', 'ns:def', {
        links: { foo: 'ns:def', bar: 'ns:yo' },
      });

      // Remove.
      test({ links: { foo: 'ns:abc' } }, 'foo', undefined, undefined);
      test({ links: { foo: 'ns:abc' } }, 'foo', '', undefined);
      test({ links: { foo: 'ns:abc' } }, 'foo', '  ', undefined);
      test({ value: 123, links: { foo: 'ns:abc' } }, 'foo', undefined, { value: 123 });
    });

    it('mergeLinks', () => {
      const test = (
        cell: t.ICellData<any> | undefined,
        links?: { [key: string]: string | undefined },
        expected?: any,
      ) => {
        const data = value.cellData(cell);
        const res = data.mergeLinks(links);
        expect(res).to.eql(expected);
      };
      test(undefined, {}, undefined);
      test({}, { foo: 'ns:foo' }, { links: { foo: 'ns:foo' } });
      test({}, { foo: 'ns:foo', bar: 'ns:bar' }, { links: { foo: 'ns:foo', bar: 'ns:bar' } });
      test({ links: {} }, { foo: 'ns:abc' }, { links: { foo: 'ns:abc' } });
      test({ links: {} }, { foo: '  ns:abc    ' }, { links: { foo: 'ns:abc' } });

      test(
        { links: { foo: 'ns:abc', bar: 'ns:yo' } },
        { foo: 'ns:def' },
        {
          links: { foo: 'ns:def', bar: 'ns:yo' },
        },
      );

      // Change.
      test({ links: { foo: 'ns:foo' } }, { foo: 'ns:bar' }, { links: { foo: 'ns:bar' } });

      // Remove.
      test({ links: { foo: 'ns:abc' } }, { foo: undefined }, undefined);
      test({ value: 123, links: { foo: 'ns:abc' } }, { foo: undefined }, { value: 123 });

      test(
        { links: { foo: 'ns:foo-1', bar: 'ns:bar' } },
        { foo: 'ns:foo-2', bar: undefined },
        { links: { foo: 'ns:foo-2' } },
      );

      // Clear all.
      test(
        { links: { foo: 'ns:foo', bar: 'ns:bar' } },
        { foo: undefined, bar: undefined },
        undefined,
      );
    });

    it('mergeLinks: delete undefined', () => {
      const before = {
        value: '=A2',
        props: undefined,
        links: { foo: 'ns:foo', bar: 'ns:bar', baz: 'data:random' },
      };

      const links1 = before.links || {};
      expect(links1.foo).to.eql('ns:foo');
      expect(links1.bar).to.eql('ns:bar');
      expect(links1.baz).to.eql('data:random'); // Unchanged.

      const after = value.cellData(before).mergeLinks({
        foo: 'ns:foobar', // Changed.
        bar: undefined, //   Removed.
        zoo: 'ns:zoo', //    Added.
      }) as t.ICellData;

      const links2 = after.links || {};

      expect(after.value).to.eql('=A2');

      expect(links2.foo).to.eql('ns:foobar'); //    Changed.
      expect(links2.bar).to.eql(undefined); //      Removed.
      expect(links2.baz).to.eql('data:random'); //  Unchanged.
      expect(links2.zoo).to.eql('ns:zoo'); //       Added.
    });
  });
});
