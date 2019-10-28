import { expect } from 'chai';
import { cell } from '..';

describe('Context', () => {
  it('has display name', () => {
    expect(cell.Context.displayName).to.eql('@platform/cell/Context');
  });

  it('creates provider', () => {
    const ctx: cell.ICellContext = { cell: { value: '=A2' } };
    const res1 = cell.createProvider({ ctx });
    const res2 = cell.createProvider({ ctx, props: { foo: 123 } });

    expect(res1).to.be.an.instanceof(Function);
    expect(res2).to.be.an.instanceof(Function);
  });
});
