import { Cell, Ns } from '.';
import { expect, getTestDb } from '../test';

describe('model.Cell', () => {
  it('saves', async () => {
    const db = await getTestDb({});
    const uri = 'cell:abcd!A1';

    const res1 = await Cell.create({ db, uri }).ready;
    expect(res1.props.value).to.eql(undefined);
    expect(res1.props.props).to.eql(undefined);
    expect(res1.props.links).to.eql(undefined);
    expect(res1.props.error).to.eql(undefined);
    expect(res1.props.hash).to.eql(undefined);

    const hash = 'sha256-abc123';
    const value = '=A2';
    const error = { type: 'FAIL', message: 'Boo' };
    const links = { main: 'ns:foo' };
    const props = { style: { bold: true } };
    await res1.set({ value, props, links, error, hash }).save();

    const res2 = await Cell.create({ db, uri }).ready;
    expect(res2.props.value).to.eql(value);
    expect(res2.props.props).to.eql(props);
    expect(res2.props.links).to.eql(links);
    expect(res2.props.error).to.eql(error);
    expect(res2.props.hash).to.eql(hash);
  });

  describe.skip('namespaces (links)', () => {
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
