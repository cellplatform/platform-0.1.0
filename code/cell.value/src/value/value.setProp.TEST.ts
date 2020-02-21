import { expect } from '../test';
import { t } from '../common';
import { value } from '.';

type P = t.ICellProps & {
  style: { bold?: boolean; italic?: boolean; underline?: boolean };
  status: { error?: { message: string } };
  merge: { colspan?: number; rowspan?: number };
};

type R = t.IRowProps & { grid: { height?: number } };
type C = t.IColumnProps & { grid: { width?: number } };

const styleDefaults: P['style'] = {
  bold: false,
  italic: false,
  underline: false,
};

describe('setProp', () => {
  it('no change', () => {
    const res1 = value.setProp<P, 'style'>({
      defaults: styleDefaults,
      section: 'style',
      field: 'bold',
      value: false,
      isEmpty: value.isEmptyCellProps,
    });

    const res2 = value.setProp<P, 'style'>({
      defaults: styleDefaults,
      props: { style: { bold: true } },
      section: 'style',
      field: 'bold',
      value: true,
      isEmpty: value.isEmptyCellProps,
    });
    expect(res1).to.eql(undefined);
    expect(res2).to.eql({ style: { bold: true } });
  });

  it('from undefined props (generates new object)', () => {
    const res1 = value.setProp<P, 'style'>({
      defaults: styleDefaults,
      section: 'style',
      field: 'bold',
      value: true,
      isEmpty: value.isEmptyCellProps,
    });
    const res2 = value.setProp<P, 'style'>({
      defaults: styleDefaults,
      section: 'style',
      field: 'bold',
      value: false,
      isEmpty: value.isEmptyCellProps,
    });
    expect(res1).to.eql({ style: { bold: true } });
    expect(res2).to.eql(undefined); // NB: All default props shake out to be nothing (undefined).
  });

  it('deletes default property value (style)', () => {
    const res1 = value.setProp<P, 'style'>({
      props: { style: { bold: true, italic: false } },
      defaults: styleDefaults,
      section: 'style',
      field: 'bold',
      value: false,
      isEmpty: value.isEmptyCellProps,
    });

    const res2 = value.setProp<P, 'style'>({
      props: { style: { bold: true, italic: true } },
      defaults: styleDefaults,
      section: 'style',
      field: 'bold',
      value: false,
      isEmpty: value.isEmptyCellProps,
    });

    const res3 = value.setProp<P, 'style'>({
      defaults: styleDefaults,
      props: res2,
      section: 'style',
      field: 'italic',
      value: false,
      isEmpty: value.isEmptyCellProps,
    });

    const res4 = value.setProp<P, 'style'>({
      props: { style: { bold: true }, merge: { colspan: 2 } },
      defaults: styleDefaults,
      section: 'style',
      field: 'bold',
      value: false,
      isEmpty: value.isEmptyCellProps,
    });

    const res5 = value.setProp<P, 'status'>({
      props: { status: { error: { message: 'FAIL' } } },
      defaults: {},
      section: 'status',
      field: 'error',
      value: undefined,
      isEmpty: value.isEmptyCellProps,
    });

    expect(res1).to.eql(undefined); // NB: All default props shake out to be nothing (undefined).
    expect(res2).to.eql({ style: { italic: true } });
    expect(res3).to.eql(undefined); // NB: Italic flipped to default (false).
    expect(res4).to.eql({ merge: { colspan: 2 } });
    expect(res5).to.eql(undefined);
  });
});

describe('setProp on type: cell/row/column', () => {
  it('setCellProp', () => {
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

  it('setColumnProp', () => {
    const res1 = value.setColumnProp<C, 'grid'>({
      defaults: { width: 120 },
      section: 'grid',
      field: 'width',
      value: 120,
    });
    const res2 = value.setColumnProp<C, 'grid'>({
      defaults: { width: 120 },
      props: { grid: { width: 120 } },
      section: 'grid',
      field: 'width',
      value: 50,
    });
    expect(res1).to.eql(undefined);
    expect(res2).to.eql({ grid: { width: 50 } });
  });

  it('setRowProp', () => {
    const res1 = value.setRowProp<R, 'grid'>({
      defaults: { height: 25 },
      section: 'grid',
      field: 'height',
      value: 25,
    });
    const res2 = value.setRowProp<R, 'grid'>({
      defaults: { height: 25 },
      props: { grid: { height: 25 } },
      section: 'grid',
      field: 'height',
      value: 80,
    });
    expect(res1).to.eql(undefined);
    expect(res2).to.eql({ grid: { height: 80 } });
  });
});

