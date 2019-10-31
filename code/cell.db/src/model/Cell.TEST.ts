import { Cell } from '.';
import { expect, getTestDb } from '../test';

describe('model.Cell', () => {
  it('create', async () => {
    const db = await getTestDb({});

    const uri = 'cell:abcd!A1';
    const res1 = await Cell.create({ db, uri }).ready;

    await res1.set({ key: 'A1' }).save();

    const res2 = await Cell.create({ db, uri }).ready;
    expect(res2.props.key).to.eql('A1');
  });
});
