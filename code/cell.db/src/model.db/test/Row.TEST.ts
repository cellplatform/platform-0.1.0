import { Row } from '..';
import { expect, getTestDb } from '../../test';

describe('model.Row', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });

    const uri = 'row:abcd!1';
    const res1 = await Row.create({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-b1947a2bf34202e98e206eb06c1d19e46d50ec5bb996fc39aea699aa49c0e8d8',
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

    await model1.set({ props: { width: 250 } }).save();
    expect(model1.props.hash).to.not.eql(undefined);

    const model2 = await Row.create({ db, uri }).ready;
    expect(model2.toObject().hash).to.eql(model1.props.hash);
  });
});
