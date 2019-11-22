import { Column } from '..';
import { expect, getTestDb } from '../../test';

describe('model.Column', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'col:abcd!A';
    const res1 = await Column.create({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-4f98f14a90ea65d79f879cc36f0f1c9419f7b713714687207bc22fedbec566c5',
    };

    await res1.set({ props: { foo: 123 }, hash: HASH.before }).save();

    const res2 = await Column.create({ db, uri }).ready;
    expect(res2.props.hash).to.eql(HASH.after);
    expect(res2.props.props).to.eql({ foo: 123 });
  });

  it('updates hash on save', async () => {
    const db = await getTestDb({});
    const uri = 'col:abcd!A';

    const model1 = await Column.create({ db, uri }).ready;
    expect(model1.props.hash).to.eql(undefined);

    await model1.set({ props: { width: 250 } }).save();
    expect(model1.props.hash).to.not.eql(undefined);

    const model2 = await Column.create({ db, uri }).ready;
    expect(model2.toObject().hash).to.eql(model1.props.hash);
  });
});
