import { Row } from '..';
import { expect, getTestDb, t } from '../../test';

type P = t.ICellProps;
type R = t.IRowProps & { grid: { height?: number } };
type C = t.IRowProps & { grid: { width?: number } };

describe('model.Row', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'cell:foo:1';
    const res1 = await Row.create<R>({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-4b2ba8c234c48e62c0ccfa61f53943f325d2804edfd68dcc8d902d5ae6fdac7c',
    };

    await res1.set({ props: { grid: { height: 50 } }, hash: HASH.before }).save();
    const res2 = await Row.create({ db, uri }).ready;

    expect(res2.props.hash).to.eql(HASH.after);
    expect(res2.props.props).to.eql({ grid: { height: 50 } });
    expect(res2.props.error).to.eql(undefined);
  });

  it('updates hash on save', async () => {
    const db = await getTestDb({});
    const uri = 'cell:foo:1';

    const model1 = await Row.create<R>({ db, uri }).ready;
    expect(model1.props.hash).to.eql(undefined);

    await model1.set({ props: { grid: { height: 250 } } }).save();
    expect(model1.props.hash).to.not.eql(undefined);

    const model2 = await Row.create<R>({ db, uri }).ready;
    expect(model2.toObject().hash).to.eql(model1.props.hash);

    const before = model2.props.hash;
    await model2.set({ props: { grid: { height: 251 } } }).save();
    expect(model2.props.hash).to.not.eql(before);

    const model3 = await Row.create({ db, uri }).ready;
    expect(model3.toObject().hash).to.eql(model2.props.hash);

    await (async () => {
      const before = model3.props.hash;
      await model3.save({ force: true });
      expect(model3.props.hash).to.eql(before); // NB: No change.
    })();
  });
});
