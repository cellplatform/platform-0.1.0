import { Column } from '.';
import { expect, getTestDb } from '../test';

describe('model.Column', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });

    const uri = 'col:123456:abc';
    const res1 = await Column.create({ db, uri }).ready;

    await res1.set({ key: 'A' }).save();

    const res2 = await Column.create({ db, uri }).ready;
    expect(res2.props.key).to.eql('A');
  });
});
