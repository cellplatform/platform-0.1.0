import { Row } from '..';
import { expect, getTestDb } from '../../test';

describe('model.Row', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'cell:abcd!1';
    const res1 = await Row.create({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-8d57facef4ccf6789fa5aa75d7b28f281238e6967df244f950dd1c4a1a97ef22',
    };

    await res1.set({ props: { foo: 123 }, hash: HASH.before }).save();

    const res2 = await Row.create({ db, uri }).ready;
    expect(res2.props.hash).to.eql(HASH.after);
    expect(res2.props.props).to.eql({ foo: 123 });
    expect(res2.props.error).to.eql(undefined);
  });

  it('updates hash on save', async () => {
    const db = await getTestDb({});
    const uri = 'cell:abcd!1';

    const model1 = await Row.create({ db, uri }).ready;
    expect(model1.props.hash).to.eql(undefined);

    await model1.set({ props: { height: 250 } }).save();
    expect(model1.props.hash).to.not.eql(undefined);

    const model2 = await Row.create({ db, uri }).ready;
    expect(model2.toObject().hash).to.eql(model1.props.hash);

    const before = model2.props.hash;
    await model2.set({ props: { height: 251 } }).save();
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
