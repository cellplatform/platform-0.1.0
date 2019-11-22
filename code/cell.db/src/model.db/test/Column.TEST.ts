import { Column } from '..';
import { expect, getTestDb } from '../../test';

describe('model.Column', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'col:abcd!A';
    const res1 = await Column.create({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-1bcd59adb53a292e84018b78f95707add8b3c3aab4eab6c79e089644946390a2',
    };

    await res1.set({ props: { foo: 123 }, hash: HASH.before }).save();

    const res2 = await Column.create({ db, uri }).ready;
    expect(res2.props.hash).to.eql(HASH.after);
    expect(res2.props.props).to.eql({ foo: 123 });
  });

  it('updates hash on save (auto)', async () => {
    const db = await getTestDb({});
    const uri = 'col:abcd!A';

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
