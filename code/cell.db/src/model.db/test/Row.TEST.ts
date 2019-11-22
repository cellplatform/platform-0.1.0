import { Row } from '..';
import { expect, getTestDb } from '../../test';

describe('model.Row', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });

    const uri = 'row:abcd!1';
    const res1 = await Row.create({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-4c706309ef9b942c560a6ad3809027dd7ca2fa1803a74d5bed010f6d311a5343',
    };

    await res1.set({ props: { foo: 123 }, hash: HASH.before }).save();

    const res2 = await Row.create({ db, uri }).ready;
    expect(res2.props.hash).to.eql(HASH.after);
    expect(res2.props.props).to.eql({ foo: 123 });
  });

  it('updates hash on save', async () => {
    const db = await getTestDb({});
    const uri = 'row:abcd!1';

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
