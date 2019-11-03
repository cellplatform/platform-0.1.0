import { Row } from '..';
import { expect, getTestDb } from '../../test';

describe('model.Row', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });

    const uri = 'row:abcd!1';
    const res1 = await Row.create({ db, uri }).ready;

    await res1.set({ props: { foo: 123 }, hash: '111' }).save();

    const res2 = await Row.create({ db, uri }).ready;
    expect(res2.props.hash).to.eql('111');
    expect(res2.props.props).to.eql({ foo: 123 });
  });
});
