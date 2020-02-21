import { Column } from '..';
import { expect, getTestDb, t } from '../../test';

type P = t.ICellProps;
type R = t.IRowProps & { grid: { height?: number } };
type C = t.IRowProps & { grid: { width?: number } };

describe('model.Column', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'cell:foo!A';
    const res1 = await Column.create<C>({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-0a11777152ffe2da35cf4548f605834e2e5c11e49c1392c4c1686573cb952853',
    };

    await res1.set({ props: { grid: { width: 300 } }, hash: HASH.before }).save();

    const res2 = await Column.create({ db, uri }).ready;

    expect(res2.props.hash).to.eql(HASH.after);
    expect(res2.props.props).to.eql({ grid: { width: 300 } });
    expect(res2.props.error).to.eql(undefined);
  });

  it('updates hash on save (auto)', async () => {
    const db = await getTestDb({});
    const uri = 'cell:foo!A';

    const model1 = await Column.create<C>({ db, uri }).ready;
    expect(model1.props.hash).to.eql(undefined);

    await model1.set({ props: { grid: { width: 250 } } }).save();
    expect(model1.props.hash).to.not.eql(undefined);

    const model2 = await Column.create<C>({ db, uri }).ready;
    expect(model2.toObject().hash).to.eql(model1.props.hash);

    const before = model2.props.hash;
    await model2.set({ props: { grid: { width: 251 } } }).save();
    expect(model2.props.hash).to.not.eql(before);

    const model3 = await Column.create({ db, uri }).ready;
    expect(model3.toObject().hash).to.eql(model2.props.hash);

    await (async () => {
      const before = model3.props.hash;
      await model3.save({ force: true });
      expect(model3.props.hash).to.eql(before); // NB: No change.
    })();
  });
});
