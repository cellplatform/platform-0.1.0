import { expect } from 'chai';
import { t } from '../common';
import * as util from './util.diff';

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
