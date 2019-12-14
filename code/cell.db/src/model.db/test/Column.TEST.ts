import { Column } from '..';
import { expect, getTestDb } from '../../test';

describe('model.Column', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'cell:abcd!A';
    const res1 = await Column.create({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-ca6a975b7583e2e10c5e2b18c32feb7d1c80f1a3806ffbe34b4472447b61be52',
    };

    await res1.set({ props: { foo: 123 }, hash: HASH.before }).save();

    const res2 = await Column.create({ db, uri }).ready;
    expect(res2.props.hash).to.eql(HASH.after);
    expect(res2.props.props).to.eql({ foo: 123 });
    expect(res2.props.error).to.eql(undefined);
  });

  it('updates hash on save (auto)', async () => {
    const db = await getTestDb({});
    const uri = 'cell:abcd!A';

    const model1 = await Column.create({ db, uri }).ready;
    expect(model1.props.hash).to.eql(undefined);

    await model1.set({ props: { width: 250 } }).save();
    expect(model1.props.hash).to.not.eql(undefined);

    const model2 = await Column.create({ db, uri }).ready;
    expect(model2.toObject().hash).to.eql(model1.props.hash);

    const before = model2.props.hash;
    await model2.set({ props: { width: 251 } }).save();
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
