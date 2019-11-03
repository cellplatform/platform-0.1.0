import { Column } from '..';
import { expect, t, getTestDb, time } from '../../test';

describe('model.Column', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'col:abcd!A';
    const res1 = await Column.create({ db, uri }).ready;

    await res1.set({ props: { foo: 123 }, hash: '111' }).save();

    const res2 = await Column.create({ db, uri }).ready;
    expect(res2.props.hash).to.eql('111');
    expect(res2.props.props).to.eql({ foo: 123 });
  });
});
