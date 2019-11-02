import { Cell, Ns } from '.';
import { expect, getTestDb } from '../test';

describe('model.Cell', () => {
  it('create', async () => {
    const db = await getTestDb({});
    const uri = 'cell:abcd!A1';
    const res1 = await Cell.create({ db, uri }).ready;

    const props = { style: { bold: true } };
    await res1.set({ props }).save();

    const res2 = await Cell.create({ db, uri }).ready;
    expect(res2.props.props).to.eql({ style: { bold: true } });
  });

  describe('namespaces (links)', () => {
    it('add', async () => {
      const db = await getTestDb({});
      // const uri = 'cell:abcd!A1';

      const uri = 'cell:abcd!A1';
      const cell1 = await Cell.create({ db, uri }).ready;
      const ns = await Ns.create({ db, uri: 'ns:foo' }).ready;

      // cell.doc.
      // parent.doc.nsRefs = [childNs.path];
      const namespaces = cell1.links.namespaces;

      namespaces.link([ns.path]);

      // cell.links

      console.log('parent.changes', cell1.changes);
      console.log('cell.links', cell1.links);

      await cell1.save();

      console.log('cell.isChanged', cell1.isChanged);

      // cell.links.namespaces

      const cell2 = await Cell.create({ db, uri }).ready;

      console.log('-------------------------------------------');

      const res = (await cell2.links.namespaces).map(ns => ns.path);

      console.log('cell.links', res);
    });
  });
});
