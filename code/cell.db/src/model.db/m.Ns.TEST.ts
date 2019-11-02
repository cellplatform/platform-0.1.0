import { model } from '.';
import { Schema } from '../schema';
import { expect, getTestDb, R } from '../test';

describe('model.Ns (Namespace)', () => {
  it('creates (with child cells)', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'ns:abc';
    const schema = Schema.ns(uri);

    await model.Cell.create({ db, uri: schema.cell('A1').uri })
      .set({ value: '123' })
      .save();

    await model.Cell.create({ db, uri: schema.cell('A2').uri })
      .set({ value: '456' })
      .save();

    const ns = model.Ns.create({ db, uri });
    expect((ns.props.props || {}).name).to.eql(undefined);
    expect(ns.props.hash).to.eql(undefined);

    const cells = (await ns.children.cells).map(c => c.toObject());
    expect(cells.length).to.eql(2);
    expect(cells[0].value).to.eql('123');
    expect(cells[1].value).to.eql('456');

    const rows = (await ns.children.rows).map(c => c.toObject());
    const cols = (await ns.children.columns).map(c => c.toObject());

    expect(rows).to.eql([]);
    expect(cols).to.eql([]);
  });

  it('stores props (name)', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'ns:abc';

    const ns1 = await model.Ns.create({ db, uri }).ready;
    await ns1.set({ props: { name: 'My Namespace' } }).save();

    const ns2 = await model.Ns.create({ db, uri }).ready;
    expect((ns2.props.props || {}).name).to.eql('My Namespace');
  });
});
